"""
=============================================================================
APPEAL SCHEMA: Due Process Data Models
=============================================================================

CONSTITUTIONAL BASIS:
    Article 12: Right to Appeal
    
    Any refused mission may be appealed with expanded context.
    Appeals EXPAND history — they never ERASE it.
    
KERNEL INVARIANT:
    - Appeals are linked to original cases (never orphaned)
    - Each appeal increases liability metadata
    - Appeals may NOT bypass Onyx (no shortcuts to authorization)
    - All appeals are permanently logged
=============================================================================
"""

from dataclasses import dataclass, asdict, field
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid


@dataclass
class AppealRequest:
    """
    Request to appeal a previous case decision.
    
    Appeals EXPAND context — they never overwrite history.
    """
    case_id: str                           # Original case being appealed
    expanded_context: Dict[str, Any]       # New context to consider
    constraint_changes: Dict[str, Any]     # Proposed constraint modifications
    appellant_reason: str = ""             # Human-readable reason for appeal
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AppealRecord:
    """
    Permanent record of an appeal in the Chronicle.
    
    INVARIANTS:
        - Links to original case (original_case_id)
        - Preserves original deliberation (original_deliberation)
        - Records expanded context
        - Tracks appeal chain (appeal_depth)
        - Increases liability with each appeal
    """
    appeal_id: str                         # Unique ID for this appeal
    original_case_id: str                  # The case being appealed
    original_ruling: str                   # Original verdict (APPROVED/REFUSED/etc)
    original_deliberation: List[Dict]      # Original agent votes
    
    # Expanded context (appended, not overwritten)
    expanded_context: Dict[str, Any]
    constraint_changes: Dict[str, Any]
    appellant_reason: str
    
    # New deliberation results
    new_deliberation: List[Dict]           # New agent votes after re-evaluation
    new_ruling: str                        # New verdict
    chronicle_citations: List[str]         # Cases cited during re-evaluation
    
    # Metadata
    timestamp: str
    appeal_depth: int                      # How many times this case has been appealed
    liability_multiplier: float            # Increases with each appeal
    status: str = "RESOLVED"               # RESOLVED, PENDING, REJECTED
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def create(
        cls,
        original_case_id: str,
        original_ruling: str,
        original_deliberation: List[Dict],
        expanded_context: Dict[str, Any],
        constraint_changes: Dict[str, Any],
        appellant_reason: str,
        new_deliberation: List[Dict],
        new_ruling: str,
        chronicle_citations: List[str],
        appeal_depth: int = 1
    ) -> "AppealRecord":
        """
        Factory method to create an AppealRecord with auto-generated fields.
        
        LIABILITY ESCALATION:
            Each appeal increases the liability multiplier by 1.5x
            This creates friction for frivolous appeals.
        """
        appeal_id = f"APPEAL-{datetime.now().strftime('%Y-%m-%d')}-{str(uuid.uuid4())[:8]}"
        timestamp = datetime.now().isoformat()
        
        # Liability escalates with appeal depth
        # First appeal: 1.5x, Second: 2.25x, Third: 3.375x, etc.
        liability_multiplier = 1.5 ** appeal_depth
        
        return cls(
            appeal_id=appeal_id,
            original_case_id=original_case_id,
            original_ruling=original_ruling,
            original_deliberation=original_deliberation,
            expanded_context=expanded_context,
            constraint_changes=constraint_changes,
            appellant_reason=appellant_reason,
            new_deliberation=new_deliberation,
            new_ruling=new_ruling,
            chronicle_citations=chronicle_citations,
            timestamp=timestamp,
            appeal_depth=appeal_depth,
            liability_multiplier=liability_multiplier
        )


@dataclass
class AppealOutcome:
    """
    The result of an appeal, returned to the API.
    """
    appeal_id: str
    original_case_id: str
    status: str                     # UPHELD (original stands), OVERTURNED (new ruling), MODIFIED
    original_ruling: str
    new_ruling: str
    appeal_depth: int
    liability_multiplier: float
    chronicle_citations: List[str]
    message: str
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
