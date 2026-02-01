import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from src.core.elder import TheElder
from src.core.types import SenateState

class TestTheElder(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        self.chronicle = MagicMock()
        self.elder = TheElder(chronicle=self.chronicle)
        # Force manual simulation by ensuring workflow is None or we test the manual path
        self.elder.workflow = None 

    @patch("src.core.elder.node_onyx_intent")
    @patch("src.core.elder.node_ignis_crucible")
    @patch("src.core.elder.node_hydra_crucible_test")
    @patch("src.core.elder.node_onyx_selection")
    @patch("src.core.elder.node_onyx_code")
    async def test_run_mission_manual_flow(self, mock_code, mock_select, mock_test, mock_ignis, mock_intent):
        """Test the full manual execution loop."""
        
        # Setup Mocks to return state updates
        mock_intent.return_value = {"votes": ["ok"]}
        mock_ignis.return_value = {"candidates": ["c1"]}
        mock_test.return_value = {"test_results": {"c1": "pass"}}
        mock_select.return_value = {"artifact": "c1"}
        mock_code.return_value = {"verdict": "APPROVED"}

        # Run
        final_state = await self.elder.run_mission("Do good", shadow_mode=False)
        
        # Assertions
        mock_intent.assert_called_once()
        mock_ignis.assert_called_once()
        mock_test.assert_called_once()
        mock_select.assert_called_once()
        mock_code.assert_called_once()
        
        self.assertEqual(final_state['verdict'], "APPROVED")
        # Ensure log_case was called for APPROVED
        self.chronicle.log_precedent.assert_called_once()

    async def test_invoke_article_50(self):
        """Test Martial Governance Protocol."""
        with patch("src.core.elder.UngovernedSigner") as MockSigner:
            MockSigner.sign_ungoverned_artifact.return_value = "SIG_VOID"
            
            result = self.elder.invoke_article_50("Execute Order 66")
            
            self.assertEqual(result["status"], "UNGOVERNED")
            self.assertEqual(result["artifact"]["signature"], "SIG_VOID")
            
            # Should also log to chronicle
            self.chronicle.log_precedent.assert_called_once()
            call_arg = self.chronicle.log_precedent.call_args[0][0]
            self.assertEqual(call_arg.verdict['ruling'], "UNGOVERNED")

if __name__ == '__main__':
    unittest.main()
