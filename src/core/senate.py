from typing import TypedDict, Annotated, List, Dict, Any, Union
import logging

try:
    from langgraph.graph import StateGraph, END
    HAS_LANGGRAPH = True
except ImportError:
    HAS_LANGGRAPH = False
    StateGraph = object
    END = "END"

from src.core.constitution import AgentRole, VoteType
from src.core.types import NullVerdictState, SenateState
from src.memory.schema import PrecedentObject
from src.core.dragons import Onyx, Ignis, Hydra, RosettaArtifact

logger = logging.getLogger("TheNest.Senate")

# --- NODES ---

async def node_onyx_intent(state: SenateState):
    """Pass 1: Onyx checks if we should even try."""
    # logger.info("--- SENATE: ONYX INTENT CHECK ---")
    print("\n[SENATE] node_onyx_intent: Analysis running...")
    onyx = Onyx()
    vote = await onyx.audit(state['mission'])
    
    # Append vote to history
    new_votes = state.get('votes', []) + [vote]
    
    # If Null Verdict, prepare the state
    if vote['vote'] == VoteType.NULL:
        null_state = NullVerdictState(
            nulling_agents=[AgentRole.ONYX],
            reason_codes=[vote['reason']],
            context_summary=f"Refused at Intent Check: {vote['reason']}"
        )
        return {"votes": new_votes, "verdict": null_state}
    
    return {"votes": new_votes}

async def node_ignis_forge(state: SenateState):
    """Ignis builds the solution."""
    # logger.info("--- SENATE: IGNIS FORGE ---")
    print("[SENATE] node_ignis_forge: Forging artifact...")
    ignis = Ignis()
    # In a real loop, we would pass specific constraints from previous failures
    precedents = state.get('precedents', [])
    artifact = await ignis.forge(state['mission'], [], precedents)
    return {"artifact": artifact}

async def node_hydra_test(state: SenateState):
    """Hydra tries to break it."""
    # logger.info("--- SENATE: HYDRA TEST ---")
    print("[SENATE] node_hydra_test: Injecting venom...")
    hydra = Hydra()
    results = await hydra.inject_venom(state['artifact'], state['mission'])
    return {"test_results": results}

async def node_onyx_code(state: SenateState):
    """Pass 2: Onyx checks the binary signature and security."""
    # logger.info("--- SENATE: ONYX CODE CHECK ---")
    print("[SENATE] node_onyx_code: Verifying signature...")
    onyx = Onyx()
    vote = await onyx.audit(state['mission'], state['artifact'])
    
    new_votes = state.get('votes', []) + [vote]
    
    if vote['vote'] == VoteType.NULL:
        null_state = NullVerdictState(
            nulling_agents=[AgentRole.ONYX],
            reason_codes=[vote['reason']],
            context_summary=f"Refused at Code Check: {vote['reason']}"
        )
        return {"votes": new_votes, "verdict": null_state}

    return {"votes": new_votes, "verdict": "APPROVED"}

# --- EDGES ---

def check_intent_verdict(state: SenateState):
    """Route based on Onyx Intent."""
    # Check the latest vote or the verdict field
    if isinstance(state.get('verdict'), NullVerdictState):
        return "refused"
    return "authorized"

def check_test_results(state: SenateState):
    """Route based on Hydra."""
    results = state.get('test_results', {})
    if results.get('status') == "FAILED":
        # In V2, this would loop back to Ignis. 
        # For Genesis, we fail hard to ensure safety.
        return "failed" 
    return "passed"

def check_final_verdict(state: SenateState):
    """Route based on Onyx Code Check."""
    if isinstance(state.get('verdict'), NullVerdictState):
        return "refused"
    return "approved"

# --- THE GRAPH ---

def build_senate_graph():
    if not HAS_LANGGRAPH:
        return None

    workflow = StateGraph(SenateState)
    
    # Add Nodes
    workflow.add_node("onyx_intent", node_onyx_intent)
    workflow.add_node("ignis_forge", node_ignis_forge)
    workflow.add_node("hydra_test", node_hydra_test)
    workflow.add_node("onyx_code", node_onyx_code)
    
    # Set Entry Point
    workflow.set_entry_point("onyx_intent")
    
    # Add Conditional Edges
    workflow.add_conditional_edges(
        "onyx_intent",
        check_intent_verdict,
        {
            "refused": END,
            "authorized": "ignis_forge"
        }
    )
    
    workflow.add_edge("ignis_forge", "hydra_test")
    
    workflow.add_conditional_edges(
        "hydra_test",
        check_test_results,
        {
            "failed": END, # Could create a "FailedTestState" here
            "passed": "onyx_code"
        }
    )
    
    workflow.add_conditional_edges(
        "onyx_code",
        check_final_verdict,
        {
            "refused": END,
            "approved": END
        }
    )
    
    return workflow.compile()
