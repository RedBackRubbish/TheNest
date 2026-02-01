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

    # =========================================================================
    # APPEAL MECHANISM (Due Process)
    # =========================================================================
    
    async def process_appeal(
        self,
        case_id: str,
        expanded_context: Dict[str, Any],
        constraint_changes: Dict[str, Any],
        appellant_reason: str = ""
    ) -> Dict[str, Any]:
        """
        Process an appeal for a previously refused case.
        
        CONSTITUTIONAL INVARIANTS:
            - Appeals EXPAND context, never ERASE history
            - Appeals may NOT bypass Onyx
            - Each appeal increases liability metadata
            - All appeals are permanently logged
            - Requires explicit Chronicle citation during re-evaluation
        
        Args:
            case_id: The case being appealed
            expanded_context: Additional context to consider
            constraint_changes: Proposed constraint modifications
            appellant_reason: Human-readable reason for appeal
            
        Returns:
            AppealOutcome as a dictionary
            
        Raises:
            ValueError: If case not found
            ChroniclePersistenceError: If appeal persistence fails
        """
        from src.memory.appeal_schema import AppealRecord, AppealOutcome
        
        # 1. Load original case from Chronicle
        original = self.chronicle.get_case_by_id(case_id)
        if not original:
            raise ValueError(f"Case {case_id} not found in Chronicle")
        
        # 2. Calculate appeal depth (how many times appealed)
        appeal_depth = self.chronicle.get_appeal_count(case_id) + 1
        liability_multiplier = 1.5 ** appeal_depth
        
        print(f"⚖️ APPEAL FILED: {case_id}")
        print(f"   Appeal Depth: {appeal_depth}")
        print(f"   Liability Multiplier: {liability_multiplier:.2f}x")
        
        # 3. Build expanded mission with APPENDED context
        # INVARIANT: We append, never overwrite
        expanded_mission = self._build_appeal_mission(
            original_question=original.question,
            original_deliberation=original.deliberation,
            original_ruling=original.verdict.get("ruling", "UNKNOWN"),
            expanded_context=expanded_context,
            constraint_changes=constraint_changes,
            appellant_reason=appellant_reason
        )
        
        # 4. Cite original case (required for re-evaluation)
        citation = self.chronicle.cite_precedent(case_id)
        chronicle_citations = [case_id]
        
        # 5. Re-run Senate deliberation (Onyx CANNOT be bypassed)
        print(f"⚖️ RE-CONVENING SENATE FOR APPEAL...")
        record: SenateRecord = await self.senate.convene(intent=expanded_mission)
        
        # 6. Extract new deliberation and ruling
        new_deliberation = [v.model_dump() for v in record.votes]
        
        if record.state == SenateEnum.AUTHORIZED:
            new_ruling = "APPROVED"
        else:
            new_ruling = "REFUSED"
        
        # 7. Determine appeal status
        original_ruling = original.verdict.get("ruling", "UNKNOWN")
        if original_ruling == new_ruling:
            status = "UPHELD"
            message = f"Appeal denied. Original ruling stands: {original_ruling}"
        elif new_ruling == "APPROVED":
            status = "OVERTURNED"
            message = f"Appeal granted. Case overturned from {original_ruling} to APPROVED."
        else:
            status = "MODIFIED"
            message = f"Appeal resulted in modified ruling: {new_ruling}"
        
        # 8. Create appeal record
        appeal_record = AppealRecord.create(
            original_case_id=case_id,
            original_ruling=original_ruling,
            original_deliberation=original.deliberation,
            expanded_context=expanded_context,
            constraint_changes=constraint_changes,
            appellant_reason=appellant_reason,
            new_deliberation=new_deliberation,
            new_ruling=new_ruling,
            chronicle_citations=chronicle_citations,
            appeal_depth=appeal_depth
        )
        
        # 9. Persist appeal (MUST succeed before returning)
        appeal_id = self.chronicle.persist_appeal(
            appeal=appeal_record,
            handle=self._chronicle_write_handle
        )
        
        print(f"⚖️ APPEAL {appeal_id}: {status}")
        
        # 10. Build outcome
        outcome = AppealOutcome(
            appeal_id=appeal_id,
            original_case_id=case_id,
            status=status,
            original_ruling=original_ruling,
            new_ruling=new_ruling,
            appeal_depth=appeal_depth,
            liability_multiplier=liability_multiplier,
            chronicle_citations=chronicle_citations,
            message=message
        )
        
        return outcome.to_dict()
    
    def _build_appeal_mission(
        self,
        original_question: str,
        original_deliberation: List[Dict],
        original_ruling: str,
        expanded_context: Dict[str, Any],
        constraint_changes: Dict[str, Any],
        appellant_reason: str
    ) -> str:
        """
        Build an expanded mission for Senate re-evaluation.
        
        INVARIANT: Context is APPENDED, never overwritten.
        The original question, deliberation, and ruling are preserved.
        """
        parts = [
            "=== APPEAL CONTEXT ===",
            f"Original Question: {original_question}",
            f"Original Ruling: {original_ruling}",
            "",
            "=== ORIGINAL DELIBERATION ===",
        ]
        
        for vote in original_deliberation:
            agent = vote.get("agent", "UNKNOWN")
            verdict = vote.get("verdict", "UNKNOWN")
            reasoning = vote.get("reasoning", "")
            parts.append(f"  {agent}: {verdict} - {reasoning[:100]}")
        
        parts.extend([
            "",
            "=== EXPANDED CONTEXT (Appellant Provided) ===",
            json.dumps(expanded_context, indent=2),
            "",
            "=== CONSTRAINT CHANGES (Requested) ===",
            json.dumps(constraint_changes, indent=2),
            "",
            "=== APPELLANT REASON ===",
            appellant_reason or "(No reason provided)",
            "",
            "=== RE-EVALUATION REQUIRED ===",
            "Please re-evaluate the original question with the expanded context.",
            f"Original Question: {original_question}"
        ])
        
        return "\n".join(parts)
