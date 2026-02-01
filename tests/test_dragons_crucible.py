import unittest
from unittest.mock import MagicMock, patch, AsyncMock
import os
import hashlib
from src.core.dragons import Ignis, Hydra, Onyx, RosettaArtifact
from src.core.constitution import VoteType

class TestDragonsCrucible(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        # Default mock response for brain
        self.mock_brain_response = {
            "code": "print('Hello World')",
            "intermediate_representation": "Logic explanation",
            "status": "PASSED",
            "vote": "AUTHORIZE",
            "reason": "Test Reason",
            "selected_signature": "mock_sig"
        }

    @patch("src.core.dragons.Brain")
    async def test_ignis_forge_variants(self, MockBrain):
        """Ignis should forge 3 variants (SPEED, SAFETY, CLARITY)."""
        # Setup Environment and Mock
        with patch.dict(os.environ, {"IGNIS_MODEL": "ignis-model-v2"}):
            ignis = Ignis()
            
            # Verify initialization picked up the model
            self.assertEqual(ignis.model, "ignis-model-v2")
            
            # Setup Brain Mock
            mock_brain_instance = MockBrain.return_value
            mock_brain_instance.think = AsyncMock(return_value=self.mock_brain_response)
            
            # Run Forge Variants
            variants = await ignis.forge_variants("Mission", [], [])
            
            # Assertions
            self.assertEqual(len(variants), 3)
            self.assertEqual(variants[0].code, "print('Hello World')")
            
            # Verify Brain was called 3 times with the correct model
            self.assertEqual(mock_brain_instance.think.call_count, 3)
            call_args = mock_brain_instance.think.call_args
            self.assertEqual(call_args.kwargs['model'], "ignis-model-v2")

    @patch("src.core.dragons.Brain")
    async def test_hydra_inject_venom(self, MockBrain):
        """Hydra should check integrity and run tests."""
        with patch.dict(os.environ, {"HYDRA_MODEL": "hydra-model-v2"}):
            hydra = Hydra()
            self.assertEqual(hydra.model, "hydra-model-v2")
            
            mock_brain_instance = MockBrain.return_value
            mock_brain_instance.think = AsyncMock(return_value={"status": "PASSED"})
            
            # Create a valid artifact
            valid_code = "print('safe')"
            valid_ir = "safe logic"
            sig = hashlib.sha256((valid_code + valid_ir).encode()).hexdigest()
            artifact = RosettaArtifact(valid_code, valid_ir, sig)
            
            # Run Venom
            result = await hydra.inject_venom(artifact, "Mission")
            
            self.assertEqual(result['status'], "PASSED")
            
            # Verify Brain model usage
            call_args = mock_brain_instance.think.call_args
            self.assertEqual(call_args.kwargs['model'], "hydra-model-v2")

    @patch("src.core.dragons.Brain")
    async def test_onyx_select_champion(self, MockBrain):
        """Onyx should select a champion from candidates."""
        with patch.dict(os.environ, {"ONYX_MODEL": "onyx-model-v2"}):
            onyx = Onyx()
            self.assertEqual(onyx.model, "onyx-model-v2")
            
            # Setup Candidates
            c1 = RosettaArtifact("c1", "ir1", "sig1")
            c2 = RosettaArtifact("c2", "ir2", "sig2")
            c3 = RosettaArtifact("c3", "ir3", "sig3")
            candidates = [c1, c2, c3]
            
            test_results = {"sig1": {"status": "PASSED"}, "sig2": {"status": "FAILED"}, "sig3": {"status": "PASSED"}}
            
            # Mock Brain to select 'sig3'
            mock_brain_instance = MockBrain.return_value
            mock_brain_instance.think = AsyncMock(return_value={"selected_signature": "sig3", "reason": "Best clarity"})
            
            champion = await onyx.select_champion(candidates, test_results)
            
            self.assertEqual(champion.signature, "sig3")
             # Verify Brain model usage
            call_args = mock_brain_instance.think.call_args
            self.assertEqual(call_args.kwargs['model'], "onyx-model-v2")

if __name__ == '__main__':
    unittest.main()
