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
    node_ignis_forge,
    node_hydra_test,
    node_onyx_code,
    check_intent_verdict,
    check_test_results,
    check_final_verdict
)
from src.memory.chronicle import TheChronicle
from src.memory.schema import PrecedentObject
from src.security.signer import UngovernedSigner

class TheElder:
    def __init__(self):
        self.chronicle = TheChronicle()
        # The graph is now defined in senate.py
        self.workflow = build_senate_graph()

    async def run_mission(self, mission_text: str, stream_callback=None):
        initial_state: SenateState = {
            "mission": mission_text,
            "votes": [],
            "precedents": [],
            "artifact": None,
            "test_results": None,
            "verdict": None
        }
        
        if self.workflow:
            # LangGraph streaming support would go here
            return await self.workflow.ainvoke(initial_state) 
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
                
            # 2. IGNIS FORGE
            if stream_callback: await stream_callback("IGNIS_FORGE_START", state)
            update = await node_ignis_forge(state)
            state.update(update)
            if stream_callback: await stream_callback("IGNIS_FORGE_COMPLETE", state)
            
            # 3. HYDRA TEST
            if stream_callback: await stream_callback("HYDRA_TEST_START", state)
            update = await node_hydra_test(state)
            state.update(update)
            if stream_callback: await stream_callback("HYDRA_TEST_COMPLETE", state)
            
            check = check_test_results(state)
            if check == "failed":
                if stream_callback: await stream_callback("MISSION_FAILED_TESTS", state)
                return state
                
            # 4. ONYX CODE
            if stream_callback: await stream_callback("ONYX_CODE_START", state)
            update = await node_onyx_code(state)
            state.update(update)
            if stream_callback: await stream_callback("ONYX_CODE_COMPLETE", state)
            
            if stream_callback: await stream_callback("MISSION_APPROVED", state)
            return state


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

