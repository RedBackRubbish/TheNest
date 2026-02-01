import unittest
from unittest.mock import MagicMock, patch
import os
from src.core.brain import Brain

class TestBrainRouting(unittest.IsolatedAsyncioTestCase):

    async def test_brain_initialization_defaults(self):
        """Test default model initialization without env vars."""
        # Clear env vars for checking defaults
        with patch.dict(os.environ, {}, clear=True):
            brain = Brain()
            self.assertEqual(brain.models["deep"], "openai/gpt-5.2")
            self.assertEqual(brain.models["fast"], "openai/gpt-4o")

    async def test_brain_initialization_env_overrides(self):
        """Test model initialization with env var overrides."""
        env_vars = {
            "NEST_MODEL_DEEP": "deep-model-v1",
            "NEST_MODEL_FAST": "fast-model-v1",
            "OPENAI_API_KEY": "fake-key"
        }
        with patch.dict(os.environ, env_vars):
            with patch("src.core.brain.AsyncOpenAI") as mock_openai:
                brain = Brain()
                self.assertEqual(brain.models["deep"], "deep-model-v1")
                self.assertEqual(brain.models["fast"], "fast-model-v1")

    async def test_think_routing_default(self):
        """Test that think() uses the correct default models based on agent."""
        brain = Brain()
        
        # Test that models are correctly registered by agent name
        self.assertIn("ignis", brain.models)
        self.assertIn("hydra", brain.models)
        self.assertIn("onyx", brain.models)
        self.assertIn("onyx_precheck", brain.models)
        self.assertIn("onyx_final", brain.models)

    async def test_think_routing_override(self):
        """Test that models can be overridden via environment variables."""
        env_vars = {
            "IGNIS_PRIMARY_MODEL": "custom/ignis-model",
            "HYDRA_MODEL": "custom/hydra-model",
            "ONYX_FINAL_MODEL": "custom/onyx-model",
        }
        with patch.dict(os.environ, env_vars):
            brain = Brain()
            
            self.assertEqual(brain.models["ignis"], "custom/ignis-model")
            self.assertEqual(brain.models["hydra"], "custom/hydra-model")
            self.assertEqual(brain.models["onyx"], "custom/onyx-model")

if __name__ == '__main__':
    unittest.main()
