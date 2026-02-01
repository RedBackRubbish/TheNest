from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict, field
from datetime import datetime


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


@dataclass
class NullVerdictRecord:
    """
    =========================================================================
    KERNEL INVARIANT: NullVerdict Durability (Fail-Closed Persistence)
    =========================================================================
    
    A NullVerdict that is not persisted is constitutionally INVALID.
    
    Every refusal MUST be durably persisted BEFORE the API returns.
    If persistence fails, the system MUST fail closed (mission refused,
    error propagated, no silent failures).
    
    This record is APPEND-ONLY. No updates. No deletes. Ever.
    =========================================================================
    """
    case_id: str
    mission: str
    nulling_agents: List[str]  # Agents that issued NULL votes
    reason_codes: List[str]    # Reasons for refusal
    timestamp: str             # ISO format timestamp
    context_summary: str = ""  # Human-readable summary
    
    # Metadata
    verdict_type: str = "NULL_VERDICT"  # Distinguishes from APPROVED cases
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def create(
        cls,
        mission: str,
        nulling_agents: List[str],
        reason_codes: List[str],
        context_summary: str = ""
    ) -> "NullVerdictRecord":
        """
        Factory method to create a NullVerdictRecord with auto-generated fields.
        """
        import uuid
        case_id = f"NULL-{datetime.now().strftime('%Y-%m-%d')}-{str(uuid.uuid4())[:8]}"
        timestamp = datetime.now().isoformat()
        
        return cls(
            case_id=case_id,
            mission=mission,
            nulling_agents=nulling_agents,
            reason_codes=reason_codes,
            timestamp=timestamp,
            context_summary=context_summary or "; ".join(reason_codes)
        )
