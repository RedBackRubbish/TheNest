import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from src.core.types import SenateState
from src.core.senate import node_ignis_crucible, node_hydra_crucible_test, node_onyx_selection, node_onyx_code
from src.core.dragons import RosettaArtifact

class TestSenateNodes(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        self.mock_mission = "Test Mission"
        self.mock_state: SenateState = {
            "mission": self.mock_mission,
            "votes": [],
            "precedents": [],
            "candidates": [],
            "test_results": {},
            "artifact": None,
            "verdict": None
        }

    @patch("src.core.senate.Ignis")
    async def test_node_ignis_crucible(self, MockIgnis):
        """Test that Ignis Crucible node updates state with candidates."""
        # Setup Mock
        mock_ignis = MockIgnis.return_value
        expected_candidates = ["c1", "c2", "c3"]
        mock_ignis.forge_variants = AsyncMock(return_value=expected_candidates)
        
        # Execute Node
        update = await node_ignis_crucible(self.mock_state)
        
        # Assertions
        self.assertIn("candidates", update)
        self.assertEqual(update["candidates"], expected_candidates)
        mock_ignis.forge_variants.assert_called_once()

    @patch("src.core.senate.Hydra")
    async def test_node_hydra_crucible_test(self, MockHydra):
        """Test that Hydra tests all candidates."""
        # Setup State with candidates
        c1 = RosettaArtifact("c1", "ir1", "sig1")
        c2 = RosettaArtifact("c2", "ir2", "sig2")
        self.mock_state["candidates"] = [c1, c2]
        
        # Setup Mock
        mock_hydra = MockHydra.return_value
        # inject_venom returns a dict. We want it to be called twice.
        mock_hydra.inject_venom = AsyncMock(side_effect=[{"status": "PASSED"}, {"status": "FAILED"}])
        
        # Execute Node
        update = await node_hydra_crucible_test(self.mock_state)
        
        # Assertions
        self.assertIn("test_results", update)
        results = update["test_results"]
        self.assertEqual(len(results), 2)
        self.assertEqual(results["sig1"]["status"], "PASSED")
        self.assertEqual(results["sig2"]["status"], "FAILED")

    @patch("src.core.senate.Onyx")
    async def test_node_onyx_selection(self, MockOnyx):
        """Test that Onyx selects a champion."""
        mock_onyx = MockOnyx.return_value
        expected_chk = "champion_artifact"
        mock_onyx.select_champion = AsyncMock(return_value=expected_chk)
        
        update = await node_onyx_selection(self.mock_state)
        
        self.assertEqual(update["artifact"], expected_chk)
        mock_onyx.select_champion.assert_called_once()

if __name__ == '__main__':
    unittest.main()
