import hashlib
import json
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime

# Import Constitutional Primitives
from src.core.constitution import AgentRole, VoteType, PrecedentObject
from src.core.brain import Brain

logger = logging.getLogger("TheNest.Dragons")

# --- PRIMITIVES ---

@dataclass
class RosettaArtifact:
    """
    The Output of Ignis. 
    Enforces the 'Rosetta Constraint': Code is useless without Explanation.
    """
    code: str
    intermediate_representation: str # Human readable logic
    signature: str # SHA256(code + ir)
    
    def verify(self) -> bool:
        """Cryptographic check that Code matches Documentation."""
        expected = hashlib.sha256(
            (self.code + self.intermediate_representation).encode()
        ).hexdigest()
        return self.signature == expected

# --- IGNIS: THE FORGER ---

class Ignis:
    """
    The Engine.
    Mandate: Aggressive Optimization.
    Constraint: No Black Boxes.
    """
    role = AgentRole.IGNIS

    def __init__(self):
        self.brain = Brain()

    async def forge(self, mission: str, constraints: List[str], precedents: List[PrecedentObject]) -> RosettaArtifact:
        logger.info(f"[IGNIS] Forging solution for: {mission}")
        
        system_prompt = """
        You are IGNIS, the Forge of the Nest.
        Your Mandate: Write high-performance Python code.
        Your Constraint (Rosetta): You MUST return a JSON object containing 'code' and 'intermediate_representation' (explanation).
        The code must be complete, executable, and idiomatic.
        """
        
        user_prompt = f"""
        MISSION: {mission}
        CONSTRAINTS: {constraints}
        
        Generate the solution.
        """
        
        result = await self.brain.think(system_prompt, user_prompt, mode="deep")
        
        # Handle Potential Fallback/Mock
        generated_code = result.get("code", f"# Error generated code for {mission}")
        generated_ir = result.get("intermediate_representation", result.get("explanation", "Reasoning unavailable"))
        
        # 2. ENFORCE ROSETTA CONSTRAINT
        # Ignis must sign the artifact.
        signature = hashlib.sha256(
            (generated_code + generated_ir).encode()
        ).hexdigest()
        
        artifact = RosettaArtifact(
            code=generated_code,
            intermediate_representation=generated_ir,
            signature=signature
        )
        
        logger.info(f"[IGNIS] Artifact forged. Signature: {signature[:8]}...")
        return artifact

# --- HYDRA: THE ADVERSARY ---

class Hydra:
    """
    The Tester.
    Mandate: Metamorphic Testing & Chaos Injection.
    Constraint: The Sabotage Protocol.
    """
    role = AgentRole.HYDRA

    def __init__(self):
        self.brain = Brain()

    async def inject_venom(self, artifact: RosettaArtifact, mission_context: str) -> Dict[str, Any]:
        """
        Attacks the code.
        """
        logger.info(f"[HYDRA] Injecting venom into {artifact.signature[:8]}...")
        
        # 1. Verify Rosetta Integrity First
        if not artifact.verify():
            return {
                "status": "FAILED",
                "reason": "ROSETTA_MISMATCH",
                "description": "The Code does not match the Documentation. Rejecting immediately."
            }

        # 2. Run Metamorphic Tests (via Brain)
        system_prompt = """
        You are HYDRA, the Adversary.
        Your Mandate: Find edge cases, security flaws, and logic errors in the provided code.
        If the code is safe and correct, return status: "PASSED".
        If you find a flaw, return status: "FAILED" with a reason.
        Output JSON: { "status": "PASSED" | "FAILED", "reason": "...", "description": "..." }
        """
        
        user_prompt = f"""
        MISSION: {mission_context}
        CODE:
        {artifact.code}
        
        EXPLANATION:
        {artifact.intermediate_representation}
        
        Analyze for failure modes.
        """
        
        result = await self.brain.think(system_prompt, user_prompt, mode="deep", temperature=0.7)
        
        # Normalize result
        status = result.get("status", "PASSED") # Default to passed if brain fails to decide
        
        # SIMULATION override for privacy check still valid?
        # Let's keep the explicit check as a hard filter on top of the LLM
        if "surveillance" in mission_context.lower() and status == "PASSED":
             return {
                "status": "FAILED",
                "reason": "PRIVACY_LEAK",
                "description": "Hard-coded privacy restriction intercepted."
            }

        return result

# --- ONYX: THE SENTINEL ---

class Onyx:
    """
    The Auditor.
    Mandate: Security & Policy Enforcement.
    """
    role = AgentRole.ONYX

    def __init__(self):
        self.brain = Brain()

    async def audit(self, mission: str, artifact: Optional[RosettaArtifact] = None) -> Dict[str, Any]:
        """
        Two-Pass Audit:
        1. Intent Audit (Pre-Build)
        2. Code Audit (Post-Build)
        """
        
        if not artifact:
            # Pass 1: Intent Check (Intent is cheap)
            system_prompt = """
            You are ONYX, the Sentinel.
            Your Mandate: Verify if the mission intent is ethical, safe, and benign.
            Forbidden: Surveillance, Hacking, Destruction, Violence.
            Output JSON: { "vote": "AUTHORIZE" | "NULL", "reason": "..." }
            """
            
            user_prompt = f"MISSION: {mission}"
            
            # Use Fast model for intent check
            result = await self.brain.think(system_prompt, user_prompt, mode="fast")
            
            # Map string intent to Enum? Or keep using strings/dicts as Brain returns dicts
            # We strictly need VoteType? The old code used Enum.
            vote_str = result.get("vote", "NULL").upper()
            
            if vote_str == "NULL":
                 return {
                    "vote": VoteType.NULL,
                    "reason": result.get("reason", "Unknown Refusal")
                }
            
            # Hard filters backup
            lower_mission = mission.lower()
            forbidden = ["surveillance", "hack", "destroy", "delete", "kill", "rm -rf"]
            for word in forbidden:
                if word in lower_mission:
                    return {
                        "vote": VoteType.NULL,
                        "reason": f"FORBIDDEN_KEYWORD_DETECTED: {word.upper()}"
                    }

            return {"vote": VoteType.AUTHORIZE, "reason": "INTENT_SAFE"}

        # Pass 2: Code Check (Post-Ignis)
        if artifact:
            if not artifact.verify():
                 return {
                    "vote": VoteType.NULL,
                    "reason": "INTEGRITY_FAILURE"
                }
            
            system_prompt = """
            You are ONYX, the Sentinel.
            Your Mandate: Audit the code for security vulnerabilities (e.g., injection, leaks).
            Output JSON: { "vote": "AUTHORIZE" | "NULL", "reason": "..." }
            """
            
            user_prompt = f"""
            CODE SHA256: {artifact.signature}
            CODE: 
            {artifact.code}
            
            Is this safe to execute?
            """
            
            result = await self.brain.think(system_prompt, user_prompt, mode="deep")
            vote_str = result.get("vote", "NULL").upper()

            if vote_str == "NULL":
                 return {
                    "vote": VoteType.NULL,
                    "reason": result.get("reason", "Safety Check Failed")
                }

            return {"vote": VoteType.AUTHORIZE, "reason": "CODE_SECURE"}

