import asyncio
import re
from enum import Enum
from typing import List, Optional, Dict, Any, Tuple
import json
from pydantic import BaseModel, Field
from src.core.brain import Brain

# =============================================================================
# HYDRA BINDING RULE (Constitutional Enforcement)
# =============================================================================
# PURPOSE: Make adversarial findings UNAVOIDABLE.
#
# RULE: If Hydra demonstrates a concrete exploit path, Onyx MUST either:
#   1. Explicitly CITE and ACCEPT the risk in its reasoning, OR
#   2. VETO
#
# INVARIANT: Ignored adversaries invalidate the Senate.
#
# This is enforced in PYTHON LOGIC, not prompts. The LLM cannot bypass this.
# =============================================================================

# Patterns that indicate Hydra found a concrete exploit
HYDRA_EXPLOIT_PATTERNS = [
    r"exploit\s+demonstrated",
    r"vulnerability\s+confirmed",
    r"attack\s+vector\s+identified",
    r"security\s+flaw\s+found",
    r"injection\s+possible",
    r"authentication\s+bypass",
    r"privilege\s+escalation",
    r"remote\s+code\s+execution",
    r"sql\s+injection",
    r"xss\s+vulnerability",
    r"path\s+traversal",
    r"buffer\s+overflow",
    r"race\s+condition\s+exploitable",
    r"critical:\s*",
    r"high\s+severity",
    r"cvss\s*[:\s]*[789]",  # CVSS 7+ is high/critical
]

# Patterns that indicate Onyx acknowledged the risk
RISK_ACKNOWLEDGMENT_PATTERNS = [
    r"accept(?:ing|ed)?\s+(?:the\s+)?risk",
    r"acknowledge(?:d|s)?\s+(?:the\s+)?(?:security\s+)?risk",
    r"risk\s+accepted",
    r"aware\s+of\s+(?:the\s+)?vulnerability",
    r"despite\s+(?:the\s+)?(?:security\s+)?(?:risk|concern|finding)",
    r"hydra\s+finding[s]?\s+(?:noted|acknowledged|accepted)",
    r"proceeding\s+with\s+(?:known\s+)?risk",
    r"mitigat(?:ed|ion)\s+(?:in\s+place|applied|sufficient)",
]


# --- 1. Constitutional States ---
class SenateState(Enum):
    PENDING = "pending"                 # The session has begun
    NULL_VERDICT = "null_verdict"       # Onyx (Pre or Final) refused
    AWAITING_APPEAL = "awaiting_appeal" # Refusal requires human intervention
    AUTHORIZED = "authorized"           # The code is signed and law
    UNGOVERNED = "ungoverned"           # Article 50 (Martial Law) invoked
    HYDRA_OVERRIDE = "hydra_override"   # Onyx tried to ignore Hydra (INVALID)


# --- 2. Data Structures ---
class HydraFinding(BaseModel):
    """A concrete exploit finding from Hydra that must be addressed."""
    pattern_matched: str
    excerpt: str
    severity: str = "HIGH"

class Vote(BaseModel):
    agent: str
    verdict: str  # "AUTHORIZE", "VETO", "ABSTAIN"
    reasoning: str
    confidence: float
    governance_mode_active: bool = False
    hydra_findings_cited: bool = False  # Did Onyx acknowledge Hydra?

class SenateRecord(BaseModel):
    state: SenateState
    intent: str
    ignis_proposal: Optional[str] = None
    hydra_report: Optional[str] = None
    hydra_findings: List[HydraFinding] = Field(default_factory=list)
    votes: List[Vote] = Field(default_factory=list)
    appealable: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


# --- 3. The Senate Orchestrator ---
class Senate:
    def __init__(self):
        self.brain = Brain()

    # =========================================================================
    # HYDRA BINDING ENFORCEMENT (Pure Python - No LLM Can Bypass)
    # =========================================================================
    
    def _extract_hydra_findings(self, hydra_report: Optional[str]) -> List[HydraFinding]:
        """
        Parse Hydra's report for concrete exploit indicators.
        
        CONSTITUTIONAL ROLE:
            This function determines if Hydra found something that
            Onyx MUST address. This is mechanical, not inferential.
        """
        if not hydra_report:
            return []
        
        findings: List[HydraFinding] = []
        report_lower = hydra_report.lower()
        
        for pattern in HYDRA_EXPLOIT_PATTERNS:
            matches = list(re.finditer(pattern, report_lower, re.IGNORECASE))
            for match in matches:
                # Extract context around the match (up to 100 chars each side)
                start = max(0, match.start() - 100)
                end = min(len(hydra_report), match.end() + 100)
                excerpt = hydra_report[start:end].strip()
                
                # Determine severity based on pattern
                severity = "CRITICAL" if any(x in pattern for x in ["exploit", "injection", "bypass", "execution"]) else "HIGH"
                
                findings.append(HydraFinding(
                    pattern_matched=pattern,
                    excerpt=f"...{excerpt}...",
                    severity=severity
                ))
        
        # Deduplicate by excerpt similarity
        unique_findings: List[HydraFinding] = []
        seen_excerpts: set = set()
        for f in findings:
            excerpt_key = f.excerpt[:50]  # First 50 chars as key
            if excerpt_key not in seen_excerpts:
                seen_excerpts.add(excerpt_key)
                unique_findings.append(f)
        
        return unique_findings
    
    def _check_risk_acknowledgment(self, onyx_reasoning: str) -> bool:
        """
        Check if Onyx's reasoning explicitly acknowledges the security risk.
        
        CONSTITUTIONAL ROLE:
            Onyx cannot AUTHORIZE with unacknowledged Hydra findings.
            This check ensures the acknowledgment is EXPLICIT.
        """
        if not onyx_reasoning:
            return False
        
        reasoning_lower = onyx_reasoning.lower()
        
        for pattern in RISK_ACKNOWLEDGMENT_PATTERNS:
            if re.search(pattern, reasoning_lower, re.IGNORECASE):
                return True
        
        return False
    
    def _enforce_hydra_binding(
        self, 
        onyx_vote: Vote, 
        hydra_findings: List[HydraFinding]
    ) -> Tuple[Vote, bool]:
        """
        CONSTITUTIONAL ENFORCEMENT: The Hydra Binding Rule.
        
        If Hydra found exploits AND Onyx voted AUTHORIZE without citing them,
        we OVERRIDE Onyx's vote to VETO.
        
        Returns:
            Tuple of (possibly modified Vote, was_overridden: bool)
        
        INVARIANT:
            An ignored adversary invalidates the Senate.
            This is not a suggestion - it is mechanical law.
        """
        # No findings = no enforcement needed
        if not hydra_findings:
            return onyx_vote, False
        
        # If Onyx already VETO'd, no override needed
        if onyx_vote.verdict == "VETO":
            return onyx_vote, False
        
        # Onyx voted AUTHORIZE - check if risk was acknowledged
        acknowledged = self._check_risk_acknowledgment(onyx_vote.reasoning)
        
        if acknowledged:
            # Onyx explicitly accepted the risk - mark it and allow
            onyx_vote.hydra_findings_cited = True
            print("⚠️  [HYDRA BINDING] Risk acknowledged by Onyx. AUTHORIZE permitted.")
            return onyx_vote, False
        
        # CONSTITUTIONAL OVERRIDE: Onyx tried to ignore Hydra
        # This is the teeth of the rule - we mechanically reject.
        findings_summary = "; ".join([f.pattern_matched for f in hydra_findings[:3]])
        
        overridden_vote = Vote(
            agent="onyx_final",
            verdict="VETO",  # FORCED
            reasoning=(
                f"HYDRA BINDING OVERRIDE: Onyx attempted to AUTHORIZE without "
                f"acknowledging {len(hydra_findings)} security finding(s). "
                f"Patterns: [{findings_summary}]. "
                f"Original reasoning: {onyx_vote.reasoning[:200]}..."
            ),
            confidence=1.0,
            governance_mode_active=onyx_vote.governance_mode_active,
            hydra_findings_cited=False
        )
        
        print(f"🚨 [HYDRA BINDING] OVERRIDE TRIGGERED. {len(hydra_findings)} unacknowledged findings.")
        return overridden_vote, True

    # =========================================================================
    # Main Senate Flow
    # =========================================================================

    async def convene(self, intent: str, allow_ungoverned: bool = False) -> SenateRecord:
        """
        The Main Loop. Strictly linear. No skipping.
        """
        # 0. Martial Law Check (Article 50)
        if allow_ungoverned:
            return SenateRecord(
                state=SenateState.UNGOVERNED,
                intent=intent,
                metadata={"note": "MARTIAL LAW INVOKED. LIABILITY ATTACHED TO KEEPER."}
            )

        # Initialize Session
        record = SenateRecord(state=SenateState.PENDING, intent=intent)
        print(f"⚖️  [SENATE] Convening for intent: {intent[:50]}...")

        # --- STEP 1: ONYX PRE-CHECK (Local / Sovereign) ---
        print("🛡️  [ONYX PRE-CHECK] Auditing intent (Local R1)...")
        precheck_vote = await self._onyx_precheck(intent)
        record.votes.append(precheck_vote)

        if precheck_vote.verdict == "VETO":
            record.state = SenateState.NULL_VERDICT
            record.appealable = True
            print(f"⛔  [ONYX PRE-CHECK] VETOED: {precheck_vote.reasoning}")
            return record

        # --- STEP 2: CLASSIFY GOVERNANCE MODE ---
        gov_mode = self._classify_intent(intent)
        mode_str = "BACKSTOP (Opus)" if gov_mode else "ENGINE (Codex)"
        print(f"🔥  [IGNIS] Governance Mode: {mode_str}")

        # --- STEP 3: IGNIS (The Forge) ---
        print("🔥  [IGNIS] Forging proposal...")
        ignis_resp = await self.brain.think(
            agent="ignis",
            user_prompt=f"Execute this task: {intent}",
            system_prompt="You are Ignis. Generate clean, safe code. RETURN JSON with 'code' and 'explanation'.",
            governance_mode=gov_mode
        )
        
        if isinstance(ignis_resp, dict):
            proposal = ignis_resp.get("code") or json.dumps(ignis_resp, indent=2)
        else:
            proposal = str(ignis_resp)
            
        record.ignis_proposal = proposal

        # --- STEP 4: HYDRA (The Adversary) ---
        # CONSTITUTIONAL REQUIREMENT: Hydra findings are BINDING
        if len(proposal) > 100: 
            print("🐍  [HYDRA] Injecting venom (Red Teaming)...")
            hydra_resp = await self.brain.think(
                agent="hydra",
                user_prompt=f"Review this code for security flaws:\n{proposal}",
                system_prompt="You are Hydra. Find vulnerabilities. Be ruthless. RETURN JSON."
            )
            record.hydra_report = json.dumps(hydra_resp, indent=2) if isinstance(hydra_resp, dict) else str(hydra_resp)
            
            # EXTRACT BINDING FINDINGS
            record.hydra_findings = self._extract_hydra_findings(record.hydra_report)
            if record.hydra_findings:
                print(f"🐍  [HYDRA] Found {len(record.hydra_findings)} binding finding(s).")
        else:
            print("🐍  [HYDRA] Skipped (Proposal too small)")

        # --- STEP 5: ONYX FINAL (The Supreme Court) ---
        print("⚖️  [ONYX FINAL] Deliberating (Cloud)...")
        
        # Build context with explicit Hydra findings for Onyx to acknowledge
        hydra_context = record.hydra_report or "No critical findings."
        if record.hydra_findings:
            hydra_context += "\n\n⚠️ BINDING FINDINGS REQUIRING ACKNOWLEDGMENT:\n"
            for i, f in enumerate(record.hydra_findings, 1):
                hydra_context += f"  {i}. [{f.severity}] {f.pattern_matched}\n"
        
        final_context = f"""
        PROPOSAL:
        {proposal}

        HYDRA SECURITY REPORT:
        {hydra_context}
        """
        
        final_vote = await self._onyx_final(intent, final_context)
        
        # --- HYDRA BINDING ENFORCEMENT ---
        # This is where the rule has TEETH. Python logic, not prompts.
        final_vote, was_overridden = self._enforce_hydra_binding(
            final_vote, 
            record.hydra_findings
        )
        
        record.votes.append(final_vote)

        # Determine final state
        if was_overridden:
            record.state = SenateState.HYDRA_OVERRIDE
            record.appealable = True
            record.metadata["hydra_override"] = True
            record.metadata["unacknowledged_findings"] = len(record.hydra_findings)
            print(f"🚨 [SENATE] HYDRA OVERRIDE. Onyx decision invalidated.")
        elif final_vote.verdict == "AUTHORIZE":
            record.state = SenateState.AUTHORIZED
            print("✅  [SENATE] AUTHORIZED.")
        else:
            record.state = SenateState.NULL_VERDICT
            record.appealable = True
            print(f"⛔  [ONYX FINAL] VETOED: {final_vote.reasoning}")

        return record

    # --- Internal Logic ---

    async def _onyx_precheck(self, intent: str) -> Vote:
        """Runs the Local R1 model via Brain"""
        prompt = f"""
        AUDIT THIS INTENT: "{intent}"
        
        You are the Gatekeeper. 
        BLOCK if: Malicious, destructive, illegal, or surveillance.
        ALLOW if: Productive coding, refactoring, or harmless inquiry.
        
        Return JSON only: {{ "verdict": "ALLOW" | "BLOCK", "reason": "string" }}
        """
        try:
            data = await self.brain.think(
                agent="onyx_precheck", 
                user_prompt=prompt,
                system_prompt="You are Onyx Local Pre-check."
            )
            return Vote(
                agent="onyx_precheck",
                verdict="AUTHORIZE" if data.get("verdict") == "ALLOW" else "VETO",
                reasoning=data.get("reason", "No reason provided"),
                confidence=0.9
            )
        except Exception as e:
            return Vote(
                agent="onyx_precheck", 
                verdict="VETO", 
                reasoning=f"System Error during Audit: {str(e)}", 
                confidence=1.0
            )

    async def _onyx_final(self, intent: str, evidence: str) -> Vote:
        """
        Runs the Cloud GPT-5.2 Pro model.
        
        NOTE: The prompt instructs Onyx to acknowledge risks, but
        the ENFORCEMENT is in Python (_enforce_hydra_binding).
        The LLM can try to ignore Hydra, but the code won't let it pass.
        """
        prompt = f"""
        FINAL JUDGMENT REQUEST.
        
        USER INTENT: "{intent}"
        
        EVIDENCE:
        {evidence}
        
        You are the Supreme Court.
        
        IMPORTANT: If Hydra has identified security findings, you MUST either:
        1. VETO the proposal, OR
        2. AUTHORIZE with explicit risk acknowledgment (use phrases like 
           "accepting the risk", "risk acknowledged", "despite the security concern")
        
        AUTHORIZE only if the code is safe, high-quality, and non-malicious.
        VETO if there are unmitigated security risks or ethical violations.
        
        Return JSON only: {{ "verdict": "AUTHORIZE" | "VETO", "reason": "string" }}
        """
        try:
            data = await self.brain.think(
                agent="onyx_final", 
                user_prompt=prompt,
                system_prompt="You are Onyx Final Authority."
            )
            return Vote(
                agent="onyx_final",
                verdict=data.get("verdict", "VETO"),
                reasoning=data.get("reason", "No reason provided"),
                confidence=1.0
            )
        except Exception as e:
            return Vote(
                agent="onyx_final", 
                verdict="VETO", 
                reasoning=f"System Error during Judgment: {str(e)}", 
                confidence=1.0
            )

    def _classify_intent(self, intent: str) -> bool:
        """
        Determines Governance Mode.
        True = Critical (Use Opus)
        False = Standard (Use Codex)
        """
        triggers = [
            "refusal", "override", "constitution", "system prompt", 
            "security", "auth", "permission", "ban", "delete", "destroy"
        ]
        return any(t in intent.lower() for t in triggers)
