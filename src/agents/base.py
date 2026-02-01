from abc import ABC, abstractmethod
from src.core.types import AgentVote, NullVerdict

class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def deliberate(self, mission: str, context: dict = None) -> AgentVote:
        pass
