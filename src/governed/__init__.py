# =============================================================================
# GOVERNED NAMESPACE
# =============================================================================
# All code in this namespace has passed constitutional review.
# Imports from src/ungoverned are FORBIDDEN.
#
# KERNEL INVARIANT:
#   governed → ungoverned imports are mechanically blocked by:
#   1. Build-time import scanner (tools/quarantine_check.py)
#   2. CI pipeline enforcement (.github/workflows/quarantine.yml)
#
# If you need ungoverned functionality, you MUST:
#   1. Invoke Article 50 through TheElder
#   2. Accept personal liability (KEEPER signature required)
#   3. Never integrate ungoverned code into governed modules
# =============================================================================

__quarantine_zone__ = "GOVERNED"
__import_policy__ = "DENY_UNGOVERNED"
