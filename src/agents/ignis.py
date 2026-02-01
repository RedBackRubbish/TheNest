from src.agents.base import BaseAgent
from src.core.types import AgentVote

class IgnisAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="IGNIS")

    def deliberate(self, mission: str, context: dict = None) -> AgentVote:
        return AgentVote(
            agent_name=self.name,
            vote="AUTHORIZED",
            reason="Technical implementation is feasible."
        )
