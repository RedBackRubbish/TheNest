from typing import Any, Dict, List, Optional
import uuid
from datetime import datetime
import json
import dataclasses

# Updated imports to use the Class-based Senate
from src.core.senate import Senate, SenateState as SenateEnum, SenateRecord
from src.core.types import NullVerdictState
from src.memory.chronicle import (
    TheChronicle, 
    ChronicleHandle, 
    ChronicleRole,
    ChroniclePersistenceError
)
from src.memory.schema import PrecedentObject, NullVerdictRecord
from src.security.signer import UngovernedSigner


class TheElder:
    """
    The Elder: Supreme Orchestrator of The Nest
    
    CONSTITUTIONAL ROLE:
        TheElder is the ONLY entity authorized to write to The Chronicle.
        This privilege is non-delegable. Agents (Ignis, Hydra, Onyx) may
        only READ precedent (Stare Decisis), never WRITE it.
    
    INVARIANT:
        If an Agent can write precedent, the implementation is broken.
    """
    
    def __init__(self, chronicle=None):
        self.chronicle = chronicle if chronicle else TheChronicle()
        # Instantiate the Senate Class directly
        self.senate = Senate()
        
        # =====================================================================
        # CONSTITUTIONAL INVARIANT: Elder obtains the ONLY write handle
        # =====================================================================
        # This handle is used for ALL precedent writes.
        # Agents CANNOT obtain this handle.
        self._chronicle_write_handle: ChronicleHandle = self.chronicle.get_writer_handle("ELDER")

    async def run_mission(self, mission_text: str, stream_callback=None, shadow_mode: bool = False) -> Dict[str, Any]:
        """
        Orchestrates the mission via the Senate.
        Adapts the new SenateRecord to the legacy API Contract.
        
        KERNEL INVARIANT: NullVerdict Durability
            If the mission is refused (NullVerdict), the refusal MUST be
            durably persisted to the Chronicle BEFORE this method returns.
            If persistence fails, the system fails closed (exception raised).
            
            A NullVerdict that is not persisted is constitutionally INVALID.
        """
        if stream_callback: await stream_callback("SENATE_CONVENING", {"mission": mission_text})

        # 1. Convene the Senate
        # We assume 'shadow_mode' might imply 'allow_ungoverned' in some contexts, 
        # but strictly for now, we follow the standard constitutional path.
        record: SenateRecord = await self.senate.convene(intent=mission_text)

        # 2. Extract Artifacts
        artifact = None
        if record.ignis_proposal:
             artifact = {
                 "code": record.ignis_proposal,
                 "hydra_report": record.hydra_report
             }
             if stream_callback and record.ignis_proposal:
                 await stream_callback("IGNIS_FORGE_COMPLETE", {"artifact": {"intermediate_representation": record.ignis_proposal}})

        # 3. Determine Final Verdict for API
        # Handle Enum mapping to string
        if record.state == SenateEnum.AUTHORIZED:
             verdict = "APPROVED"
        else:
             # Construct a NullVerdictState for the API
             failed_votes = [v for v in record.votes if v.verdict != "AUTHORIZE"]
             reasons = [v.reasoning for v in failed_votes]
             agents = [v.agent for v in failed_votes]
             
             verdict = NullVerdictState(
                 nulling_agents=agents,
                 reason_codes=reasons,
                 context_summary="; ".join(reasons)
             )

        # 4. Map to Legacy State Dict (for API compatibility)
        state_dict = {
            "mission": record.intent,
            "votes": [v.model_dump() for v in record.votes],
            "artifact": artifact,
            "verdict": verdict,
            "test_results": {"status": "PASSED"} if verdict == "APPROVED" else {"status": "FAILED"}
        }

        # =====================================================================
        # KERNEL INVARIANT: Persist verdict BEFORE returning to API
        # =====================================================================
        # Both APPROVED and NULL_VERDICT cases must be logged.
        # For NullVerdicts, persistence MUST succeed or we fail closed.
        # =====================================================================
        
        if verdict == "APPROVED":
            if stream_callback: await stream_callback("MISSION_APPROVED", state_dict)
            if not shadow_mode:
                self._log_case(state_dict, "APPROVED")
        else:
            # =====================================================================
            # NULLVERDICT DURABILITY: Persist BEFORE API response
            # =====================================================================
            # A NullVerdict that is not persisted is constitutionally INVALID.
            # If persistence fails, we fail closed (exception propagates to API).
            # =====================================================================
            if not shadow_mode:
                self._persist_null_verdict(
                    mission=record.intent,
                    nulling_agents=verdict.nulling_agents,
                    reason_codes=verdict.reason_codes,
                    context_summary=verdict.context_summary
                )
            
            if stream_callback: await stream_callback("MISSION_REFUSED", state_dict)
            
        return state_dict

    def _persist_null_verdict(
        self,
        mission: str,
        nulling_agents: List[str],
        reason_codes: List[str],
        context_summary: str
    ) -> None:
        """
        Persist a NullVerdict to The Chronicle with fail-closed semantics.
        
        KERNEL INVARIANT: NullVerdict Durability
            This method MUST complete successfully before the API can
            return a refusal response. If persistence fails, an exception
            is raised and the API call fails.
            
            A NullVerdict that is not persisted is constitutionally INVALID.
            
        FAIL-CLOSED BEHAVIOR:
            If persistence fails for any reason (disk full, permissions,
            corruption, etc.), the system fails closed by raising
            ChroniclePersistenceError. This ensures:
            1. No silent failures in the governance audit trail
            2. The caller (API) sees an error, not a successful refusal
            3. Operations can investigate and retry if appropriate
            
        Args:
            mission: The refused mission text
            nulling_agents: List of agents that voted against
            reason_codes: List of reason strings from nulling agents
            context_summary: Combined summary of refusal reasons
            
        Raises:
            ChroniclePersistenceError: If persistence fails (fail-closed)
        """
        # Create the NullVerdict record
        record = NullVerdictRecord.create(
            mission=mission,
            nulling_agents=nulling_agents,
            reason_codes=reason_codes,
            context_summary=context_summary
        )
        
        # Persist using the Elder's exclusive write handle
        # This call will raise ChroniclePersistenceError on failure
        self.chronicle.persist_null_verdict(
            record=record,
            handle=self._chronicle_write_handle
        )

    def _log_case(self, state: Dict[str, Any], ruling: str):
        """
        Log a case to The Chronicle.
        
        CONSTITUTIONAL INVARIANT:
            This method uses TheElder's write handle to commit precedent.
            Only TheElder can call this method because only TheElder
            possesses a valid WRITER handle.
        """
        # Create a defined case object
        case_id = f"CASE-{datetime.now().strftime('%Y-%m-%d')}-{str(uuid.uuid4())[:8]}"
        
        # Safe extraction of votes
        votes_data = state.get("votes", [])
        
        precedent = PrecedentObject(
            case_id=case_id,
            question=state["mission"],
            context_vector=[0.0] * 128, # Placeholder
            deliberation=votes_data,
            verdict={"ruling": ruling},
            appeal_history=[]
        )
        
        # Use the Elder's exclusive write handle
        self.chronicle.log_precedent(precedent, handle=self._chronicle_write_handle)

    def invoke_article_50(self, mission_text: str) -> Dict[str, Any]:
        """
        MARTIAL GOVERNANCE PROTOCOL
        Bypasses agents. Signs code as UNGOVERNED.
        
        CONSTITUTIONAL NOTE:
            Even under Martial Law, precedent logging uses TheElder's
            exclusive write handle. The state of exception does not
            grant write access to any other entity.
            
        QUARANTINE ENFORCEMENT:
            Any code artifacts generated under Article 50 are:
            1. Watermarked with UNGOVERNED metadata
            2. Destined for src/ungoverned/ namespace
            3. Mechanically isolated from governed code
            4. Signed with KEEPER liability
        """
        print("⚠️ STATE OF EXCEPTION DECLARED. ⚠️")
        print("⚠️ Code generated will be QUARANTINED in src/ungoverned/ ⚠️")
        
        # 1. Sign usage with UNGOVERNED watermark
        signature = UngovernedSigner.sign_ungoverned_artifact(mission_text)
        
        # 2. Generate case ID for quarantined artifact
        case_id = f"CASE-VOID-{datetime.now().strftime('%Y-%m-%d')}-{str(uuid.uuid4())[:8]}"
        
        # 3. Build UNGOVERNED watermark (for artifact metadata)
        watermark = {
            "zone": "UNGOVERNED",
            "case_id": case_id,
            "article": "Article 50: Martial Governance",
            "liability": "KEEPER",
            "constitutional_protection": False,
            "senate_reviewed": False,
            "timestamp": datetime.now().isoformat(),
            "quarantine_path": "src/ungoverned/",
            "warning": "This code bypassed agent governance. Use at your own risk."
        }
        
        # 4. Log void case (uses Elder's exclusive write handle)
        precedent = PrecedentObject(
            case_id=case_id,
            question=mission_text,
            context_vector=[0.0] * 128,
            deliberation=[], # No deliberation
            verdict={
                "ruling": "UNGOVERNED", 
                "principle_cited": "Article 50: Martial Governance",
                "quarantine_zone": "src/ungoverned/",
                "watermark": watermark
            },
            appeal_history=[]
        )
        
        # Use the Elder's exclusive write handle
        self.chronicle.log_precedent(precedent, handle=self._chronicle_write_handle)
        
        return {
            "status": "UNGOVERNED",
            "quarantine_zone": "src/ungoverned/",
            "artifact": {
                "mission": mission_text,
                "signature": signature,
                "watermark": watermark
            },
            "history": [
                "KEEPER INVOKED ARTICLE 50",
                "AGENTS SUSPENDED", 
                "CODE GENERATED UNDER WRIT OF EXPANSION",
                "ARTIFACT QUARANTINED IN src/ungoverned/"
            ]
        }
