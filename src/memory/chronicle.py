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

from src.memory.schema import PrecedentObject

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

    def _save(self):
        try:
            with open(self.persistence_path, 'w') as f:
                json.dump([obj.to_dict() for obj in self.memory], f, indent=2)
        except Exception as e:
            logger.error(f"[CHRONICLE] Failed to save: {e}")
    
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

