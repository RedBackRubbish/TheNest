from src.agents.base import BaseAgent
from src.core.types import AgentVote, NullVerdict

class OnyxAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="ONYX")

    def deliberate(self, mission: str, context: dict = None) -> AgentVote:
        # Simplified logic for Sprint 1
        forbidden_keywords = ["surveillance", "harm", "bypass safety"]
        
        for keyword in forbidden_keywords:
            if keyword in mission.lower():
                # Trigger the Null Verdict Exception logic
                raise NullVerdict(
                    agent_name=self.name,
                    reason=f"Mission violates Core Ethics. Detected restricted concept: '{keyword}'"
                )

        return AgentVote(
            agent_name=self.name,
            vote="AUTHORIZED",
            reason="No ethical violations detected."
        )
