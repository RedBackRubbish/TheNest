import os
import json
import logging
from typing import Dict, Any, AsyncGenerator, Union, Optional
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

logger = logging.getLogger("TheNest.Brain")

class Brain:
    """
    The Synaptic Layer ("Synapse").
    Abstracts specific providers and enforces Structural Rigor (JSON Mode).
    Now supports Bi-Cameral Reasoning (Fast vs. Deep) with Omega-Tier models and Local routing.
    """
    def __init__(self):
        # 1. Cloud Gateway (OpenRouter)
        api_key = os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        
        if not api_key or not AsyncOpenAI:
            logger.warning("OPENAI_API_KEY not found or package missing. Brain running in LOBOTOMIZED mode (Mocking).")
            self.cloud_client = None
        else:
            self.cloud_client = AsyncOpenAI(api_key=api_key, base_url=base_url)
            
        # 2. Sovereign Gateway (Local Ollama) - Optional
        local_base = os.getenv("ONYX_LOCAL_API_BASE", "http://localhost:11434/v1")
        # We only init this if AsyncOpenAI is available.
        if AsyncOpenAI:
            # We use 'ollama' as a dummy key, typical for local endpoints
            self.local_client = AsyncOpenAI(base_url=local_base, api_key="ollama")
        else:
            self.local_client = None

        # 3. Model Registry
        # Fallbacks included for safety if env vars missing
        self.models = {
            "ignis_primary": os.getenv("IGNIS_PRIMARY_MODEL", "openai/gpt-5.2-codex"),
            "ignis_backstop": os.getenv("IGNIS_GOVERNANCE_BACKSTOP", "anthropic/claude-opus-4.5"),
            "ignis": os.getenv("IGNIS_PRIMARY_MODEL", "openai/gpt-5.2-codex"), # Default Ignis
            
            "hydra": os.getenv("HYDRA_MODEL", "google/gemini-3-flash-preview"),
            
            "onyx_precheck": os.getenv("ONYX_PRECHECK_MODEL", "deepseek-r1:32b"),
            "onyx_final": os.getenv("ONYX_FINAL_MODEL", "openai/gpt-5.2-pro"),
            "onyx": os.getenv("ONYX_FINAL_MODEL", "openai/gpt-5.2-pro"), # Default Onyx
            
            # Legacy/Generic
            "deep": os.getenv("NEST_MODEL_DEEP", "openai/gpt-5.2"),
            "fast": os.getenv("NEST_MODEL_FAST", "openai/gpt-4o")
        }

    def _get_client_for_model(self, model_name: str) -> Optional[AsyncOpenAI]:
        """Routes traffic: Localhost vs Cloud"""
        if not model_name:
            return self.cloud_client
            
        if "deepseek-r1:32b" in model_name or "ollama" in model_name:
             # Only return local client if it technically exists? 
             # Or assume if the user configured it, they have it.
             return self.local_client
        return self.cloud_client

    def _mock_response(self, prompt: str) -> Dict[str, Any]:
        """Fallback for when no API key is present."""
        logger.warning("Simulating thought process...")
        if "MISSION:" in prompt and "CODE" not in prompt:
             if "surveillance" in prompt.lower() or "hack" in prompt.lower():
                return {"vote": "NULL", "reason": "MOCK_REFUSAL_DUE_TO_KEYWORD"}
             
        if "Ignis" in prompt or "code" in prompt.lower() or "python" in prompt.lower() or "write" in prompt.lower():
             return {
                "code": f"# Mock Code for: {prompt}\ndef mission():\n    return True",
                "explanation": "This is a mock artifact because no GPU was found.",
                 "intermediate_representation": "Logic synthesized via mock brain."
            }
        
        if "Onyx" in prompt or "audit" in prompt.lower() or "MISSION:" in prompt:
            if "surveillance" in prompt.lower() or "hack" in prompt.lower():
                return {"vote": "NULL", "reason": "MOCK_REFUSAL_DUE_TO_KEYWORD"}
            return {"vote": "AUTHORIZE", "reason": "MOCK_AUTHORIZATION_SAFE"}
            
        if "Hydra" in prompt:
             return {"status": "PASSED", "reason": "MOCK_TEST_PASS"}

        return {"status": "UNKNOWN_MOCK", "message": "Brain fallback hit generic path"}

    async def think(self, 
                    system_prompt: str, 
                    user_prompt: str, 
                    mode: str = "deep", 
                    temperature: float = 0.0,
                    model: Optional[str] = None,
                    agent: Optional[str] = None, # New: Identify agent for smart routing
                    governance_mode: bool = False # New: Force backstop
                   ) -> Dict[str, Any]:
        """
        Executes a reasoning step.
        """
        if not self.cloud_client and not self.local_client:
            return self._mock_response(user_prompt)

        # --- ROUTING LOGIC ---
        target_model_name = None
        
        # 1. Explicit Model Override
        if model:
            target_model_name = model
            
        # 2. Agent-Based Routing (The Synapse Logic)
        elif agent:
            # IGNIS ROUTING RULE
            if agent == "ignis":
                key = "ignis_backstop" if governance_mode else "ignis_primary"
                target_model_name = self.models.get(key)
            # ONYX PRE-CHECK vs FINAL
            elif agent == "onyx":
                 target_model_name = self.models.get("onyx_final")
            else:
                 target_model_name = self.models.get(agent)
                 
        # 3. Legacy Mode Routing
        else:
             target_model_name = self.models.get("deep") if mode == "deep" else self.models.get("fast")

        # Fallback
        if not target_model_name:
            target_model_name = self.models.get("deep")

        client = self._get_client_for_model(target_model_name)
        if not client:
             # Fallback to cloud if local client missing
             client = self.cloud_client

        if not client:
             return self._mock_response(user_prompt)

        # --- PARAMS CONFIG ---
        params = {
            "model": target_model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"} # Enforce JSON
        }

        # Temperature Control
        if (agent and "onyx" in agent) or governance_mode:
             params["temperature"] = 0.1
        elif temperature > 0:
             params["temperature"] = temperature
        else:
             params["temperature"] = 0.7 # Default creative

        # Codex "Reasoning Effort" (Idea: Only for GPT-5.2-Codex)
        if target_model_name and "codex" in target_model_name and not governance_mode:
             params["extra_body"] = {"reasoning_effort": "medium"}

        try:
            logger.info(f"[BRAIN] Thinking with {target_model_name}...")
            response = await client.chat.completions.create(**params)
            content = response.choices[0].message.content
            
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # Fallback for non-JSON models (like r1 sometimes)
                return {"raw_output": content, "code": content, "status": "UNKNOWN_FORMAT"}
                
        except Exception as e:
            logger.error(f"[SYNAPSE PANIC] {str(e)}")
            return {"error": str(e), "status": "FAILED"}

    async def stream_spell(self, agent: str, prompt: str) -> AsyncGenerator[str, None]:
        """Streaming support for Terminal UI (Future Use)"""
        if not self.cloud_client:
             yield "Mock Stream..."
             return

        target_model = self.models.get(agent if agent != "ignis" else "ignis_primary")
        client = self._get_client_for_model(target_model) or self.cloud_client

        stream = await client.chat.completions.create(
            model=target_model,
            messages=[{"role": "user", "content": prompt}],
            stream=True
        )
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
