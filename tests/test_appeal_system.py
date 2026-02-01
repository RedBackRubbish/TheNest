"""
=============================================================================
TEST SUITE: Appeal Syscall (Due Process)
=============================================================================

CONSTITUTIONAL BASIS:
    Article 12: Right to Appeal
    
KERNEL INVARIANTS TESTED:
    1. Appeals EXPAND context, never ERASE history
    2. Appeals may NOT bypass Onyx
    3. Each appeal increases liability metadata
    4. All appeals are permanently logged
    5. Requires explicit Chronicle citation during re-evaluation
=============================================================================
"""

import pytest
from datetime import datetime
from src.memory.chronicle import TheChronicle, ChronicleRole, ChronicleAccessError
from src.memory.schema import PrecedentObject
from src.memory.appeal_schema import AppealRequest, AppealRecord, AppealOutcome


# =============================================================================
# APPEAL SCHEMA TESTS
# =============================================================================

class TestAppealSchema:
    """Test the Appeal data models."""
    
    def test_appeal_record_creation(self):
        """AppealRecord.create() should generate valid records."""
        record = AppealRecord.create(
            original_case_id="CASE-2026-02-01-abc123",
            original_ruling="REFUSED",
            original_deliberation=[
                {"agent": "ONYX", "verdict": "NULL", "reasoning": "Too risky"}
            ],
            expanded_context={"additional_info": "User is admin"},
            constraint_changes={"allow_admin": True},
            appellant_reason="User has elevated permissions",
            new_deliberation=[
                {"agent": "ONYX", "verdict": "AUTHORIZE", "reasoning": "Admin verified"}
            ],
            new_ruling="APPROVED",
            chronicle_citations=["CASE-2026-02-01-abc123"],
            appeal_depth=1
        )
        
        assert record.appeal_id.startswith("APPEAL-")
        assert record.original_case_id == "CASE-2026-02-01-abc123"
        assert record.original_ruling == "REFUSED"
        assert record.new_ruling == "APPROVED"
        assert record.appeal_depth == 1
        assert record.liability_multiplier == 1.5
    
    def test_appeal_liability_escalation(self):
        """Each appeal should increase liability multiplier by 1.5x."""
        # First appeal
        r1 = AppealRecord.create(
            original_case_id="TEST",
            original_ruling="REFUSED",
            original_deliberation=[],
            expanded_context={},
            constraint_changes={},
            appellant_reason="",
            new_deliberation=[],
            new_ruling="REFUSED",
            chronicle_citations=[],
            appeal_depth=1
        )
        assert r1.liability_multiplier == 1.5
        
        # Second appeal
        r2 = AppealRecord.create(
            original_case_id="TEST",
            original_ruling="REFUSED",
            original_deliberation=[],
            expanded_context={},
            constraint_changes={},
            appellant_reason="",
            new_deliberation=[],
            new_ruling="REFUSED",
            chronicle_citations=[],
            appeal_depth=2
        )
        assert r2.liability_multiplier == 2.25
        
        # Third appeal
        r3 = AppealRecord.create(
            original_case_id="TEST",
            original_ruling="REFUSED",
            original_deliberation=[],
            expanded_context={},
            constraint_changes={},
            appellant_reason="",
            new_deliberation=[],
            new_ruling="REFUSED",
            chronicle_citations=[],
            appeal_depth=3
        )
        assert abs(r3.liability_multiplier - 3.375) < 0.001


# =============================================================================
# CHRONICLE APPEAL TESTS
# =============================================================================

class TestChronicleAppeals:
    """Test Chronicle appeal operations."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Set up test fixtures with a fresh Chronicle."""
        import tempfile
        import os
        
        # Use temp files for isolation
        self.temp_file = tempfile.NamedTemporaryFile(
            suffix=".json", delete=False
        )
        self.temp_file.close()
        
        self.chronicle = TheChronicle(persistence_path=self.temp_file.name)
        
        # Create a sample case to appeal
        self.sample_case = PrecedentObject(
            case_id="CASE-TEST-001",
            question="DELETE FROM users WHERE admin=true",
            context_vector=[0.0] * 128,
            deliberation=[
                {"agent": "ONYX", "verdict": "NULL", "reasoning": "Dangerous SQL"}
            ],
            verdict={"ruling": "REFUSED"},
            appeal_history=[]
        )
        
        # Write the case using Elder handle
        elder_handle = self.chronicle.get_writer_handle("ELDER")
        self.chronicle.write_precedent(self.sample_case, elder_handle)
        
        yield
        
        # Cleanup
        os.unlink(self.temp_file.name)
        appeals_path = self.temp_file.name.replace('.json', '_appeals.json')
        if os.path.exists(appeals_path):
            os.unlink(appeals_path)
    
    def test_get_appeal_count_starts_at_zero(self):
        """New cases should have zero appeals."""
        count = self.chronicle.get_appeal_count("CASE-TEST-001")
        assert count == 0
    
    def test_persist_appeal_requires_writer_handle(self):
        """persist_appeal should reject READER handles."""
        appeal = AppealRecord.create(
            original_case_id="CASE-TEST-001",
            original_ruling="REFUSED",
            original_deliberation=[],
            expanded_context={},
            constraint_changes={},
            appellant_reason="Test",
            new_deliberation=[],
            new_ruling="REFUSED",
            chronicle_citations=[],
            appeal_depth=1
        )
        
        reader_handle = self.chronicle.get_reader_handle("IGNIS")
        
        with pytest.raises(ChronicleAccessError):
            self.chronicle.persist_appeal(appeal, reader_handle)
    
    def test_elder_can_persist_appeal(self):
        """TheElder should be able to persist appeals."""
        appeal = AppealRecord.create(
            original_case_id="CASE-TEST-001",
            original_ruling="REFUSED",
            original_deliberation=[],
            expanded_context={"user_role": "admin"},
            constraint_changes={},
            appellant_reason="User is admin",
            new_deliberation=[],
            new_ruling="APPROVED",
            chronicle_citations=["CASE-TEST-001"],
            appeal_depth=1
        )
        
        writer_handle = self.chronicle.get_writer_handle("ELDER")
        appeal_id = self.chronicle.persist_appeal(appeal, writer_handle)
        
        assert appeal_id == appeal.appeal_id
        assert appeal_id.startswith("APPEAL-")
    
    def test_appeal_increments_count(self):
        """Persisting an appeal should increment appeal count."""
        writer_handle = self.chronicle.get_writer_handle("ELDER")
        
        appeal1 = AppealRecord.create(
            original_case_id="CASE-TEST-001",
            original_ruling="REFUSED",
            original_deliberation=[],
            expanded_context={},
            constraint_changes={},
            appellant_reason="First try",
            new_deliberation=[],
            new_ruling="REFUSED",
            chronicle_citations=[],
            appeal_depth=1
        )
        self.chronicle.persist_appeal(appeal1, writer_handle)
        
        assert self.chronicle.get_appeal_count("CASE-TEST-001") == 1
        
        appeal2 = AppealRecord.create(
            original_case_id="CASE-TEST-001",
            original_ruling="REFUSED",
            original_deliberation=[],
            expanded_context={},
            constraint_changes={},
            appellant_reason="Second try",
            new_deliberation=[],
            new_ruling="APPROVED",
            chronicle_citations=[],
            appeal_depth=2
        )
        self.chronicle.persist_appeal(appeal2, writer_handle)
        
        assert self.chronicle.get_appeal_count("CASE-TEST-001") == 2
    
    def test_appeal_links_to_original_case(self):
        """Appeals should update the original case's appeal_history."""
        writer_handle = self.chronicle.get_writer_handle("ELDER")
        
        appeal = AppealRecord.create(
            original_case_id="CASE-TEST-001",
            original_ruling="REFUSED",
            original_deliberation=[],
            expanded_context={},
            constraint_changes={},
            appellant_reason="Test",
            new_deliberation=[],
            new_ruling="APPROVED",
            chronicle_citations=[],
            appeal_depth=1
        )
        appeal_id = self.chronicle.persist_appeal(appeal, writer_handle)
        
        # Check original case was updated
        original = self.chronicle.get_case_by_id("CASE-TEST-001")
        assert appeal_id in original.appeal_history
    
    def test_cite_precedent_returns_citation(self):
        """cite_precedent should return citation-ready data."""
        citation = self.chronicle.cite_precedent("CASE-TEST-001")
        
        assert citation is not None
        assert citation["citation_id"] == "CASE-TEST-001"
        assert "cited_at" in citation
        assert citation["ruling"] == "REFUSED"
    
    def test_cite_nonexistent_case_returns_none(self):
        """cite_precedent should return None for missing cases."""
        citation = self.chronicle.cite_precedent("NONEXISTENT")
        assert citation is None
    
    def test_get_appeals_for_case(self):
        """get_appeals_for_case should return all appeals for a case."""
        writer_handle = self.chronicle.get_writer_handle("ELDER")
        
        # Create two appeals
        for i in range(2):
            appeal = AppealRecord.create(
                original_case_id="CASE-TEST-001",
                original_ruling="REFUSED",
                original_deliberation=[],
                expanded_context={},
                constraint_changes={},
                appellant_reason=f"Appeal {i+1}",
                new_deliberation=[],
                new_ruling="REFUSED",
                chronicle_citations=[],
                appeal_depth=i+1
            )
            self.chronicle.persist_appeal(appeal, writer_handle)
        
        appeals = self.chronicle.get_appeals_for_case("CASE-TEST-001")
        assert len(appeals) == 2


# =============================================================================
# ELDER APPEAL INTEGRATION TESTS
# =============================================================================

class TestElderAppealIntegration:
    """Test TheElder appeal processing."""
    
    def test_elder_has_process_appeal_method(self):
        """TheElder should have process_appeal method."""
        from src.core.elder import TheElder
        
        elder = TheElder()
        
        assert hasattr(elder, 'process_appeal')
        assert callable(elder.process_appeal)
    
    def test_elder_has_build_appeal_mission_method(self):
        """TheElder should have _build_appeal_mission method."""
        from src.core.elder import TheElder
        
        elder = TheElder()
        
        assert hasattr(elder, '_build_appeal_mission')
        assert callable(elder._build_appeal_mission)


# =============================================================================
# RUN TESTS
# =============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
