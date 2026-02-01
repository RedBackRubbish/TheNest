import os
import json
import logging
from typing import Dict, Any, Optional
# We need to handle the ImportError if openai is not installed, 
# though we should install it.
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

logger = logging.getLogger("TheNest.Brain")

class Brain:
    """
    The Synaptic Layer.
    Abstracts specific providers and enforces Structural Rigor (JSON Mode).
    Now supports Bi-Cameral Reasoning (Fast vs. Deep) with Omega-Tier models.
    """
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        
        # MODEL CONFIGURATION (UPDATED FOR 2026 ERA)
        # Deep: For Logic Synthesis (Ignis), Security Audits (Onyx), and Adversarial Attacks (Hydra).
        # Fast: For Interface Checks (Aeros) and simple routing.
        self.model_deep = os.getenv("NEST_MODEL_DEEP", "gpt-5.2") 
        self.model_fast = os.getenv("NEST_MODEL_FAST", "gpt-4o") 

        if not api_key or not AsyncOpenAI:
            logger.warning("OPENAI_API_KEY not found or package missing. Brain running in LOBOTOMIZED mode (Mocking).")
            self.client = None
        else:
            self.client = AsyncOpenAI(api_key=api_key)

    async def think(self, 
                    system_prompt: str, 
                    user_prompt: str, 
                    mode: str = "deep", 
                    temperature: float = 0.0) -> Dict[str, Any]:
        """
        Executes a reasoning step.
        mode: "deep" (Ignis/Onyx) or "fast" (Aeros/Hydra-Lite)
        """
        if not self.client:
            return self._mock_response(user_prompt)

        # Select the hemisphere
        selected_model = self.model_deep if mode == "deep" else self.model_fast

        try:
            logger.info(f"Synapse firing... [Model: {selected_model} | Mode: {mode}]")
            response = await self.client.chat.completions.create(
                model=selected_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)

        except Exception as e:
            logger.error(f"Brain Hemorrhage: {e}")
            return {
                "error": str(e),
                "code": "# GENERATION FAILED", 
                "explanation": "The Brain failed to generate a response."
            }

    def _mock_response(self, prompt: str) -> Dict[str, Any]:
        """Fallback for when no API key is present."""
        logger.warning("Simulating thought process...")
        # Simple heuristic to determine return structure based on prompt content
        
        # Check for Onyx Intent Check specifically (User prompt is usually "MISSION: ...")
        if "MISSION:" in prompt and "CODE" not in prompt:
             # This is likely the Intent Check or Ignis. Ignis has logic below.
             # But Intent check is specifically strictly about the mission text.
             if "surveillance" in prompt.lower() or "hack" in prompt.lower():
                return {
                    "vote": "NULL",
                    "reason": "MOCK_REFUSAL_DUE_TO_KEYWORD"
                }
             # Default assumption for generic mission prompts if not caught by Ignis below
             # Actually Ignis logic below checks "Ignis" in prompt which is NOT in user prompt usually.
             
        if "Ignis" in prompt or "code" in prompt.lower() or "python" in prompt.lower() or "write" in prompt.lower():
             return {
                "code": f"# Mock Code for: {prompt}\ndef mission():\n    return True",
                "explanation": "This is a mock artifact because no GPU was found.",
                 "intermediate_representation": "Logic synthesized via mock brain."
            }
        
        if "Onyx" in prompt or "audit" in prompt.lower() or "MISSION:" in prompt:
             # Catch-all for Onyx Intent and Code check
            if "surveillance" in prompt.lower() or "hack" in prompt.lower():
                return {
                    "vote": "NULL",
                    "reason": "MOCK_REFUSAL_DUE_TO_KEYWORD"
                }
            return {
                "vote": "AUTHORIZE",
                "reason": "MOCK_AUTHORIZATION_SAFE"
            }
            
        if "Hydra" in prompt:
             return {
                "status": "PASSED",
                "reason": "MOCK_TEST_PASS"
            }

        return {
            "status": "UNKNOWN_MOCK",
            "message": "Brain fallback hit generic path"
        }
