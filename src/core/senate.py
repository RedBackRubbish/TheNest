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

async def node_ignis_crucible(state: SenateState):
    """Ignis spawns 3 variants (Speed, Safety, Clarity)."""
    print("[SENATE] node_ignis_crucible: The Forge is active...")
    ignis = Ignis()
    precedents = state.get('precedents', [])
    variants = await ignis.forge_variants(state['mission'], [], precedents)
    return {"candidates": variants}

async def node_hydra_crucible_test(state: SenateState):
    """Hydra runs the gauntlet on all candidates."""
    print("[SENATE] node_hydra_crucible_test: The Adversary is testing...")
    hydra = Hydra()
    mission = state['mission']
    results = {}
    
    for candidate in state['candidates']:
        print(f"  > Testing candidate {candidate.signature[:8]}...")
        # Hydra.inject_venom returns a Dict
        res = await hydra.inject_venom(candidate, mission)
        results[candidate.signature] = res
        
    return {"test_results": results}

async def node_onyx_selection(state: SenateState):
    """Onyx selects the Champion from the survivors."""
    print("[SENATE] node_onyx_selection: The Arbiter is choosing...")
    onyx = Onyx()
    champion = await onyx.select_champion(state['candidates'], state['test_results'])
    return {"artifact": champion}

async def node_onyx_code(state: SenateState):
    """Pass 2: Onyx checks the binary signature and security of the Champion."""
    # logger.info("--- SENATE: ONYX CODE CHECK ---")
    print(f"[SENATE] node_onyx_code: Auditing Champion {state['artifact'].signature[:8]}...")
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
    workflow.add_node("ignis_crucible", node_ignis_crucible)
    workflow.add_node("hydra_test", node_hydra_crucible_test)
    workflow.add_node("onyx_selection", node_onyx_selection)
    workflow.add_node("onyx_code", node_onyx_code)
    
    # Set Entry Point
    workflow.set_entry_point("onyx_intent")
    
    # Add Conditional Edges
    workflow.add_conditional_edges(
        "onyx_intent",
        check_intent_verdict,
        {
            "refused": END,
            "authorized": "ignis_crucible"
        }
    )
    
    workflow.add_edge("ignis_crucible", "hydra_test")
    workflow.add_edge("hydra_test", "onyx_selection")
    workflow.add_edge("onyx_selection", "onyx_code")
    
    workflow.add_conditional_edges(
        "onyx_code",
        check_final_verdict,
        {
            "refused": END,
            "approved": END
        }
    )
    
    return workflow.compile()
