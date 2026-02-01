"""
============================================================================
THE CHRONICLE: Constitutional Case Law Persistence Layer
============================================================================

CONSTITUTIONAL INVARIANT:
    Agents (Ignis, Hydra, Onyx) can NEVER write precedent.
    Only TheElder may initialize a writer connection.
    Chronicle writes are APPEND-ONLY (no UPDATE, no DELETE).

If an Agent can mutate precedent, this implementation is WRONG.

This module re-exports from chronicle_v2 for backward compatibility.
============================================================================
"""

import json
import os
import logging
from typing import List, Dict, Any, Optional, Tuple
from enum import Enum, auto
from dataclasses import dataclass
from datetime import datetime

from src.memory.schema import PrecedentObject, NullVerdictRecord
from src.memory.appeal_schema import AppealRecord

logger = logging.getLogger("TheNest.Chronicle")


# =============================================================================
# ACCESS CONTROL PRIMITIVES
# =============================================================================

class ChronicleRole(Enum):
    """
    Constitutional roles for Chronicle access.
    These map directly to PostgreSQL roles defined in the migration.
    """
    READER = auto()  # SELECT only - for Agents (Ignis, Hydra, Onyx)
    WRITER = auto()  # INSERT only - for TheElder EXCLUSIVELY


class ChronicleAccessError(PermissionError):
    """
    Raised when an unauthorized entity attempts to write to the Chronicle.
    This is a constitutional violation.
    """
    def __init__(self, attempted_by: str, operation: str):
        self.attempted_by = attempted_by
        self.operation = operation
        super().__init__(
            f"CONSTITUTIONAL VIOLATION: {attempted_by} attempted {operation} on Chronicle. "
            f"Only TheElder may write precedent. Agents have READ-ONLY access."
        )


class ChroniclePersistenceError(Exception):
    """
    KERNEL INVARIANT: Fail-Closed Persistence
    
    Raised when Chronicle persistence fails. This triggers fail-closed behavior:
    the mission is refused and the error is propagated to the API layer.
    
    A NullVerdict that is not persisted is constitutionally INVALID.
    """
    def __init__(self, case_id: str, reason: str):
        self.case_id = case_id
        self.reason = reason
        super().__init__(
            f"CRITICAL: Chronicle persistence failed for {case_id}. "
            f"Reason: {reason}. System failing closed - mission refused."
        )


@dataclass
class ChronicleHandle:
    """
    A handle to the Chronicle with a specific role.
    Used to enforce access control at the application layer.
    """
    role: ChronicleRole
    owner: str  # Who owns this handle (e.g., "IGNIS", "HYDRA", "ONYX", "ELDER")
    
    def can_write(self) -> bool:
        return self.role == ChronicleRole.WRITER
    
    def can_read(self) -> bool:
        return True  # All roles can read


# =============================================================================
# THE CHRONICLE CLASS
# =============================================================================

class TheChronicle:
    """
    The Chronicle: Constitutional Case Law Storage
    
    Implements the Stare Decisis (precedent) system with strict access control.
    
    SECURITY MODEL:
        1. Agents get READER handles only (cannot write)
        2. Only TheElder can get WRITER handles
        3. All writes are append-only (no UPDATE, no DELETE)
        4. Database layer enforces this via PostgreSQL roles and RLS
    
    INVARIANT:
        An Agent calling log_precedent() directly will work for backward
        compatibility, but in secured mode, write_precedent() requires
        an explicit Elder handle.
    """
    
    def __init__(self, persistence_path: str = "chronicle_data.json"):
        self.persistence_path = persistence_path
        self.memory: List[PrecedentObject] = []
        self.appeals: List[AppealRecord] = []  # Appeal history
        self._load()
        
        # Track if we're in secured mode (explicit handles required)
        self._secured_mode = os.getenv("CHRONICLE_SECURED", "false").lower() == "true"
    
    # =========================================================================
    # HANDLE MANAGEMENT (Access Control)
    # =========================================================================
    
    def get_reader_handle(self, agent_name: str) -> ChronicleHandle:
        """
        Get a READ-ONLY handle for an Agent.
        
        Args:
            agent_name: The name of the agent (IGNIS, HYDRA, ONYX)
            
        Returns:
            ChronicleHandle with READER role
        """
        logger.debug(f"[CHRONICLE] Issuing READER handle to {agent_name}")
        return ChronicleHandle(role=ChronicleRole.READER, owner=agent_name)
    
    def get_writer_handle(self, caller: str) -> ChronicleHandle:
        """
        Get a WRITE handle for TheElder.
        
        SECURITY: This method enforces that only TheElder can get write access.
        
        Args:
            caller: Must be "ELDER" to receive write access
            
        Returns:
            ChronicleHandle with WRITER role
            
        Raises:
            ChronicleAccessError: If caller is not TheElder
        """
        if caller.upper() != "ELDER":
            raise ChronicleAccessError(
                attempted_by=caller,
                operation="REQUEST_WRITE_HANDLE"
            )
        
        logger.info(f"[CHRONICLE] Issuing WRITER handle to {caller}")
        return ChronicleHandle(role=ChronicleRole.WRITER, owner=caller)
    
    # =========================================================================
    # PERSISTENCE
    # =========================================================================

    def _load(self):
        # Load main precedent data
        if os.path.exists(self.persistence_path):
            try:
                with open(self.persistence_path, 'r') as f:
                    data = json.load(f)
                    # Reconstruct objects
                    for item in data:
                        self.memory.append(PrecedentObject(**item))
                logger.info(f"[CHRONICLE] Loaded {len(self.memory)} cases")
            except Exception as e:
                logger.error(f"[CHRONICLE] Failed to load: {e}")
        
        # Load appeals data
        appeals_path = self.persistence_path.replace('.json', '_appeals.json')
        if os.path.exists(appeals_path):
            try:
                with open(appeals_path, 'r') as f:
                    data = json.load(f)
                    for item in data:
                        self.appeals.append(AppealRecord(**item))
                logger.info(f"[CHRONICLE] Loaded {len(self.appeals)} appeals")
            except Exception as e:
                logger.error(f"[CHRONICLE] Failed to load appeals: {e}")

    def _save(self):
        try:
            with open(self.persistence_path, 'w') as f:
                json.dump([obj.to_dict() for obj in self.memory], f, indent=2)
        except Exception as e:
            logger.error(f"[CHRONICLE] Failed to save: {e}")
    
    def _save_appeals(self):
        """Save appeals to a separate file for clean separation."""
        appeals_path = self.persistence_path.replace('.json', '_appeals.json')
        try:
            with open(appeals_path, 'w') as f:
                json.dump([a.to_dict() for a in self.appeals], f, indent=2)
                f.flush()
                os.fsync(f.fileno())
        except Exception as e:
            logger.error(f"[CHRONICLE] Failed to save appeals: {e}")
            raise ChroniclePersistenceError(
                case_id="APPEALS",
                reason=f"Appeals persistence failed: {e}"
            )
    
    # =========================================================================
    # WRITE OPERATIONS (Append-only, Elder-only in secured mode)
    # =========================================================================

    def log_precedent(self, precedent: PrecedentObject, handle: Optional[ChronicleHandle] = None):
        """
        Log a new precedent to the Chronicle.
        
        SECURITY:
            - In legacy mode (CHRONICLE_SECURED=false): Works without handle
            - In secured mode (CHRONICLE_SECURED=true): Requires WRITER handle
        
        Args:
            precedent: The PrecedentObject to persist
            handle: Optional ChronicleHandle (required in secured mode)
            
        Raises:
            ChronicleAccessError: If in secured mode without valid writer handle
        """
        # Enforce access control in secured mode
        if self._secured_mode:
            if handle is None:
                raise ChronicleAccessError(
                    attempted_by="UNKNOWN",
                    operation="WRITE_PRECEDENT (no handle provided)"
                )
            if not handle.can_write():
                raise ChronicleAccessError(
                    attempted_by=handle.owner,
                    operation="WRITE_PRECEDENT"
                )
        
        # Append-only write
        self.memory.append(precedent)
        self._save()
        print(f"[CHRONICLE] Logged Case: {precedent.case_id}")
    
    def write_precedent(self, precedent: PrecedentObject, handle: ChronicleHandle) -> str:
        """
        Write a new precedent with explicit access control.
        
        CONSTITUTIONAL INVARIANT:
            This method ALWAYS requires a WRITER handle, which can ONLY
            be obtained by TheElder.
        
        Args:
            precedent: The PrecedentObject to persist
            handle: A ChronicleHandle with WRITER role (Elder only)
            
        Returns:
            The case_id of the written precedent
            
        Raises:
            ChronicleAccessError: If handle is not a WRITER handle
        """
        if not handle.can_write():
            raise ChronicleAccessError(
                attempted_by=handle.owner,
                operation="WRITE_PRECEDENT"
            )
        
        self.memory.append(precedent)
        self._save()
        logger.info(f"[CHRONICLE] Case {precedent.case_id} committed (by {handle.owner})")
        return precedent.case_id
    
    # =========================================================================
    # NULLVERDICT PERSISTENCE (Fail-Closed, Append-Only)
    # =========================================================================
    # 
    # KERNEL INVARIANT: NullVerdict Durability
    # 
    # A NullVerdict that is not persisted is constitutionally INVALID.
    # Every refusal MUST be durably persisted BEFORE the API returns.
    # If persistence fails, the system MUST fail closed.
    # =========================================================================
    
    def persist_null_verdict(
        self,
        record: NullVerdictRecord,
        handle: ChronicleHandle
    ) -> str:
        """
        Persist a NullVerdict record to the Chronicle.
        
        KERNEL INVARIANT: Fail-Closed Persistence
            - NullVerdict MUST be written BEFORE API response
            - If persistence fails → raise exception (fail closed)
            - Records are APPEND-ONLY (no updates, no deletes)
        
        A NullVerdict that is not persisted is constitutionally INVALID.
        
        Args:
            record: The NullVerdictRecord to persist
            handle: A ChronicleHandle with WRITER role (Elder only)
            
        Returns:
            The case_id of the persisted NullVerdict
            
        Raises:
            ChronicleAccessError: If handle is not a WRITER handle
            ChroniclePersistenceError: If persistence fails (FAIL CLOSED)
        """
        # =====================================================================
        # ACCESS CONTROL: Only Elder can persist NullVerdicts
        # =====================================================================
        if not handle.can_write():
            raise ChronicleAccessError(
                attempted_by=handle.owner,
                operation="PERSIST_NULL_VERDICT"
            )
        
        # =====================================================================
        # FAIL-CLOSED PERSISTENCE
        # =====================================================================
        try:
            # Convert NullVerdictRecord to PrecedentObject for storage
            # This ensures NullVerdicts appear in the same case law stream
            precedent = PrecedentObject(
                case_id=record.case_id,
                question=record.mission,
                context_vector=[0.0] * 128,  # Placeholder
                deliberation=[
                    {"agent": agent, "vote": "NULL", "reason": reason}
                    for agent, reason in zip(record.nulling_agents, record.reason_codes)
                ],
                verdict={
                    "ruling": "NULL_VERDICT",
                    "nulling_agents": record.nulling_agents,
                    "reason_codes": record.reason_codes,
                    "timestamp": record.timestamp,
                    "context_summary": record.context_summary
                },
                appeal_history=[]
            )
            
            # Append to memory
            self.memory.append(precedent)
            
            # Persist to disk (MUST succeed before returning)
            self._save_or_fail()
            
            logger.info(
                f"[CHRONICLE] NullVerdict {record.case_id} persisted "
                f"(agents: {record.nulling_agents}, by: {handle.owner})"
            )
            
            return record.case_id
            
        except ChroniclePersistenceError:
            # Re-raise persistence errors (fail closed)
            raise
        except Exception as e:
            # Wrap unexpected errors in persistence error (fail closed)
            logger.error(f"[CHRONICLE] CRITICAL: NullVerdict persistence failed: {e}")
            raise ChroniclePersistenceError(
                case_id=record.case_id,
                reason=str(e)
            ) from e
    
    def _save_or_fail(self):
        """
        Save to disk with fail-closed semantics.
        
        KERNEL INVARIANT:
            If save fails, we MUST raise an exception.
            Silent failures are constitutionally invalid.
        """
        try:
            with open(self.persistence_path, 'w') as f:
                json.dump([obj.to_dict() for obj in self.memory], f, indent=2)
                f.flush()
                os.fsync(f.fileno())  # Force write to disk
        except Exception as e:
            logger.error(f"[CHRONICLE] CRITICAL: Disk write failed: {e}")
            raise ChroniclePersistenceError(
                case_id="UNKNOWN",
                reason=f"Disk write failed: {e}"
            ) from e
    
    # =========================================================================
    # READ OPERATIONS (Available to all roles)
    # =========================================================================

    def retrieve_relevant_case(self, query: str) -> List[PrecedentObject]:
        """
        Retrieve cases relevant to a query.
        No access control required - all roles can read.
        """
        results = []
        query_words = set(query.lower().split())
        
        for case in self.memory:
            question_words = set(case.question.lower().split())
            intersection = query_words.intersection(question_words)
            if len(intersection) > 0:
                results.append(case)
        
        return results
    
    def retrieve_precedent(self, query: str, handle: Optional[ChronicleHandle] = None) -> List[Dict[str, Any]]:
        """
        Retrieve precedents as dictionaries (for API responses).
        
        Args:
            query: Search query
            handle: Optional handle (not required for reads)
            
        Returns:
            List of precedent dictionaries
        """
        cases = self.retrieve_relevant_case(query)
        return [case.to_dict() for case in cases]
    
    def get_case_by_id(self, case_id: str) -> Optional[PrecedentObject]:
        """Retrieve a specific case by ID."""
        for case in self.memory:
            if case.case_id == case_id:
                return case
        return None
    
    # =========================================================================
    # APPEAL OPERATIONS (Due Process)
    # =========================================================================
    
    def get_appeal_count(self, case_id: str) -> int:
        """
        Get how many times a case has been appealed.
        Used for liability escalation calculation.
        """
        return sum(1 for a in self.appeals if a.original_case_id == case_id)
    
    def get_appeals_for_case(self, case_id: str) -> List[AppealRecord]:
        """Get all appeals linked to a case."""
        return [a for a in self.appeals if a.original_case_id == case_id]
    
    def persist_appeal(
        self,
        appeal: AppealRecord,
        handle: ChronicleHandle
    ) -> str:
        """
        Persist an appeal to the Chronicle.
        
        CONSTITUTIONAL INVARIANTS:
            - Requires WRITER handle (Elder only)
            - Appeals are append-only (no updates, no deletes)
            - Appeal is linked to original case
            - Increases liability metadata
        
        Args:
            appeal: The AppealRecord to persist
            handle: ChronicleHandle with WRITER role
            
        Returns:
            The appeal_id of the persisted appeal
            
        Raises:
            ChronicleAccessError: If handle is not a WRITER
            ChroniclePersistenceError: If persistence fails
        """
        if not handle.can_write():
            raise ChronicleAccessError(
                attempted_by=handle.owner,
                operation="PERSIST_APPEAL"
            )
        
        try:
            # Append to appeals list
            self.appeals.append(appeal)
            
            # Update the original case's appeal_history
            original = self.get_case_by_id(appeal.original_case_id)
            if original:
                original.appeal_history.append(appeal.appeal_id)
                self._save()  # Save updated case
            
            # Save appeals
            self._save_appeals()
            
            logger.info(
                f"[CHRONICLE] Appeal {appeal.appeal_id} persisted "
                f"(original: {appeal.original_case_id}, depth: {appeal.appeal_depth})"
            )
            
            return appeal.appeal_id
            
        except ChroniclePersistenceError:
            raise
        except Exception as e:
            logger.error(f"[CHRONICLE] CRITICAL: Appeal persistence failed: {e}")
            raise ChroniclePersistenceError(
                case_id=appeal.appeal_id,
                reason=str(e)
            ) from e
    
    def cite_precedent(self, case_id: str) -> Optional[Dict[str, Any]]:
        """
        Cite a precedent during appeal deliberation.
        
        Returns the case as a citation-ready dict with citation metadata.
        This is used during Senate re-evaluation to require explicit
        Chronicle citations.
        """
        case = self.get_case_by_id(case_id)
        if not case:
            return None
        
        return {
            "citation_id": case.case_id,
            "cited_at": datetime.now().isoformat(),
            "question": case.question,
            "ruling": case.verdict.get("ruling", "UNKNOWN"),
            "deliberation_summary": len(case.deliberation),
            "appeal_count": len(case.appeal_history)
        }


# =============================================================================
# FACTORY FUNCTIONS
# =============================================================================

def create_agent_chronicle_access(agent_name: str) -> Tuple[TheChronicle, ChronicleHandle]:
    """
    Factory function to create Chronicle access for an Agent.
    
    Returns a Chronicle instance and a READ-ONLY handle.
    Agents CANNOT get write access through this function.
    
    Args:
        agent_name: Name of the agent (IGNIS, HYDRA, ONYX)
        
    Returns:
        Tuple of (chronicle_instance, reader_handle)
    """
    chronicle = TheChronicle()
    handle = chronicle.get_reader_handle(agent_name)
    return chronicle, handle


def create_elder_chronicle_access() -> Tuple[TheChronicle, ChronicleHandle]:
    """
    Factory function to create Chronicle access for TheElder.
    
    Returns a Chronicle instance and a WRITE handle.
    Only TheElder should call this function.
    
    Returns:
        Tuple of (chronicle_instance, writer_handle)
    """
    chronicle = TheChronicle()
    handle = chronicle.get_writer_handle("ELDER")
    return chronicle, handle

