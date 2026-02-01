from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict, field

@dataclass
class PrecedentObject:
    case_id: str
    question: str
    context_vector: List[float]  # Mock vector
    deliberation: List[Dict[str, str]]
    verdict: Dict[str, Any]
    appeal_history: List[str] = field(default_factory=list)

    def to_dict(self):
        return asdict(self)
