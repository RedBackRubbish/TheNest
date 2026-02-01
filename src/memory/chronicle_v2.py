"""
============================================================================
THE CHRONICLE: Constitutional Case Law Persistence Layer
============================================================================

CONSTITUTIONAL INVARIANT:
    Agents (Ignis, Hydra, Onyx) can NEVER write precedent.
    Only TheElder may initialize a writer connection.
    Chronicle writes are APPEND-ONLY (no UPDATE, no DELETE).

If an Agent can mutate precedent, this implementation is WRONG.

Architecture:
    - reader_pool: SELECT-only connection pool (for Agents)
    - writer_handle: INSERT-only connection (for TheElder only)
    - All write attempts by non-Elder entities raise PermissionError

============================================================================
"""

import os
import json
import logging
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum, auto
from contextlib import asynccontextmanager

# Database driver (asyncpg for PostgreSQL)
try:
    import asyncpg
except ImportError:
    asyncpg = None  # Will fall back to JSON mode

from src.memory.schema import PrecedentObject

logger = logging.getLogger("TheNest.Chronicle")


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


class TheChronicle:
    """
    The Chronicle: Constitutional Case Law Storage
    
    Implements the Stare Decisis (precedent) system with strict access control.
    
    SECURITY MODEL:
        1. Two database pools: reader (Agents) and writer (Elder only)
        2. Reader pool uses 'nest_agent' PostgreSQL user (SELECT only)
        3. Writer pool uses 'nest_elder' PostgreSQL user (INSERT only)
        4. Application-layer enforcement via ChronicleHandle
        5. Database-layer enforcement via RLS and triggers
    
    INVARIANT:
        An Agent calling write_precedent() without an Elder handle
        will raise ChronicleAccessError. This is non-negotiable.
    """
    
    def __init__(
        self,
        persistence_path: str = "chronicle_data.json",
        use_postgres: bool = None
    ):
        """
        Initialize the Chronicle.
        
        Args:
            persistence_path: Fallback JSON file path (for dev/testing)
            use_postgres: Force PostgreSQL mode. If None, auto-detect.
        """
        self.persistence_path = persistence_path
        self.memory: List[PrecedentObject] = []
        
        # Connection pools (initialized lazily)
        self._reader_pool: Optional[asyncpg.Pool] = None
        self._writer_pool: Optional[asyncpg.Pool] = None
        self._initialized = False
        
        # Determine mode
        self._use_postgres = use_postgres
        if use_postgres is None:
            # Auto-detect: Use Postgres if DATABASE_URL is set and asyncpg available
            self._use_postgres = bool(os.getenv("DATABASE_URL")) and asyncpg is not None
        
        # Load JSON fallback for non-Postgres mode
        if not self._use_postgres:
            self._load_json()
            
    # =========================================================================
    # CONNECTION MANAGEMENT
    # =========================================================================
    
    async def connect(self):
        """
        Initialize database connection pools.
        Must be called before any database operations.
        """
        if self._initialized or not self._use_postgres:
            return
            
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            logger.warning("DATABASE_URL not set, falling back to JSON mode")
            self._use_postgres = False
            self._load_json()
            return
        
        try:
            # Parse base URL and create role-specific URLs
            # The DATABASE_URL should be the base, we'll swap credentials
            
            reader_url = self._build_connection_url(
                database_url,
                user=os.getenv("CHRONICLE_READER_USER", "nest_agent"),
                password=os.getenv("CHRONICLE_READER_PASSWORD", "")
            )
            
            writer_url = self._build_connection_url(
                database_url,
                user=os.getenv("CHRONICLE_WRITER_USER", "nest_elder"),
                password=os.getenv("CHRONICLE_WRITER_PASSWORD", "")
            )
            
            # Create reader pool (for Agents - larger pool)
            self._reader_pool = await asyncpg.create_pool(
                reader_url,
                min_size=2,
                max_size=10,
                command_timeout=30
            )
            
            # Create writer pool (for Elder only - small pool)
            self._writer_pool = await asyncpg.create_pool(
                writer_url,
                min_size=1,
                max_size=2,  # Elder writes are serialized anyway
                command_timeout=30
            )
            
            self._initialized = True
            logger.info("[CHRONICLE] PostgreSQL pools initialized (Reader + Writer)")
            
        except Exception as e:
            logger.error(f"[CHRONICLE] Failed to connect to PostgreSQL: {e}")
            logger.warning("[CHRONICLE] Falling back to JSON mode")
            self._use_postgres = False
            self._load_json()
    
    async def disconnect(self):
        """Close all database connections."""
        if self._reader_pool:
            await self._reader_pool.close()
        if self._writer_pool:
            await self._writer_pool.close()
        self._initialized = False
        logger.info("[CHRONICLE] Database connections closed")
    
    def _build_connection_url(self, base_url: str, user: str, password: str) -> str:
        """Build a connection URL with specific credentials."""
        # Simple URL manipulation - in production use urllib.parse
        if "@" in base_url:
            # Replace existing credentials
            protocol, rest = base_url.split("://", 1)
            _, hostpath = rest.split("@", 1)
            return f"{protocol}://{user}:{password}@{hostpath}"
        else:
            # No credentials in base URL
            protocol, hostpath = base_url.split("://", 1)
            return f"{protocol}://{user}:{password}@{hostpath}"
    
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
        In a production system, this would be backed by authentication.
        
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
    # READ OPERATIONS (Available to all roles)
    # =========================================================================
    
    async def retrieve_precedent(
        self,
        query: str,
        handle: Optional[ChronicleHandle] = None,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant precedents for a query.
        
        This is the Stare Decisis lookup. Agents use this to cite prior rulings.
        
        Args:
            query: The search query (natural language or case ID)
            handle: Optional ChronicleHandle (reader or writer both allowed)
            max_results: Maximum number of results to return
            
        Returns:
            List of precedent dictionaries
        """
        # Both readers and writers can read
        if handle and not handle.can_read():
            raise ChronicleAccessError(handle.owner, "READ")
        
        if self._use_postgres and self._reader_pool:
            return await self._retrieve_postgres(query, max_results)
        else:
            return self._retrieve_json(query, max_results)
    
    async def _retrieve_postgres(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """PostgreSQL implementation of precedent retrieval."""
        async with self._reader_pool.acquire() as conn:
            # For now, simple text search. In production: pgvector semantic search
            rows = await conn.fetch("""
                SELECT 
                    case_id, question, deliberation, verdict, 
                    appeal_history, created_at
                FROM chronicle.precedents
                WHERE 
                    question ILIKE $1 OR 
                    case_id ILIKE $1 OR
                    verdict::text ILIKE $1
                ORDER BY created_at DESC
                LIMIT $2
            """, f"%{query}%", max_results)
            
            return [dict(row) for row in rows]
    
    def _retrieve_json(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """JSON fallback implementation of precedent retrieval."""
        results = []
        query_lower = query.lower()
        
        for case in self.memory:
            # Simple keyword matching
            if (query_lower in case.question.lower() or 
                query_lower in case.case_id.lower()):
                results.append(case.to_dict())
                if len(results) >= max_results:
                    break
        
        return results
    
    async def get_case_by_id(
        self,
        case_id: str,
        handle: Optional[ChronicleHandle] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific case by its ID.
        
        Args:
            case_id: The unique case identifier (e.g., "CASE-2026-02-abc123")
            handle: Optional ChronicleHandle
            
        Returns:
            The case dictionary or None if not found
        """
        if self._use_postgres and self._reader_pool:
            async with self._reader_pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT * FROM chronicle.precedents WHERE case_id = $1
                """, case_id)
                return dict(row) if row else None
        else:
            for case in self.memory:
                if case.case_id == case_id:
                    return case.to_dict()
            return None
    
    # =========================================================================
    # WRITE OPERATIONS (Elder only - APPEND-ONLY)
    # =========================================================================
    
    async def write_precedent(
        self,
        precedent: PrecedentObject,
        handle: ChronicleHandle
    ) -> str:
        """
        Write a new precedent to the Chronicle.
        
        CONSTITUTIONAL INVARIANT:
            This method requires a WRITER handle, which can ONLY be obtained
            by TheElder. Any attempt by an Agent to call this will fail.
        
        Args:
            precedent: The PrecedentObject to persist
            handle: A ChronicleHandle with WRITER role (Elder only)
            
        Returns:
            The case_id of the written precedent
            
        Raises:
            ChronicleAccessError: If handle is not a WRITER handle
        """
        # =====================================================================
        # SECURITY CHECK: Enforce Elder-only write access
        # =====================================================================
        if not handle.can_write():
            raise ChronicleAccessError(
                attempted_by=handle.owner,
                operation="WRITE_PRECEDENT"
            )
        
        logger.info(f"[CHRONICLE] Writing precedent {precedent.case_id} (by {handle.owner})")
        
        if self._use_postgres and self._writer_pool:
            return await self._write_postgres(precedent)
        else:
            return self._write_json(precedent)
    
    async def _write_postgres(self, precedent: PrecedentObject) -> str:
        """PostgreSQL implementation of precedent writing."""
        async with self._writer_pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO chronicle.precedents 
                    (case_id, question, context_vector, deliberation, verdict, appeal_history)
                VALUES 
                    ($1, $2, $3, $4, $5, $6)
            """,
                precedent.case_id,
                precedent.question,
                precedent.context_vector if precedent.context_vector else None,
                json.dumps(precedent.deliberation),
                json.dumps(precedent.verdict),
                json.dumps(precedent.appeal_history)
            )
        
        logger.info(f"[CHRONICLE] Case {precedent.case_id} committed to PostgreSQL")
        return precedent.case_id
    
    def _write_json(self, precedent: PrecedentObject) -> str:
        """JSON fallback implementation of precedent writing."""
        self.memory.append(precedent)
        self._save_json()
        logger.info(f"[CHRONICLE] Case {precedent.case_id} committed to JSON")
        return precedent.case_id
    
    # =========================================================================
    # LEGACY COMPATIBILITY METHODS
    # =========================================================================
    
    def log_precedent(self, precedent: PrecedentObject):
        """
        Legacy synchronous method for backward compatibility.
        
        WARNING: This method is DEPRECATED. Use write_precedent() with
        an explicit handle for proper access control.
        
        This method assumes it's being called by TheElder (the only entity
        that should be logging precedent). It creates an implicit Elder handle.
        """
        import asyncio
        
        # Create an implicit Elder handle (legacy compatibility)
        # In production, this should be explicit and authenticated
        handle = ChronicleHandle(role=ChronicleRole.WRITER, owner="ELDER_LEGACY")
        
        # Run async write in sync context
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # We're in an async context, create a task
                asyncio.create_task(self.write_precedent(precedent, handle))
            else:
                loop.run_until_complete(self.write_precedent(precedent, handle))
        except RuntimeError:
            # No event loop, use JSON directly
            self._write_json(precedent)
        
        print(f"[CHRONICLE] Logged Case: {precedent.case_id}")
    
    def retrieve_relevant_case(self, query: str) -> List[PrecedentObject]:
        """
        Legacy synchronous method for backward compatibility.
        Returns PrecedentObject instances instead of dicts.
        """
        import asyncio
        
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # We're in async context, can't block
                # Return from in-memory cache
                return self._retrieve_json_objects(query)
            else:
                results = loop.run_until_complete(self.retrieve_precedent(query))
                return [PrecedentObject(**r) for r in results]
        except RuntimeError:
            return self._retrieve_json_objects(query)
    
    def _retrieve_json_objects(self, query: str) -> List[PrecedentObject]:
        """Return PrecedentObject instances from JSON memory."""
        results = []
        query_words = set(query.lower().split())
        
        for case in self.memory:
            question_words = set(case.question.lower().split())
            if query_words.intersection(question_words):
                results.append(case)
        
        return results
    
    # =========================================================================
    # JSON PERSISTENCE (Fallback mode)
    # =========================================================================
    
    def _load_json(self):
        """Load precedents from JSON file."""
        if os.path.exists(self.persistence_path):
            try:
                with open(self.persistence_path, 'r') as f:
                    data = json.load(f)
                    for item in data:
                        self.memory.append(PrecedentObject(**item))
                logger.info(f"[CHRONICLE] Loaded {len(self.memory)} cases from JSON")
            except Exception as e:
                logger.error(f"[CHRONICLE] Failed to load JSON: {e}")
    
    def _save_json(self):
        """Save precedents to JSON file."""
        try:
            with open(self.persistence_path, 'w') as f:
                json.dump([obj.to_dict() for obj in self.memory], f, indent=2)
        except Exception as e:
            logger.error(f"[CHRONICLE] Failed to save JSON: {e}")


# =============================================================================
# AGENT ACCESS HELPERS
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
