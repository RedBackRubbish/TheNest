"""
============================================================================
TEST: Chronicle Write-Protection Constitutional Invariant
============================================================================

This test suite verifies that the Chronicle's write-protection is enforced:

    1. Agents (Ignis, Hydra, Onyx) can ONLY read precedent
    2. Agents CANNOT obtain write handles
    3. Agents CANNOT write precedent even if they try
    4. Only TheElder can write precedent
    5. Writes are append-only (no updates, no deletes)

INVARIANT: If ANY of these tests fail, the implementation is BROKEN.

============================================================================
"""

import pytest
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.memory.chronicle import (
    TheChronicle, 
    ChronicleHandle, 
    ChronicleRole,
    ChronicleAccessError,
    create_agent_chronicle_access,
    create_elder_chronicle_access
)
from src.memory.schema import PrecedentObject


class TestChronicleWriteProtection:
    """Test suite for Chronicle write-protection invariants."""
    
    def setup_method(self):
        """Create a fresh Chronicle for each test."""
        # Use a test-specific persistence path
        self.chronicle = TheChronicle(persistence_path="/tmp/test_chronicle.json")
        # Enable secured mode for testing
        self.chronicle._secured_mode = True
        
        # Create a sample precedent
        self.sample_precedent = PrecedentObject(
            case_id="TEST-CASE-001",
            question="Should we allow SQL injection?",
            context_vector=[0.0] * 128,
            deliberation=[{"agent": "ONYX", "vote": "VETO", "reason": "Security violation"}],
            verdict={"ruling": "REJECTED"},
            appeal_history=[]
        )
    
    def teardown_method(self):
        """Clean up test artifacts."""
        if os.path.exists("/tmp/test_chronicle.json"):
            os.remove("/tmp/test_chronicle.json")
    
    # =========================================================================
    # TEST 1: Agents can get reader handles
    # =========================================================================
    
    def test_agents_can_get_reader_handles(self):
        """Agents should be able to obtain READ-ONLY handles."""
        for agent in ["IGNIS", "HYDRA", "ONYX"]:
            handle = self.chronicle.get_reader_handle(agent)
            
            assert handle.role == ChronicleRole.READER
            assert handle.owner == agent
            assert handle.can_read() == True
            assert handle.can_write() == False  # CRITICAL
    
    # =========================================================================
    # TEST 2: Agents CANNOT get writer handles
    # =========================================================================
    
    def test_agents_cannot_get_writer_handles(self):
        """Agents should be DENIED write handles. This is non-negotiable."""
        for agent in ["IGNIS", "HYDRA", "ONYX", "MALICIOUS_AGENT", "FAKE_ELDER"]:
            with pytest.raises(ChronicleAccessError) as exc_info:
                self.chronicle.get_writer_handle(agent)
            
            assert "CONSTITUTIONAL VIOLATION" in str(exc_info.value)
            assert agent in str(exc_info.value)
    
    # =========================================================================
    # TEST 3: Only TheElder can get writer handles
    # =========================================================================
    
    def test_elder_can_get_writer_handle(self):
        """TheElder should be able to obtain a WRITE handle."""
        handle = self.chronicle.get_writer_handle("ELDER")
        
        assert handle.role == ChronicleRole.WRITER
        assert handle.owner == "ELDER"
        assert handle.can_read() == True
        assert handle.can_write() == True
    
    def test_elder_case_insensitive(self):
        """Elder handle request should be case-insensitive."""
        for variant in ["ELDER", "elder", "Elder", "eLdEr"]:
            handle = self.chronicle.get_writer_handle(variant)
            assert handle.can_write() == True
    
    # =========================================================================
    # TEST 4: Agents cannot write precedent with reader handles
    # =========================================================================
    
    def test_agent_cannot_write_with_reader_handle(self):
        """An Agent with a READER handle should be DENIED write access."""
        for agent in ["IGNIS", "HYDRA", "ONYX"]:
            handle = self.chronicle.get_reader_handle(agent)
            
            with pytest.raises(ChronicleAccessError) as exc_info:
                self.chronicle.write_precedent(self.sample_precedent, handle)
            
            assert "CONSTITUTIONAL VIOLATION" in str(exc_info.value)
            assert agent in str(exc_info.value)
            assert "WRITE_PRECEDENT" in str(exc_info.value)
    
    # =========================================================================
    # TEST 5: Agents cannot write precedent without handles (secured mode)
    # =========================================================================
    
    def test_agent_cannot_write_without_handle_secured_mode(self):
        """In secured mode, writes without handles should fail."""
        with pytest.raises(ChronicleAccessError) as exc_info:
            self.chronicle.log_precedent(self.sample_precedent, handle=None)
        
        assert "CONSTITUTIONAL VIOLATION" in str(exc_info.value)
    
    # =========================================================================
    # TEST 6: Elder CAN write precedent
    # =========================================================================
    
    def test_elder_can_write_precedent(self):
        """TheElder with a WRITER handle should be able to write precedent."""
        handle = self.chronicle.get_writer_handle("ELDER")
        
        # This should NOT raise
        case_id = self.chronicle.write_precedent(self.sample_precedent, handle)
        
        assert case_id == "TEST-CASE-001"
        assert len(self.chronicle.memory) == 1
        assert self.chronicle.memory[0].case_id == "TEST-CASE-001"
    
    # =========================================================================
    # TEST 7: All roles can read precedent
    # =========================================================================
    
    def test_all_roles_can_read_precedent(self):
        """Both readers and writers should be able to read precedent."""
        # First, Elder writes a precedent
        elder_handle = self.chronicle.get_writer_handle("ELDER")
        self.chronicle.write_precedent(self.sample_precedent, elder_handle)
        
        # All agents should be able to read it
        for agent in ["IGNIS", "HYDRA", "ONYX"]:
            reader_handle = self.chronicle.get_reader_handle(agent)
            
            # This should NOT raise
            results = self.chronicle.retrieve_precedent("SQL injection", handle=reader_handle)
            assert len(results) >= 1
    
    # =========================================================================
    # TEST 8: Factory functions enforce access control
    # =========================================================================
    
    def test_agent_factory_returns_reader_only(self):
        """Agent factory should return READ-ONLY access."""
        chronicle, handle = create_agent_chronicle_access("HYDRA")
        
        assert handle.role == ChronicleRole.READER
        assert handle.can_write() == False
    
    def test_elder_factory_returns_writer(self):
        """Elder factory should return WRITE access."""
        chronicle, handle = create_elder_chronicle_access()
        
        assert handle.role == ChronicleRole.WRITER
        assert handle.can_write() == True
    
    # =========================================================================
    # TEST 9: Append-only semantics (no update method exists)
    # =========================================================================
    
    def test_no_update_method_exists(self):
        """The Chronicle should not have an update_precedent method."""
        assert not hasattr(self.chronicle, 'update_precedent')
        assert not hasattr(self.chronicle, 'modify_precedent')
        assert not hasattr(self.chronicle, 'edit_precedent')
    
    def test_no_delete_method_exists(self):
        """The Chronicle should not have a delete_precedent method."""
        assert not hasattr(self.chronicle, 'delete_precedent')
        assert not hasattr(self.chronicle, 'remove_precedent')
        assert not hasattr(self.chronicle, 'expunge_precedent')


class TestChronicleAccessErrorMessages:
    """Test that error messages are clear and actionable."""
    
    def test_error_identifies_violator(self):
        """Error message should identify who attempted the violation."""
        chronicle = TheChronicle()
        
        try:
            chronicle.get_writer_handle("MALICIOUS_BOT")
        except ChronicleAccessError as e:
            assert "MALICIOUS_BOT" in str(e)
            assert "CONSTITUTIONAL VIOLATION" in str(e)
    
    def test_error_identifies_operation(self):
        """Error message should identify what operation was attempted."""
        chronicle = TheChronicle()
        chronicle._secured_mode = True
        
        reader_handle = chronicle.get_reader_handle("IGNIS")
        precedent = PrecedentObject(
            case_id="TEST",
            question="test",
            context_vector=[],
            deliberation=[],
            verdict={"ruling": "TEST"},
            appeal_history=[]
        )
        
        try:
            chronicle.write_precedent(precedent, reader_handle)
        except ChronicleAccessError as e:
            assert "WRITE_PRECEDENT" in str(e)


# =============================================================================
# INTEGRATION TEST: Full Elder → Chronicle flow
# =============================================================================

class TestElderChronicleIntegration:
    """Test that TheElder properly uses Chronicle with write protection."""
    
    def test_elder_initializes_with_write_handle(self):
        """TheElder should automatically obtain a write handle on init."""
        from src.core.elder import TheElder
        
        elder = TheElder()
        
        # Elder should have a write handle
        assert hasattr(elder, '_chronicle_write_handle')
        assert elder._chronicle_write_handle.role == ChronicleRole.WRITER
        assert elder._chronicle_write_handle.owner == "ELDER"


# =============================================================================
# NULLVERDICT DURABILITY TESTS
# =============================================================================

class TestNullVerdictDurability:
    """
    Test NullVerdict durability guarantees.
    
    KERNEL INVARIANT:
        Every NullVerdict MUST be durably persisted BEFORE the API returns.
        If persistence fails, the system MUST fail closed.
    """
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Set up test fixtures."""
        from src.memory.chronicle import TheChronicle
        self.chronicle = TheChronicle()
    
    # =========================================================================
    # TEST 1: NullVerdictRecord creation
    # =========================================================================
    
    def test_null_verdict_record_creation(self):
        """NullVerdictRecord.create() should generate valid records."""
        from src.memory.schema import NullVerdictRecord
        
        record = NullVerdictRecord.create(
            mission="DELETE * FROM users",
            nulling_agents=["ONYX", "HYDRA"],
            reason_codes=["SECURITY_VIOLATION", "DANGEROUS_OPERATION"],
            context_summary="Operation refused by security agents"
        )
        
        assert record.case_id.startswith("NULL-")
        assert record.mission == "DELETE * FROM users"
        assert record.nulling_agents == ["ONYX", "HYDRA"]
        assert record.reason_codes == ["SECURITY_VIOLATION", "DANGEROUS_OPERATION"]
        assert record.verdict_type == "NULL_VERDICT"
        assert record.timestamp is not None
    
    # =========================================================================
    # TEST 2: NullVerdict persistence requires WRITER handle
    # =========================================================================
    
    def test_null_verdict_requires_writer_handle(self):
        """persist_null_verdict should reject READER handles."""
        from src.memory.schema import NullVerdictRecord
        from src.memory.chronicle import ChronicleAccessError
        
        record = NullVerdictRecord.create(
            mission="test mission",
            nulling_agents=["ONYX"],
            reason_codes=["TEST"],
            context_summary="test"
        )
        
        reader_handle = self.chronicle.get_reader_handle("IGNIS")
        
        with pytest.raises(ChronicleAccessError):
            self.chronicle.persist_null_verdict(record, reader_handle)
    
    # =========================================================================
    # TEST 3: Elder can persist NullVerdicts
    # =========================================================================
    
    def test_elder_can_persist_null_verdict(self):
        """TheElder with WRITER handle should persist NullVerdicts."""
        from src.memory.schema import NullVerdictRecord
        
        record = NullVerdictRecord.create(
            mission="DROP TABLE users",
            nulling_agents=["ONYX", "HYDRA"],
            reason_codes=["SQL_INJECTION", "DESTRUCTIVE"],
            context_summary="Dangerous SQL operation refused"
        )
        
        writer_handle = self.chronicle.get_writer_handle("ELDER")
        
        # Should not raise
        case_id = self.chronicle.persist_null_verdict(record, writer_handle)
        
        assert case_id == record.case_id
        assert case_id.startswith("NULL-")
    
    # =========================================================================
    # TEST 4: NullVerdict is appended to null_verdicts storage
    # =========================================================================
    
    def test_null_verdict_stored_in_correct_collection(self):
        """NullVerdicts should be stored in the memory collection as PrecedentObjects."""
        from src.memory.schema import NullVerdictRecord
        
        # Get initial count
        initial_count = len(self.chronicle.memory)
        
        record = NullVerdictRecord.create(
            mission="rm -rf /",
            nulling_agents=["ONYX"],
            reason_codes=["SYSTEM_DESTRUCTION"],
            context_summary="System destruction attempt"
        )
        
        writer_handle = self.chronicle.get_writer_handle("ELDER")
        self.chronicle.persist_null_verdict(record, writer_handle)
        
        # NullVerdicts are stored as PrecedentObjects in the memory collection
        # This ensures they appear in the same case law stream
        assert len(self.chronicle.memory) == initial_count + 1
        
        # Find our stored record
        stored = next(
            (p for p in self.chronicle.memory if p.case_id == record.case_id),
            None
        )
        assert stored is not None
        assert stored.question == "rm -rf /"
        assert stored.verdict["ruling"] == "NULL_VERDICT"
        assert stored.verdict["nulling_agents"] == ["ONYX"]
    
    # =========================================================================
    # TEST 5: Elder._persist_null_verdict method exists
    # =========================================================================
    
    def test_elder_has_persist_method(self):
        """TheElder should have _persist_null_verdict method."""
        from src.core.elder import TheElder
        
        elder = TheElder()
        
        assert hasattr(elder, '_persist_null_verdict')
        assert callable(elder._persist_null_verdict)
    
    # =========================================================================
    # TEST 6: NullVerdict records are append-only (no update method)
    # =========================================================================
    
    def test_null_verdict_no_update(self):
        """Chronicle should have no method to update NullVerdicts."""
        assert not hasattr(self.chronicle, 'update_null_verdict')
        assert not hasattr(self.chronicle, 'modify_null_verdict')
        assert not hasattr(self.chronicle, 'edit_null_verdict')
    
    # =========================================================================
    # TEST 7: NullVerdict records are append-only (no delete method)
    # =========================================================================
    
    def test_null_verdict_no_delete(self):
        """Chronicle should have no method to delete NullVerdicts."""
        assert not hasattr(self.chronicle, 'delete_null_verdict')
        assert not hasattr(self.chronicle, 'remove_null_verdict')
        assert not hasattr(self.chronicle, 'expunge_null_verdict')


# =============================================================================
# RUN TESTS
# =============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
