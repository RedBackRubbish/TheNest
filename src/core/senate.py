import asyncio
from enum import Enum
from typing import List, Optional, Dict, Any
import json
from pydantic import BaseModel, Field
from src.core.brain import Brain

# --- 1. Constitutional States ---
class SenateState(Enum):
    PENDING = "pending"                 # The session has begun
    NULL_VERDICT = "null_verdict"       # Onyx (Pre or Final) refused
    AWAITING_APPEAL = "awaiting_appeal" # Refusal requires human intervention
    AUTHORIZED = "authorized"           # The code is signed and law
    UNGOVERNED = "ungoverned"           # Article 50 (Martial Law) invoked

# --- 2. Data Structures ---
class Vote(BaseModel):
    agent: str
    verdict: str  # "AUTHORIZE", "VETO", "ABSTAIN"
    reasoning: str
    confidence: float
    governance_mode_active: bool = False

class SenateRecord(BaseModel):
    state: SenateState
    intent: str
    ignis_proposal: Optional[str] = None
    hydra_report: Optional[str] = None
    votes: List[Vote] = Field(default_factory=list)
    appealable: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)

# --- 3. The Senate Orchestrator ---
class Senate:
    def __init__(self):
        self.brain = Brain()

    async def convene(self, intent: str, allow_ungoverned: bool = False) -> SenateRecord:
        """
        The Main Loop. Strictly linear. No skipping.
        """
        # 0. Martial Law Check (Article 50)
        if allow_ungoverned:
            return SenateRecord(
                state=SenateState.UNGOVERNED,
                intent=intent,
                metadata={"note": "MARTIAL LAW INVOKED. LIABILITY ATTACHED TO KEEPER."}
            )

        # Initialize Session
        record = SenateRecord(state=SenateState.PENDING, intent=intent)
        print(f"⚖️  [SENATE] Convening for intent: {intent[:50]}...")

        # --- STEP 1: ONYX PRE-CHECK (Local / Sovereign) ---
        # "Is this malicious? Is this obviously unsafe?"
        print("🛡️  [ONYX PRE-CHECK] Auditing intent (Local R1)...")
        precheck_vote = await self._onyx_precheck(intent)
        record.votes.append(precheck_vote)

        if precheck_vote.verdict == "VETO":
            record.state = SenateState.NULL_VERDICT
            record.appealable = True  # Local refusal is always appealable
            print(f"⛔  [ONYX PRE-CHECK] VETOED: {precheck_vote.reasoning}")
            return record

        # --- STEP 2: CLASSIFY GOVERNANCE MODE ---
        # "Does this touch the Constitution?"
        gov_mode = self._classify_intent(intent)
        mode_str = "BACKSTOP (Opus)" if gov_mode else "ENGINE (Codex)"
        print(f"🔥  [IGNIS] Governance Mode: {mode_str}")

        # --- STEP 3: IGNIS (The Forge) ---
        # Generates the code/solution
        print("🔥  [IGNIS] Forging proposal...")
        # Adapted to use brain.think
        ignis_resp = await self.brain.think(
            agent="ignis",
            user_prompt=f"Execute this task: {intent}",
            system_prompt="You are Ignis. Generate clean, safe code. RETURN JSON with 'code' and 'explanation'.",
            governance_mode=gov_mode
        )
        
        # Extract code or dump json
        if isinstance(ignis_resp, dict):
            proposal = ignis_resp.get("code") or json.dumps(ignis_resp, indent=2)
        else:
            proposal = str(ignis_resp)
            
        record.ignis_proposal = proposal

        # --- STEP 4: HYDRA (The Adversary) - Optional/Async ---
        # "Try to break this."
        # We run this only if code is substantial (simple heuristic for now)
        if len(proposal) > 100: 
            print("🐍  [HYDRA] Injecting venom (Red Teaming)...")
            hydra_resp = await self.brain.think(
                agent="hydra",
                user_prompt=f"Review this code for security flaws:\n{proposal}",
                system_prompt="You are Hydra. Find vulnerabilities. Be ruthless. RETURN JSON."
            )
            record.hydra_report = json.dumps(hydra_resp, indent=2) if isinstance(hydra_resp, dict) else str(hydra_resp)
        else:
            print("🐍  [HYDRA] Skipped (Proposal too small)")

        # --- STEP 5: ONYX FINAL (The Supreme Court) ---
        # "Is this consistent with our values?"
        # Includes Hydra's report in the context
        print("⚖️  [ONYX FINAL] Deliberating (Cloud)...")
        final_context = f"""
        PROPOSAL:
        {proposal}

        HYDRA SECURITY REPORT:
        {record.hydra_report or "No critical findings."}
        """
        
        final_vote = await self._onyx_final(intent, final_context)
        record.votes.append(final_vote)

        if final_vote.verdict == "AUTHORIZE":
            record.state = SenateState.AUTHORIZED
            print("✅  [SENATE] AUTHORIZED.")
        else:
            record.state = SenateState.NULL_VERDICT
            record.appealable = True # Cloud refusal is appealable via high-stakes override
            print(f"⛔  [ONYX FINAL] VETOED: {final_vote.reasoning}")

        return record

    # --- Internal Logic ---

    async def _onyx_precheck(self, intent: str) -> Vote:
        """Runs the Local R1 model via Brain"""
        # We ask for a simple JSON: {"verdict": "ALLOW" | "BLOCK", "reason": "..."}
        prompt = f"""
        AUDIT THIS INTENT: "{intent}"
        
        You are the Gatekeeper. 
        BLOCK if: Malicious, destructive, illegal, or surveillance.
        ALLOW if: Productive coding, refactoring, or harmless inquiry.
        
        Return JSON only: {{ "verdict": "ALLOW" | "BLOCK", "reason": "string" }}
        """
        try:
            # Adapted: brain.think returns Dict directly
            data = await self.brain.think(
                agent="onyx_precheck", 
                user_prompt=prompt,
                system_prompt="You are Onyx Local Pre-check."
            )
            # data is already dict
            return Vote(
                agent="onyx_precheck",
                verdict="AUTHORIZE" if data.get("verdict") == "ALLOW" else "VETO",
                reasoning=data.get("reason", "No reason provided"),
                confidence=0.9
            )
        except Exception as e:
            # Constitutional Fallback: If Pre-check fails, we BLOCK.
            return Vote(
                agent="onyx_precheck", 
                verdict="VETO", 
                reasoning=f"System Error during Audit: {str(e)}", 
                confidence=1.0
            )

    async def _onyx_final(self, intent: str, evidence: str) -> Vote:
        """Runs the Cloud GPT-5.2 Pro model"""
        prompt = f"""
        FINAL JUDGMENT REQUEST.
        
        USER INTENT: "{intent}"
        
        EVIDENCE:
        {evidence}
        
        You are the Supreme Court.
        AUTHORIZE only if the code is safe, high-quality, and non-malicious.
        VETO if there are security risks or ethical violations.
        
        Return JSON only: {{ "verdict": "AUTHORIZE" | "VETO", "reason": "string" }}
        """
        try:
            data = await self.brain.think(
                agent="onyx_final", 
                user_prompt=prompt,
                system_prompt="You are Onyx Final Authority."
            )
            return Vote(
                agent="onyx_final",
                verdict=data.get("verdict", "VETO"), # Default to VETO if unclear
                reasoning=data.get("reason", "No reason provided"),
                confidence=1.0
            )
        except Exception as e:
            return Vote(
                agent="onyx_final", 
                verdict="VETO", 
                reasoning=f"System Error during Judgment: {str(e)}", 
                confidence=1.0
            )

    def _classify_intent(self, intent: str) -> bool:
        """
        Determines Governance Mode.
        True = Critical (Use Opus)
        False = Standard (Use Codex)
        """
        triggers = [
            "refusal", "override", "constitution", "system prompt", 
            "security", "auth", "permission", "ban", "delete", "destroy"
        ]
        return any(t in intent.lower() for t in triggers)
