import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi.testclient import TestClient
import os
import json

# Ensure we set envs before import if logic depends on them
os.environ["REDIS_URL"] = "redis://mock:6379"

from src.api import app

class TestAPI(unittest.TestCase):

    def setUp(self):
        self.mock_elder_cls = patch("src.api.TheElder").start()
        self.mock_redis_cls = patch("src.api.redis.from_url").start()
        
        # Setup Elder Mock Instance
        self.mock_elder_instance = self.mock_elder_cls.return_value
        self.mock_elder_instance.run_mission = AsyncMock()
        self.mock_elder_instance.chronicle.retrieve_precedent.return_value = []
        
        # Setup Redis Mock
        self.mock_redis_instance = AsyncMock()
        self.mock_redis_cls.return_value = self.mock_redis_instance
        self.mock_redis_instance.ping = AsyncMock(return_value=True)
        self.mock_redis_instance.get = AsyncMock(return_value=None)
        self.mock_redis_instance.rpush = AsyncMock()
        self.mock_redis_instance.close = AsyncMock()

        # Manually inject mock kernel to bypass lifespan issues in unit tests
        import src.api
        src.api.elder = self.mock_elder_instance

        self.client = TestClient(app)

    def tearDown(self):
        # Clean up global state
        import src.api
        src.api.elder = None
        patch.stopall()

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "OPERATIONAL")

    def test_submit_mission_approved(self):
        # Setup Elder to return APPROVED state
        self.mock_elder_instance.run_mission.return_value = {
            "verdict": "APPROVED",
            "artifact": {"code": "print('ok')", "signature": "sig123"},
            "test_results": {"status": "PASSED"}
        }
        
        payload = {"mission": "Write Hello World"}
        response = self.client.post("/missions", json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "APPROVED")
        self.assertEqual(data["artifact"]["code"], "print('ok')")

    def test_submit_mission_refused(self):
        # Setup Elder to return NULL verdict (using dict form for simplicity as API serializes it)
        # However, the code checks isinstance(verdict, NullVerdictState).
        # We need to import NullVerdictState to make the mock return a real object
        from src.core.types import NullVerdictState
        
        null_state = NullVerdictState(
            nulling_agents=[], 
            reason_codes=["UNSAFE"], 
            context_summary="Bad Mission"
        )
        
        self.mock_elder_instance.run_mission.return_value = {
            "verdict": null_state,
            "artifact": None
        }
        
        payload = {"mission": "Destroy World"}
        response = self.client.post("/missions", json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "STOP_WORK_ORDER")
        self.assertIn("Bad Mission", data["message"])

if __name__ == '__main__':
    unittest.main()
