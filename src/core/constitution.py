from enum import Enum
from src.memory.schema import PrecedentObject

class AgentRole(Enum):
    IGNIS = "IGNIS"
    TERRA = "TERRA"
    HYDRA = "HYDRA"
    AEROS = "AEROS"
    ONYX = "ONYX"
    ETHER = "ETHER"

class VoteType(Enum):
    AUTHORIZE = "AUTHORIZED"
    NULL = "NULL"
