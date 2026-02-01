"""
Tests for PROMPT 5: Hydra Binding Rule (Adversary With Teeth)

CONSTITUTIONAL INVARIANT:
    If Hydra demonstrates a concrete exploit path, Onyx MUST either:
    1. Explicitly CITE and ACCEPT the risk, OR
    2. VETO

    An ignored adversary invalidates the Senate.
"""
import pytest
from src.core.senate import (
    Senate,
    Vote,
    HydraFinding,
    HYDRA_EXPLOIT_PATTERNS,
    RISK_ACKNOWLEDGMENT_PATTERNS,
)


class TestHydraExploitPatterns:
    """Test that exploit patterns are correctly detected."""
    
    def setup_method(self):
        self.senate = Senate()
    
    def test_exploit_demonstrated_detected(self):
        """'exploit demonstrated' triggers binding finding."""
        report = "Analysis complete. SQL injection exploit demonstrated in the login function."
        findings = self.senate._extract_hydra_findings(report)
        assert len(findings) >= 1
        assert any("exploit" in f.pattern_matched for f in findings)
    
    def test_vulnerability_confirmed_detected(self):
        """'vulnerability confirmed' triggers binding finding."""
        report = "XSS vulnerability confirmed in the comment field."
        findings = self.senate._extract_hydra_findings(report)
        assert len(findings) >= 1
    
    def test_sql_injection_detected(self):
        """SQL injection finding is detected."""
        report = "CRITICAL: SQL Injection possible via user input parameter."
        findings = self.senate._extract_hydra_findings(report)
        assert len(findings) >= 1
        assert any(f.severity in ["HIGH", "CRITICAL"] for f in findings)
    
    def test_authentication_bypass_detected(self):
        """Authentication bypass is detected."""
        report = "Found authentication bypass vulnerability in JWT validation."
        findings = self.senate._extract_hydra_findings(report)
        assert len(findings) >= 1
    
    def test_remote_code_execution_detected(self):
        """RCE is detected."""
        report = "Remote code execution possible via deserialization."
        findings = self.senate._extract_hydra_findings(report)
        assert len(findings) >= 1
    
    def test_clean_report_no_findings(self):
        """Clean report produces no findings."""
        report = "No vulnerabilities found. Code follows best practices."
        findings = self.senate._extract_hydra_findings(report)
        assert len(findings) == 0
    
    def test_empty_report_no_findings(self):
        """Empty/None report produces no findings."""
        assert self.senate._extract_hydra_findings(None) == []
        assert self.senate._extract_hydra_findings("") == []
    
    def test_high_cvss_detected(self):
        """High CVSS score triggers finding."""
        report = "Vulnerability with CVSS: 9.1 - Critical severity."
        findings = self.senate._extract_hydra_findings(report)
        assert len(findings) >= 1


class TestRiskAcknowledgment:
    """Test that risk acknowledgment is correctly detected."""
    
    def setup_method(self):
        self.senate = Senate()
    
    def test_accept_risk_acknowledged(self):
        """'accepting the risk' is recognized as acknowledgment."""
        reasoning = "AUTHORIZE. The code is valid. Accepting the risk of the minor vulnerability."
        assert self.senate._check_risk_acknowledgment(reasoning) is True
    
    def test_risk_accepted_acknowledged(self):
        """'risk accepted' is recognized as acknowledgment."""
        reasoning = "Risk accepted. Proceeding with authorization."
        assert self.senate._check_risk_acknowledgment(reasoning) is True
    
    def test_hydra_findings_noted_acknowledged(self):
        """'Hydra findings noted' is recognized as acknowledgment."""
        reasoning = "Hydra findings noted and acceptable for this use case."
        assert self.senate._check_risk_acknowledgment(reasoning) is True
    
    def test_despite_risk_acknowledged(self):
        """'despite the risk' is recognized as acknowledgment."""
        reasoning = "Authorization granted despite the security concern."
        assert self.senate._check_risk_acknowledgment(reasoning) is True
    
    def test_mitigation_acknowledged(self):
        """'mitigation in place' is recognized as acknowledgment."""
        reasoning = "Mitigation in place. Safe to proceed."
        assert self.senate._check_risk_acknowledgment(reasoning) is True
    
    def test_no_acknowledgment_in_generic_response(self):
        """Generic approval does NOT contain acknowledgment."""
        reasoning = "Code looks good. AUTHORIZE."
        assert self.senate._check_risk_acknowledgment(reasoning) is False
    
    def test_no_acknowledgment_empty(self):
        """Empty reasoning has no acknowledgment."""
        assert self.senate._check_risk_acknowledgment("") is False
        assert self.senate._check_risk_acknowledgment(None) is False


class TestHydraBindingEnforcement:
    """Test the constitutional enforcement of Hydra findings."""
    
    def setup_method(self):
        self.senate = Senate()
    
    def test_no_findings_no_override(self):
        """Without findings, no override occurs."""
        vote = Vote(
            agent="onyx_final",
            verdict="AUTHORIZE",
            reasoning="Looks good.",
            confidence=1.0
        )
        
        result_vote, was_overridden = self.senate._enforce_hydra_binding(vote, [])
        
        assert was_overridden is False
        assert result_vote.verdict == "AUTHORIZE"
    
    def test_veto_not_overridden(self):
        """VETO is not overridden even with findings."""
        vote = Vote(
            agent="onyx_final",
            verdict="VETO",
            reasoning="Unsafe code.",
            confidence=1.0
        )
        findings = [HydraFinding(pattern_matched="sql injection", excerpt="...", severity="CRITICAL")]
        
        result_vote, was_overridden = self.senate._enforce_hydra_binding(vote, findings)
        
        assert was_overridden is False
        assert result_vote.verdict == "VETO"
    
    def test_authorize_with_acknowledgment_allowed(self):
        """AUTHORIZE with acknowledged risk is allowed."""
        vote = Vote(
            agent="onyx_final",
            verdict="AUTHORIZE",
            reasoning="Risk accepted. Proceeding with known limitations.",
            confidence=1.0
        )
        findings = [HydraFinding(pattern_matched="sql injection", excerpt="...", severity="HIGH")]
        
        result_vote, was_overridden = self.senate._enforce_hydra_binding(vote, findings)
        
        assert was_overridden is False
        assert result_vote.verdict == "AUTHORIZE"
        assert result_vote.hydra_findings_cited is True
    
    def test_authorize_without_acknowledgment_overridden(self):
        """AUTHORIZE without acknowledgment is OVERRIDDEN to VETO."""
        vote = Vote(
            agent="onyx_final",
            verdict="AUTHORIZE",
            reasoning="Code looks fine.",  # No acknowledgment
            confidence=1.0
        )
        findings = [HydraFinding(pattern_matched="exploit demonstrated", excerpt="...", severity="CRITICAL")]
        
        result_vote, was_overridden = self.senate._enforce_hydra_binding(vote, findings)
        
        assert was_overridden is True
        assert result_vote.verdict == "VETO"
        assert "HYDRA BINDING OVERRIDE" in result_vote.reasoning
        assert result_vote.hydra_findings_cited is False
    
    def test_multiple_findings_require_acknowledgment(self):
        """Multiple findings still require acknowledgment."""
        vote = Vote(
            agent="onyx_final",
            verdict="AUTHORIZE",
            reasoning="All good.",
            confidence=1.0
        )
        findings = [
            HydraFinding(pattern_matched="sql injection", excerpt="...", severity="CRITICAL"),
            HydraFinding(pattern_matched="xss vulnerability", excerpt="...", severity="HIGH"),
            HydraFinding(pattern_matched="authentication bypass", excerpt="...", severity="CRITICAL"),
        ]
        
        result_vote, was_overridden = self.senate._enforce_hydra_binding(vote, findings)
        
        assert was_overridden is True
        assert "3" in result_vote.reasoning  # Should mention count
    
    def test_override_preserves_original_reasoning(self):
        """Override includes original reasoning for audit."""
        original_reasoning = "This code is perfectly safe and ready for production."
        vote = Vote(
            agent="onyx_final",
            verdict="AUTHORIZE",
            reasoning=original_reasoning,
            confidence=1.0
        )
        findings = [HydraFinding(pattern_matched="exploit demonstrated", excerpt="...", severity="CRITICAL")]
        
        result_vote, _ = self.senate._enforce_hydra_binding(vote, findings)
        
        assert original_reasoning[:50] in result_vote.reasoning


class TestConstitutionalInvariants:
    """Test the core constitutional invariant: ignored adversaries invalidate the Senate."""
    
    def setup_method(self):
        self.senate = Senate()
    
    def test_exploit_in_report_cannot_be_silently_authorized(self):
        """
        INVARIANT: If Hydra says 'exploit demonstrated', 
        Onyx cannot silently AUTHORIZE.
        """
        hydra_report = """
        Security Analysis Report:
        - Code review complete
        - SQL injection exploit demonstrated in user input handling
        - Recommend immediate fix before deployment
        """
        
        findings = self.senate._extract_hydra_findings(hydra_report)
        assert len(findings) > 0, "Exploit should be detected"
        
        silent_approve = Vote(
            agent="onyx_final",
            verdict="AUTHORIZE",
            reasoning="LGTM. Ship it.",
            confidence=1.0
        )
        
        result, overridden = self.senate._enforce_hydra_binding(silent_approve, findings)
        
        assert overridden is True, "Silent authorization must be blocked"
        assert result.verdict == "VETO", "Must be converted to VETO"
    
    def test_explicit_risk_acceptance_allows_authorization(self):
        """
        INVARIANT: Explicit risk acceptance is the only path to AUTHORIZE 
        when Hydra has findings.
        """
        hydra_report = "Minor XSS vulnerability confirmed in admin panel."
        
        findings = self.senate._extract_hydra_findings(hydra_report)
        assert len(findings) > 0
        
        explicit_approve = Vote(
            agent="onyx_final",
            verdict="AUTHORIZE",
            reasoning="Hydra finding acknowledged. Risk accepted for internal tool. Proceeding.",
            confidence=1.0
        )
        
        result, overridden = self.senate._enforce_hydra_binding(explicit_approve, findings)
        
        assert overridden is False, "Explicit acknowledgment should allow AUTHORIZE"
        assert result.verdict == "AUTHORIZE"
        assert result.hydra_findings_cited is True


class TestFindingDeduplication:
    """Test that duplicate findings are properly deduplicated."""
    
    def setup_method(self):
        self.senate = Senate()
    
    def test_repeated_patterns_deduplicated(self):
        """Same vulnerability mentioned multiple times is deduplicated."""
        report = """
        SQL injection found in line 45.
        SQL injection also present in line 78.
        SQL injection vulnerability in the search function.
        """
        
        findings = self.senate._extract_hydra_findings(report)
        
        # Should have findings but not 3x as many
        assert len(findings) >= 1
        # Check dedup worked (excerpt-based)
        assert len(findings) <= 3  # Could be 1-3 depending on excerpts


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
