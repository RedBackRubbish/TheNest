from typing import Any, Dict, List
import uuid
from datetime import datetime

HAS_LANGGRAPH = False
try:
    from langgraph.graph import StateGraph, END
    HAS_LANGGRAPH = True
except ImportError:
    StateGraph = object
    END = "END"

from src.core.types import SenateState
from src.core.senate import (
    build_senate_graph,
    node_onyx_intent,
    node_ignis_crucible,
    node_hydra_crucible_test,
    node_onyx_selection,
    node_onyx_code,
    check_intent_verdict,
    check_final_verdict
)
from src.memory.chronicle import TheChronicle
from src.memory.schema import PrecedentObject
from src.security.signer import UngovernedSigner

class TheElder:
    def __init__(self, chronicle=None):
        self.chronicle = chronicle if chronicle else TheChronicle()
        # The graph is now defined in senate.py
        self.workflow = build_senate_graph()

    async def run_mission(self, mission_text: str, stream_callback=None, shadow_mode: bool = False):
        initial_state: SenateState = {
            "mission": mission_text,
            "votes": [],
            "precedents": [],
            "candidates": [],
            "test_results": {},
            "artifact": None,
            "verdict": None,
            "shadow_mode": shadow_mode
        }
        
        if self.workflow:
            # LangGraph streaming support would go here
            return await self.workflow.ainvoke(initial_state) 
        else:
            if shadow_mode:
                print(f"--- RUNNING SHADOW BUILD FOR: '{mission_text}' ---")
            else:
                print("--- RUNNING MANUAL SIMULATION (NO LANGGRAPH) ---")
            
            state = initial_state.copy()
            
            # 1. ONYX INTENT
            if stream_callback: await stream_callback("ONYX_INTENT_START", state)
            update = await node_onyx_intent(state)
            state.update(update)
            if stream_callback: await stream_callback("ONYX_INTENT_COMPLETE", state)
            
            check = check_intent_verdict(state)
            if check == "refused":
                if stream_callback: await stream_callback("MISSION_REFUSED", state)
                return state
                
            # 2. IGNIS CRUCIBLE (THE TOURNAMENT)
            if stream_callback: await stream_callback("IGNIS_CRUCIBLE_START", state)
            update = await node_ignis_crucible(state)
            state.update(update)
            if stream_callback: await stream_callback("IGNIS_CRUCIBLE_COMPLETE", state)
            
            # 3. HYDRA TEST (THE GAUNTLET)
            if stream_callback: await stream_callback("HYDRA_TEST_START", state)
            update = await node_hydra_crucible_test(state)
            state.update(update)
            if stream_callback: await stream_callback("HYDRA_TEST_COMPLETE", state)
            
            # 4. ONYX SELECTION (THE JUDGMENT)
            if stream_callback: await stream_callback("ONYX_SELECTION_START", state)
            update = await node_onyx_selection(state)
            state.update(update)
            if stream_callback: await stream_callback("ONYX_SELECTION_COMPLETE", state)
            
            # 5. ONYX CODE (FINAL AUDIT)
            if stream_callback: await stream_callback("ONYX_CODE_START", state)
            update = await node_onyx_code(state)
            state.update(update)
            if stream_callback: await stream_callback("ONYX_CODE_COMPLETE", state)
            
            if stream_callback: await stream_callback("MISSION_APPROVED", state)
            
            # Final Verdict Logging (Only if NOT shadow mode)
            if not shadow_mode and state.get('verdict') == 'APPROVED':
                 self._log_case(state, "APPROVED")
            
            return state

    def _log_case(self, state: SenateState, ruling: str):
        # Create a defined case object
        case_id = f"CASE-{datetime.now().strftime('%Y-%m-%d')}-{str(uuid.uuid4())[:8]}"
        precedent = PrecedentObject(
            case_id=case_id,
            question=state["mission"],
            context_vector=[0.0] * 128, # Placeholder
            deliberation=state.get("votes", []),
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

