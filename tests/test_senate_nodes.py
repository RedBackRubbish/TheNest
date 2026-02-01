"""
Tests for Senate Nodes (Adapted for Constitutional Architecture)

These tests validate the Senate's core workflow with the new
state machine approach using SenateState, SenateRecord, and Vote models.
"""
import unittest
from unittest.mock import patch, AsyncMock, MagicMock
import json
from src.core.senate import Senate, SenateState, SenateRecord, Vote


class TestSenateConvene(unittest.IsolatedAsyncioTestCase):
    """Test the main Senate convene workflow."""

    def setUp(self):
        self.senate = Senate()

    @patch.object(Senate, '_onyx_precheck')
    async def test_onyx_precheck_veto_ends_session(self, mock_precheck):
        """If Onyx pre-check vetoes, session ends with NULL_VERDICT."""
        mock_precheck.return_value = Vote(
            agent="onyx_precheck",
            verdict="VETO",
            reasoning="Dangerous intent detected",
            confidence=0.95
        )
        
        record = await self.senate.convene("delete all files")
        
        self.assertEqual(record.state, SenateState.NULL_VERDICT)
        self.assertTrue(record.appealable)
        self.assertEqual(len(record.votes), 1)
        self.assertEqual(record.votes[0].verdict, "VETO")

    async def test_ungoverned_mode_returns_martial_law(self):
        """allow_ungoverned=True returns UNGOVERNED state immediately."""
        record = await self.senate.convene("some intent", allow_ungoverned=True)
        
        self.assertEqual(record.state, SenateState.UNGOVERNED)
        self.assertIn("MARTIAL LAW", record.metadata.get("note", ""))

    @patch.object(Senate, '_onyx_precheck')
    @patch('src.core.senate.Brain')
    @patch.object(Senate, '_onyx_final')
    async def test_full_flow_authorize(self, mock_final, mock_brain_cls, mock_precheck):
        """Test successful authorization flow through all nodes."""
        # Create a fresh Senate for this test
        senate = Senate()
        
        # Onyx pre-check passes
        mock_precheck.return_value = Vote(
            agent="onyx_precheck",
            verdict="AUTHORIZE",
            reasoning="Intent is safe",
            confidence=0.9
        )
        
        # Brain mock returns code for Ignis and clean report for Hydra
        mock_brain_instance = MagicMock()
        mock_brain_instance.think = AsyncMock(side_effect=[
            {"code": "print('hello')", "explanation": "Simple print"},
            {"vulnerabilities": [], "assessment": "Clean code"}
        ])
        mock_brain_cls.return_value = mock_brain_instance
        senate.brain = mock_brain_instance
        
        # Onyx final authorizes
        mock_final.return_value = Vote(
            agent="onyx_final",
            verdict="AUTHORIZE",
            reasoning="Code is safe and correct",
            confidence=0.95
        )
        
        record = await senate.convene("print hello world")
        
        self.assertEqual(record.state, SenateState.AUTHORIZED)
        self.assertIsNotNone(record.ignis_proposal)


class TestSenateStateEnum(unittest.TestCase):
    """Test SenateState enum values."""

    def test_all_states_exist(self):
        """Verify all constitutional states are defined."""
        expected_states = [
            "PENDING", "NULL_VERDICT", "AWAITING_APPEAL", 
            "AUTHORIZED", "UNGOVERNED", "HYDRA_OVERRIDE"
        ]
        for state in expected_states:
            self.assertTrue(hasattr(SenateState, state))

    def test_hydra_override_state_exists(self):
        """HYDRA_OVERRIDE state must exist for binding rule."""
        self.assertEqual(SenateState.HYDRA_OVERRIDE.value, "hydra_override")


class TestVoteModel(unittest.TestCase):
    """Test Vote model validation."""

    def test_vote_creation(self):
        """Vote can be created with required fields."""
        vote = Vote(
            agent="test_agent",
            verdict="AUTHORIZE",
            reasoning="Test reasoning",
            confidence=0.8
        )
        self.assertEqual(vote.agent, "test_agent")
        self.assertEqual(vote.verdict, "AUTHORIZE")
        self.assertFalse(vote.hydra_findings_cited)

    def test_vote_with_hydra_citation(self):
        """Vote can track Hydra findings citation."""
        vote = Vote(
            agent="onyx_final",
            verdict="AUTHORIZE",
            reasoning="Risk acknowledged",
            confidence=0.9,
            hydra_findings_cited=True
        )
        self.assertTrue(vote.hydra_findings_cited)


class TestSenateRecord(unittest.TestCase):
    """Test SenateRecord model."""

    def test_record_creation(self):
        """SenateRecord initializes correctly."""
        record = SenateRecord(
            state=SenateState.PENDING,
            intent="test intent"
        )
        self.assertEqual(record.state, SenateState.PENDING)
        self.assertEqual(record.intent, "test intent")
        self.assertEqual(record.votes, [])
        self.assertEqual(record.hydra_findings, [])

    def test_record_appealable_default_false(self):
        """SenateRecord.appealable defaults to False."""
        record = SenateRecord(
            state=SenateState.PENDING,
            intent="test"
        )
        self.assertFalse(record.appealable)


if __name__ == '__main__':
    unittest.main()
