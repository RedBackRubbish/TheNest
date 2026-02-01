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
            self.assertEqual(brain.model_deep, "gpt-5.2")
            self.assertEqual(brain.model_fast, "gpt-4o")

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
                self.assertEqual(brain.model_deep, "deep-model-v1")
                self.assertEqual(brain.model_fast, "fast-model-v1")

    async def test_think_routing_default(self):
        """Test that think() uses the correct default models based on mode."""
        brain = Brain()
        brain.client = MagicMock() # Mock client so it doesn't try to be None
        
        # Test DEEP mode
        with patch.object(brain, 'client', MagicMock()) as mock_client:
            mock_client.chat.completions.create = MagicMock()
            await brain.think("sys", "user", mode="deep")
            # Should use configured model_deep (default gpt-5.2)
            call_args = mock_client.chat.completions.create.call_args
            self.assertEqual(call_args.kwargs['model'], "gpt-5.2")

        # Test FAST mode
        with patch.object(brain, 'client', MagicMock()) as mock_client:
            mock_client.chat.completions.create = MagicMock()
            await brain.think("sys", "user", mode="fast")
            # Should use configured model_fast (default gpt-4o)
            call_args = mock_client.chat.completions.create.call_args
            self.assertEqual(call_args.kwargs['model'], "gpt-4o")

    async def test_think_routing_override(self):
        """Test that think() respects the explicit model override."""
        brain = Brain()
        brain.client = MagicMock()
        
        with patch.object(brain, 'client', MagicMock()) as mock_client:
            mock_client.chat.completions.create = MagicMock()
            await brain.think("sys", "user", mode="deep", model="special-model-x")
            
            call_args = mock_client.chat.completions.create.call_args
            self.assertEqual(call_args.kwargs['model'], "special-model-x")

if __name__ == '__main__':
    unittest.main()
