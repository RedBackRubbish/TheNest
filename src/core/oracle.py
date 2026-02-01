import asyncio
import json
import logging
import os
import redis.asyncio as redis
import hashlib
from typing import List

from src.core.elder import TheElder
from src.memory.chronicle import TheChronicle
from src.core.brain import Brain

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TheNest.Oracle")

class TheOracle:
    """
    The Predictive Engine.
    Watches the 'Roar' bus for successful missions.
    Predicts the next user intent.
    Pre-computes the solution in the Shadow Realm.
    """
    def __init__(self):
        self.redis = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
        self.brain = Brain()
        self.chronicle = TheChronicle()
        # We need an Elder instance to run shadow-builds
        self.elder = TheElder(self.chronicle) 

    async def start(self):
        """Main Loop: Listen to the Roar."""
        logger.info("THE ORACLE IS WATCHING...")
        
        # In a real impl, we'd use Redis Streams groups. 
        # For this sprint, we'll use a simplified loop checking a 'oracle_queue'.
        # Assuming API pushes successful missions to a list for The Oracle.
        
        while True:
            try:
                # 1. Dequeue latest success
                # BLPOP blocks until an item is available
                data = await self.redis.blpop("oracle_queue", timeout=1)
                if not data:
                    continue
                
                # BLPOP returns tuple (key, value)
                mission_data = json.loads(data[1])
                await self.prophesy(mission_data['mission'])
                
            except Exception as e:
                # logger.error(f"Vision Clouded: {e}")
                await asyncio.sleep(5)

    async def prophesy(self, previous_mission: str):
        """
        Predicts what comes next and builds it.
        """
        logger.info(f"Analyzing trajectory from: '{previous_mission}'")
        
        # 1. Ask the Brain for predictions
        system_prompt = """
        IDENTITY: You are The Oracle.
        TASK: Predict the single most likely next engineering task based on the previous one.
        OUTPUT: JSON { "prediction": "..." }
        EXAMPLE: If prev="Build Login", prediction="Build Password Reset"
        """
        
        response = await self.brain.think(
            system_prompt, 
            f"PREVIOUS_MISSION: {previous_mission}", 
            mode="fast"
        )
        
        next_mission = response.get("prediction")
        if not next_mission:
            return

        logger.info(f"PREDICTION: User will ask for '{next_mission}'")
        
        # 2. Check if already cached
        cache_key = hashlib.sha256(next_mission.encode()).hexdigest()
        exists = await self.redis.get(f"shadow_cache:{cache_key}")
        if exists:
            logger.info("Prediction already cached. Skipping.")
            return

        # 3. Execute Shadow Build (Silent Mode)
        logger.info(f"INITIATING SHADOW BUILD: {next_mission}")
        
        # Run The Elder in Shadow Mode (No WebSocket emission, No Main Chronicle pollution)
        result = await self.elder.run_mission(next_mission, shadow_mode=True)
        
        # Normalize status check
        verdict = result.get('verdict')
        is_approved = verdict == 'APPROVED' or (isinstance(verdict, dict) and verdict.get('status') == 'APPROVED')

        if is_approved:
            # 4. Cache the Artifact
            logger.info(f"SHADOW ARTIFACT FORGED. Caching under {cache_key[:8]}")
            
            # Helper serialization (duplicated from API but that's ok for now)
            import dataclasses
            from src.core.dragons import RosettaArtifact
            
            def serialize(obj):
                if isinstance(obj, RosettaArtifact):
                    return dataclasses.asdict(obj)
                return obj
            
            # Simple structure
            cache_obj = {
                "mission": next_mission,
                "status": "APPROVED",
                "artifact": serialize(result.get("artifact")),
                "verdict": "APPROVED",
                "message": "PRECOGNITION DETECTED"
            }
            
            await self.redis.set(
                f"shadow_cache:{cache_key}", 
                json.dumps(cache_obj), 
                ex=3600 # Expire in 1 hour
            )
        else:
            logger.info(f"Shadow Build Failed/Refused: {verdict}")

if __name__ == "__main__":
    # Boot the Oracle
    oracle = TheOracle()
    # We need to await the connection in async context
    loop = asyncio.get_event_loop()
    loop.run_until_complete(oracle.chronicle.connect())
    loop.run_until_complete(oracle.start())
