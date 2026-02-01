from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
import dataclasses
import json
from contextlib import asynccontextmanager

# Import the Kernel
from src.core.elder import TheElder
from src.core.types import NullVerdictState
from src.memory.chronicle import TheChronicle

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TheNest.API")

# Singleton State
elder: Optional[TheElder] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    The Genesis Boot Sequence for the API.
    Ignites the Kernel when the server starts.
    """
    global elder
    logger.info("--- SYSTEM STARTUP ---")
    logger.info("Initializing The Nest Kernel...")
    
    # Initialize TheElder
    # TheElder initializes its own Chronicle connection synchronously in __init__
    elder = TheElder()
    
    logger.info("The Nest is ONLINE and listening.")
    yield
    
    # Shutdown
    logger.info("--- SYSTEM SHUTDOWN ---")

app = FastAPI(title="The Nest: Synthetic Civilization", version="5.2", lifespan=lifespan)

# --- REQUEST MODELS ---

class MissionRequest(BaseModel):
    mission: str
    context: Optional[Dict[str, Any]] = None

class MissionResponse(BaseModel):
    status: str
    mission: str
    artifact: Optional[Dict[str, Any]] = None
    verdict: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

# --- HELPER FUNCTIONS ---

def serialize_artifact(artifact: Any) -> Optional[Dict[str, Any]]:
    if not artifact:
        return None
    # Assuming artifact is a dataclass (RosettaArtifact)
    if hasattr(artifact, '__dataclass_fields__'):
        return dataclasses.asdict(artifact)
    return artifact

def serialize_verdict(verdict: Any) -> Any:
    if not verdict:
        return None
    if isinstance(verdict, NullVerdictState):
        return {
            "status": "REFUSED",
            "nulling_agents": [str(a) for a in verdict.nulling_agents],
            "reason_codes": verdict.reason_codes,
            "context_summary": verdict.context_summary
        }
    if isinstance(verdict, str):
        return {"status": verdict}
    return verdict

# --- ENDPOINTS ---

@app.get("/health")
async def health_check():
    """Verify system integrity."""
    if not elder:
        raise HTTPException(status_code=503, detail="Kernel Initializing")
    return {"status": "OPERATIONAL", "governance": "ACTIVE", "mode": "SOVEREIGN"}

@app.post("/missions", response_model=MissionResponse)
async def submit_mission(req: MissionRequest):
    """
    Submit a mission to The Elder.
    This triggers the Senate deliberation (Onyx -> Ignis -> Hydra).
    """
    if not elder:
        raise HTTPException(status_code=503, detail="Kernel Initializing")
    
    logger.info(f"API received mission request: {req.mission}")
    
    try:
        # Run the mission (Async call)
        state = await elder.run_mission(req.mission)
        
        # Determine status
        verdict = state.get('verdict')
        status = "PROCESSING"
        message = None
        
        if verdict == "APPROVED":
            status = "APPROVED"
            message = "Mission Authorized and Executed."
        elif isinstance(verdict, NullVerdictState):
            status = "STOP_WORK_ORDER"
            message = f"Mission Refused by Governance: {verdict.context_summary}"
        else:
            # Check for failed tests
            results = state.get('test_results')
            if results and results.get("status") == "FAILED":
                status = "FAILED_TESTS"
                message = f"Mission Failed Verification: {results.get('reason')}"
            else:
                 status = "UNKNOWN_VERDICT"
        
        return MissionResponse(
            status=status,
            mission=req.mission,
            artifact=serialize_artifact(state.get('artifact')),
            verdict=serialize_verdict(verdict),
            message=message
        )
        
    except Exception as e:
        logger.error(f"Critical API Error: {e}")
        # In a sovereign system, we don't expose stack traces to the user.
        # But for debugging now, print it
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Governance Error: {str(e)}")

@app.get("/chronicle/search")
async def search_chronicle(q: str):
    """
    Public access to Case Law (Stare Decisis).
    """
    if not elder:
        raise HTTPException(status_code=503, detail="Kernel Initializing")
    
    results = elder.chronicle.retrieve_precedent(q)
    return {"query": q, "count": len(results), "results": results}

@app.websocket("/ws/senate")
async def websocket_senate(websocket: WebSocket):
    await websocket.accept()
    if not elder:
        await websocket.close(code=1003, reason="Kernel Initializing")
        return

    try:
        while True:
            # Expecting a JSON message: {"mission": "..."}
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                mission = msg.get("mission")
            except:
                await websocket.send_json({"error": "Invalid JSON format"})
                continue
            
            if not mission:
                 await websocket.send_json({"error": "Mission field required"})
                 continue

            logger.info(f"WS received mission: {mission}")
            await websocket.send_json({"status": "RECEIVED", "message": "Mission accepted by Senate Floor."})

            async def notify_client(event_type: str, state: Dict[str, Any]):
                # Serialize state lightly to prevent overload
                serialized_votes = []
                for v in state.get('votes', []):
                    # Convert Enum to string if needed
                    vote_val = v.get('vote')
                    if hasattr(vote_val, 'value'):
                        vote_val = vote_val.value
                    serialized_votes.append(vote_val)

                payload = {
                    "event": event_type,
                    "votes": serialized_votes,
                    "verdict": serialize_verdict(state.get('verdict')),
                    "artifact_signature": state.get('artifact').signature if state.get('artifact') else None
                }
                
                # Enrich playload based on event
                if event_type == "IGNIS_FORGE_COMPLETE" and state.get('artifact'):
                     payload["intermediate_representation"] = state['artifact'].intermediate_representation
                
                if event_type == "PERMISSION_DENIED" or event_type == "MISSION_REFUSED":
                     if isinstance(state.get('verdict'), NullVerdictState):
                         payload["reason"] = state['verdict'].context_summary

                await websocket.send_json(payload)

            # Execution
            final_state = await elder.run_mission(mission, stream_callback=notify_client)
            
            # Final Result
            response = {
                "event": "FINAL_VERDICT",
                "final_state": {
                    "mission": final_state.get('mission'),
                    "status": "APPROVED" if final_state.get('verdict') == "APPROVED" else "REJECTED",
                    "artifact": serialize_artifact(final_state.get('artifact')),
                    "full_verdict": serialize_verdict(final_state.get('verdict'))
                }
            }
            await websocket.send_json(response)
            
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        try:
             await websocket.send_json({"error": "Internal Server Error", "details": str(e)})
        except:
            pass
