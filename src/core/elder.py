from typing import Any, Dict, List, Optional
import uuid
from datetime import datetime
import json
import dataclasses

# Updated imports to use the Class-based Senate
from src.core.senate import Senate, SenateState as SenateEnum, SenateRecord
from src.core.types import NullVerdictState
from src.memory.chronicle import TheChronicle
from src.memory.schema import PrecedentObject
from src.security.signer import UngovernedSigner

class TheElder:
    def __init__(self, chronicle=None):
        self.chronicle = chronicle if chronicle else TheChronicle()
        # Instantiate the Senate Class directly
        self.senate = Senate()

    async def run_mission(self, mission_text: str, stream_callback=None, shadow_mode: bool = False) -> Dict[str, Any]:
        """
        Orchestrates the mission via the Senate.
        Adapts the new SenateRecord to the legacy API Contract.
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

        # 5. Callbacks & Logging
        if verdict == "APPROVED":
            if stream_callback: await stream_callback("MISSION_APPROVED", state_dict)
            if not shadow_mode:
                self._log_case(state_dict, "APPROVED")
        else:
            if stream_callback: await stream_callback("MISSION_REFUSED", state_dict)
            
        return state_dict

    def _log_case(self, state: Dict[str, Any], ruling: str):
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
        self.chronicle.log_precedent(precedent)

    def invoke_article_50(self, mission_text: str) -> Dict[str, Any]:
        """
        MARTIAL GOVERNANCE PROTOCOL
        Bypasses agents. Signs code as UNGOVERNED.
        """
        print("⚠️ STATE OF EXCEPTION DECLARED. ⚠️")
        
        # 1. Sign usage
        signature = UngovernedSigner.sign_ungoverned_artifact(mission_text)
        
        # 2. Log void case
        case_id = f"CASE-VOID-{datetime.now().strftime('%Y-%m-%d')}-{str(uuid.uuid4())[:8]}"
        
        precedent = PrecedentObject(
            case_id=case_id,
            question=mission_text,
            context_vector=[0.0] * 128,
            deliberation=[], # No deliberation
            verdict={
                "ruling": "UNGOVERNED", 
                "principle_cited": "Article 50: Martial Governance"
            },
            appeal_history=[]
        )
        self.chronicle.log_precedent(precedent)
        
        return {
            "status": "UNGOVERNED",
            "artifact": {
                "mission": mission_text,
                "signature": signature
            },
            "history": ["KEEPER INVOKED ARTICLE 50", "AGENTS SUSPENDED", "CODE GENERATED UNDER WRIT OF EXPANSION"]
        }
