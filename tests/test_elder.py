"""
Tests for TheElder (The Human-in-the-Loop Orchestrator)

Updated to work with the new constitutional Senate architecture.
"""
import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from src.core.elder import TheElder
from src.core.senate import Senate, SenateState, SenateRecord, Vote


class TestTheElder(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        self.chronicle = MagicMock()
        self.elder = TheElder(chronicle=self.chronicle)

    @patch.object(Senate, 'convene')
    async def test_run_mission_with_senate(self, mock_convene):
        """Test that Elder uses Senate for missions."""
        # Mock Senate to return AUTHORIZED record
        mock_convene.return_value = SenateRecord(
            state=SenateState.AUTHORIZED,
            intent="Do good",
            ignis_proposal="print('hello')",
            votes=[
                Vote(agent="onyx_precheck", verdict="AUTHORIZE", reasoning="Safe", confidence=0.9),
                Vote(agent="onyx_final", verdict="AUTHORIZE", reasoning="Approved", confidence=0.95)
            ]
        )
        
        # Run mission through Elder
        result = await self.elder.run_mission("Do good")
        
        # Senate should have been called
        mock_convene.assert_called_once()
        
        # Result is a dict for API compatibility, check the verdict
        self.assertEqual(result["verdict"], "APPROVED")
        self.assertEqual(result["mission"], "Do good")

    @patch.object(Senate, 'convene')
    async def test_run_mission_vetoed(self, mock_convene):
        """Test that Elder handles NULL_VERDICT properly."""
        mock_convene.return_value = SenateRecord(
            state=SenateState.NULL_VERDICT,
            intent="Delete all files",
            appealable=True,
            votes=[
                Vote(agent="onyx_precheck", verdict="VETO", reasoning="Dangerous", confidence=1.0)
            ]
        )
        
        result = await self.elder.run_mission("Delete all files")
        
        # Result should contain NullVerdictState
        self.assertNotEqual(result["verdict"], "APPROVED")
        # Verdict should be a NullVerdictState object or dict
        self.assertIn("mission", result)

    async def test_invoke_article_50(self):
        """Test Martial Governance Protocol (UNGOVERNED mode)."""
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
