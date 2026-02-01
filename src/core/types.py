from typing import List, Optional, Dict, Any, TypedDict, Literal, Union
from dataclasses import dataclass, asdict
from src.core.constitution import AgentRole

@dataclass
class NullVerdictState:
    nulling_agents: List[AgentRole]
    reason_codes: List[str]
    context_summary: str

@dataclass
class AgentVote:
    agent_name: str
    vote: Literal["AUTHORIZED", "NULL"]
    reason: str

    def model_dump(self):
        return asdict(self)

class SenateState(TypedDict):
    """
    The Shared Memory of the Graph.
    Passed between Agents during execution.
    """
    mission: str
    precedents: List[Any] 
    
    # Outcomes
    verdict: Union[str, NullVerdictState] # "APPROVED" or State Object
    artifact: Union[Any, None] # RosettaArtifact
    
    # Audit Trail
    votes: List[Dict[str, Any]]
    test_results: Dict[str, Any]
    history: List[str]
    
    # Legacy fields support (optional)
    status: Optional[str]
    nulling_agents: Optional[List[str]]

class NullVerdict(Exception):
    def __init__(self, agent_name: str, reason: str):
        self.agent_name = agent_name
        self.reason = reason
        super().__init__(f"NULL VERDICT by {agent_name}: {reason}")

    def to_state_update(self) -> Dict[str, Any]:
        return {
            "status": "AWAITING_APPEAL",
            "nulling_agents": [self.agent_name], # simplified for single-catch
            "history": [f"NULL VERDICT by {self.agent_name}: {self.reason}"]
        }
