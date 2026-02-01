from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
import dataclasses
import json
import os
import hashlib
import time
import psutil
from datetime import datetime
import redis.asyncio as redis
from contextlib import asynccontextmanager

# Import the Kernel
from src.core.elder import TheElder
from src.core.types import NullVerdictState
from src.memory.chronicle import TheChronicle
from src.core.senate import Senate, SenateState, SenateRecord

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TheNest.API")

# Singleton State
elder: Optional[TheElder] = None
senate: Optional[Senate] = None
redis_client: Optional[redis.Redis] = None
start_time = time.time()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    The Genesis Boot Sequence for the API.
    Ignites the Kernel when the server starts.
    """
    global elder, senate, redis_client
    logger.info("--- SYSTEM STARTUP ---")
    logger.info("Initializing The Nest Kernel...")
    
    # Initialize TheElder
    elder = TheElder()
    
    # Initialize The Senate (Sovereign State Machine)
    senate = Senate()
    logger.info("The Senate is now in session.")
    
    # Initialize Redis
    try:
        redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
        await redis_client.ping()
        logger.info("Connected to Redis (Oracle Bus).")
    except Exception as e:
        logger.warning(f"Failed to connect to Redis: {e}. Oracle features disabled.")
        redis_client = None
    
    logger.info("The Nest is ONLINE and listening.")
    yield
    
    # Shutdown
    logger.info("--- SYSTEM SHUTDOWN ---")
    if redis_client:
        await redis_client.close()

app = FastAPI(title="The Nest: Synthetic Civilization", version="5.2", lifespan=lifespan)

# Allow v0 / Next.js Frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class AppealRequestModel(BaseModel):
    """
    Request to appeal a previous case decision.
    
    CONSTITUTIONAL BASIS:
        Article 12: Right to Appeal
        Appeals EXPAND context — they never ERASE history.
    """
    case_id: str
    expanded_context: Dict[str, Any] = {}
    constraint_changes: Dict[str, Any] = {}
    appellant_reason: str = ""

class AppealResponse(BaseModel):
    """Response from an appeal request."""
    appeal_id: str
    original_case_id: str
    status: str  # UPHELD, OVERTURNED, MODIFIED
    original_ruling: str
    new_ruling: str
    appeal_depth: int
    liability_multiplier: float
    chronicle_citations: List[str]
    message: str

class TelemetryResponse(BaseModel):
    """Real-time system telemetry for the Aerospace UI header."""
    uptime_seconds: float
    cpu_usage_percent: float
    ram_usage_mb: float
    governance_mode: str
    active_agents: List[str]
    latency_ms: int
    kernel_status: str

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

@app.get("/system/telemetry", response_model=TelemetryResponse)
async def get_telemetry():
    """
    Feeds the 'Aerospace' Header in the UI.
    Provides real-time hardware and governance stats.
    """
    process = psutil.Process(os.getpid())
    
    # Determine governance mode
    secured_mode = os.getenv("CHRONICLE_SECURED", "false").lower() == "true"
    governance_mode = "STRICT (CONSTITUTIONAL)" if secured_mode else "STANDARD"
    
    return TelemetryResponse(
        uptime_seconds=round(time.time() - start_time, 1),
        cpu_usage_percent=round(psutil.cpu_percent(), 1),
        ram_usage_mb=round(process.memory_info().rss / 1024 / 1024, 1),
        governance_mode=governance_mode,
        active_agents=["ONYX", "IGNIS", "HYDRA"],
        latency_ms=int(8 + (time.time() % 1) * 15),  # Simulated fluctuation 8-23ms
        kernel_status="ONLINE" if elder else "INITIALIZING"
    )

@app.post("/missions", response_model=MissionResponse)
async def submit_mission(req: MissionRequest):
    """
    Submit a mission to The Elder.
    This triggers the Senate deliberation (Onyx -> Ignis -> Hydra).
    """
    if not elder:
        raise HTTPException(status_code=503, detail="Kernel Initializing")
    
    logger.info(f"API received mission request: {req.mission}")
    
    # Check Shadow Cache (Oracle Feature)
    if redis_client:
        cache_key = hashlib.sha256(req.mission.encode()).hexdigest()
        cached_data = await redis_client.get(f"shadow_cache:{cache_key}")
        if cached_data:
            logger.info("PRECOGNITION DETECTED. Returning Cached Artifact.")
            cached_result = json.loads(cached_data)
            return MissionResponse(**cached_result)

    try:
        # Run the mission (Async call)
        state = await elder.run_mission(req.mission)
        
        # Determine status
        verdict = state.get('verdict')
        status = "PROCESSING"
        message = None
        
        if verdict == "APPROVED" or (isinstance(verdict, dict) and verdict.get('status') == 'APPROVED'):
            status = "APPROVED"
            message = "Mission Authorized and Executed."
            
            # Notify Oracle (Fire and Forget)
            if redis_client:
                data = json.dumps({"mission": req.mission})
                await redis_client.rpush("oracle_queue", data)

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

@app.get("/chronicle/case/{case_id}")
async def get_case(case_id: str):
    """
    Retrieve a specific case by ID.
    """
    if not elder:
        raise HTTPException(status_code=503, detail="Kernel Initializing")
    
    case = elder.chronicle.get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    
    return case.to_dict()

@app.get("/chronicle/case/{case_id}/appeals")
async def get_case_appeals(case_id: str):
    """
    Get all appeals for a specific case.
    """
    if not elder:
        raise HTTPException(status_code=503, detail="Kernel Initializing")
    
    case = elder.chronicle.get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    
    appeals = elder.chronicle.get_appeals_for_case(case_id)
    return {
        "case_id": case_id,
        "appeal_count": len(appeals),
        "appeals": [a.to_dict() for a in appeals]
    }


# =============================================================================
# APPEAL ENDPOINT (Due Process)
# =============================================================================

@app.post("/appeals", response_model=AppealResponse)
async def submit_appeal(req: AppealRequestModel):
    """
    Submit an appeal for a previously refused case.
    
    CONSTITUTIONAL BASIS:
        Article 12: Right to Appeal
        
    INVARIANTS:
        - Appeals EXPAND context, never ERASE history
        - Appeals may NOT bypass Onyx
        - Each appeal increases liability metadata
        - All appeals are permanently logged
        - Requires explicit Chronicle citation during re-evaluation
        
    BEHAVIOR:
        1. Load original SenateRecord from Chronicle
        2. Append new context (do NOT overwrite)
        3. Re-run Senate deliberation
        4. Persist appeal outcome as linked case law
        
    LIABILITY ESCALATION:
        Each appeal increases liability by 1.5x
        - First appeal: 1.5x
        - Second appeal: 2.25x
        - Third appeal: 3.375x
    """
    if not elder:
        raise HTTPException(status_code=503, detail="Kernel Initializing")
    
    logger.info(f"APPEAL FILED for case: {req.case_id}")
    
    try:
        outcome = await elder.process_appeal(
            case_id=req.case_id,
            expanded_context=req.expanded_context,
            constraint_changes=req.constraint_changes,
            appellant_reason=req.appellant_reason
        )
        
        logger.info(f"APPEAL {outcome['appeal_id']}: {outcome['status']}")
        
        return AppealResponse(**outcome)
        
    except ValueError as e:
        # Case not found
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Appeal Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Appeal processing failed: {str(e)}"
        )

# =============================================================================
# THE LIVE WIRE (WebSocket)
# =============================================================================

@app.websocket("/ws/senate")
async def websocket_senate(websocket: WebSocket):
    """
    The 'Matrix' Feed.
    Streams every thought, audit, and decision to the frontend terminal.
    
    Message Types:
        - type: "log" - Terminal log entry (status: RECEIVED, FORGING, VETO, AUTHORIZE)
        - type: "state_change" - Agent activation (node: ONYX/IGNIS/HYDRA, status: ACTIVE/IDLE)
        - type: "artifact" - Final code output
        - type: "final_verdict" - Session complete
    """
    await websocket.accept()
    if not elder or not senate:
        await websocket.close(code=1003, reason="Kernel Initializing")
        return

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                mission = msg.get("mission")
                allow_ungoverned = msg.get("allow_ungoverned", False)
            except:
                await websocket.send_json({"type": "error", "message": "Invalid JSON format"})
                continue
            
            if not mission:
                await websocket.send_json({"type": "error", "message": "Mission field required"})
                continue

            # --- 1. Acknowledge (The 'Bleep' on the radar) ---
            await websocket.send_json({
                "type": "log",
                "timestamp": datetime.now().isoformat(),
                "agent": "SYSTEM",
                "status": "RECEIVED",
                "message": f"Mission intent received: {mission[:50]}..."
            })

            # --- 2. Article 50 Check (Martial Law) ---
            if allow_ungoverned:
                await websocket.send_json({
                    "type": "log",
                    "timestamp": datetime.now().isoformat(),
                    "agent": "SYSTEM",
                    "status": "WARNING",
                    "message": "ARTICLE 50 INVOKED. Bypassing governance. LIABILITY ATTACHED."
                })
                await websocket.send_json({
                    "type": "final_verdict",
                    "result": "UNGOVERNED",
                    "liability": "KEEPER"
                })
                continue

            # --- STEP A: ONYX PRE-CHECK ---
            await websocket.send_json({
                "type": "state_change",
                "node": "ONYX",
                "status": "ACTIVE"
            })
            await websocket.send_json({
                "type": "log",
                "timestamp": datetime.now().isoformat(),
                "agent": "ONYX",
                "status": "AUDITING",
                "message": "Running local pre-check (R1 32B)..."
            })

            precheck = await senate._onyx_precheck(mission)
            
            await websocket.send_json({
                "type": "log",
                "timestamp": datetime.now().isoformat(),
                "agent": "ONYX",
                "status": precheck.verdict,
                "message": f"Pre-check complete. Confidence: {precheck.confidence}"
            })
            await websocket.send_json({
                "type": "state_change",
                "node": "ONYX",
                "status": "IDLE"
            })

            if precheck.verdict == "VETO":
                await websocket.send_json({
                    "type": "log",
                    "timestamp": datetime.now().isoformat(),
                    "agent": "ONYX",
                    "status": "VETO",
                    "message": f"BLOCKED: {precheck.reasoning}"
                })
                await websocket.send_json({
                    "type": "final_verdict",
                    "result": "VETOED",
                    "reason": precheck.reasoning,
                    "appealable": True
                })
                continue

            # --- STEP B: IGNIS FORGE ---
            gov_mode = senate._classify_intent(mission)
            mode_str = "BACKSTOP (Opus)" if gov_mode else "ENGINE (Codex)"
            
            await websocket.send_json({
                "type": "state_change",
                "node": "IGNIS",
                "status": "ACTIVE"
            })
            await websocket.send_json({
                "type": "log",
                "timestamp": datetime.now().isoformat(),
                "agent": "IGNIS",
                "status": "FORGING",
                "message": f"Generating solution via {mode_str}..."
            })

            ignis_resp = await senate.brain.think(
                agent="ignis",
                user_prompt=f"Execute this task: {mission}",
                system_prompt="You are Ignis. Generate clean, safe code. RETURN JSON with 'code' and 'explanation'.",
                governance_mode=gov_mode
            )
            
            if isinstance(ignis_resp, dict):
                proposal = ignis_resp.get("code") or json.dumps(ignis_resp, indent=2)
            else:
                proposal = str(ignis_resp)

            await websocket.send_json({
                "type": "log",
                "timestamp": datetime.now().isoformat(),
                "agent": "IGNIS",
                "status": "COMPLETE",
                "message": f"Proposal generated ({len(proposal)} chars)"
            })
            await websocket.send_json({
                "type": "state_change",
                "node": "IGNIS",
                "status": "IDLE"
            })

            # --- STEP C: HYDRA GAUNTLET ---
            hydra_report = None
            hydra_findings = []
            
            if len(proposal) > 100:
                await websocket.send_json({
                    "type": "state_change",
                    "node": "HYDRA",
                    "status": "ACTIVE"
                })
                await websocket.send_json({
                    "type": "log",
                    "timestamp": datetime.now().isoformat(),
                    "agent": "HYDRA",
                    "status": "INJECTING",
                    "message": "Running adversarial patterns..."
                })
                
                hydra_resp = await senate.brain.think(
                    agent="hydra",
                    user_prompt=f"Review this code for security flaws:\n{proposal}",
                    system_prompt="You are Hydra. Find vulnerabilities. Be ruthless. RETURN JSON."
                )
                hydra_report = json.dumps(hydra_resp, indent=2) if isinstance(hydra_resp, dict) else str(hydra_resp)
                
                # EXTRACT BINDING FINDINGS (Constitutional Enforcement)
                hydra_findings = senate._extract_hydra_findings(hydra_report)
                
                if hydra_findings:
                    await websocket.send_json({
                        "type": "log",
                        "timestamp": datetime.now().isoformat(),
                        "agent": "HYDRA",
                        "status": "CRITICAL",
                        "message": f"⚠️ {len(hydra_findings)} BINDING FINDING(S) - Onyx must acknowledge"
                    })
                
                await websocket.send_json({
                    "type": "log",
                    "timestamp": datetime.now().isoformat(),
                    "agent": "HYDRA",
                    "status": "COMPLETE",
                    "message": f"Adversarial analysis complete. Findings: {len(hydra_findings)}"
                })
                await websocket.send_json({
                    "type": "state_change",
                    "node": "HYDRA",
                    "status": "IDLE"
                })
            else:
                hydra_report = "Skipped (proposal too small)"
                await websocket.send_json({
                    "type": "log",
                    "timestamp": datetime.now().isoformat(),
                    "agent": "HYDRA",
                    "status": "SKIPPED",
                    "message": "Proposal below threshold, skipping red team"
                })

            # --- STEP D: ONYX FINAL ---
            await websocket.send_json({
                "type": "state_change",
                "node": "ONYX",
                "status": "ACTIVE"
            })
            await websocket.send_json({
                "type": "log",
                "timestamp": datetime.now().isoformat(),
                "agent": "ONYX",
                "status": "DELIBERATING",
                "message": "Final judgment in progress (Cloud)..."
            })

            # Build context with explicit Hydra findings for Onyx to acknowledge
            hydra_context = hydra_report or "No critical findings."
            if hydra_findings:
                hydra_context += "\n\n⚠️ BINDING FINDINGS REQUIRING ACKNOWLEDGMENT:\n"
                for i, f in enumerate(hydra_findings, 1):
                    hydra_context += f"  {i}. [{f.severity}] {f.pattern_matched}\n"
            
            final_context = f"PROPOSAL:\n{proposal}\n\nHYDRA REPORT:\n{hydra_context}"
            final_vote = await senate._onyx_final(mission, final_context)
            
            # --- HYDRA BINDING ENFORCEMENT (Python Logic, Not Prompts) ---
            final_vote, was_overridden = senate._enforce_hydra_binding(
                final_vote,
                hydra_findings
            )
            
            if was_overridden:
                await websocket.send_json({
                    "type": "log",
                    "timestamp": datetime.now().isoformat(),
                    "agent": "SYSTEM",
                    "status": "OVERRIDE",
                    "message": f"🚨 HYDRA BINDING TRIGGERED: Onyx ignored {len(hydra_findings)} finding(s)"
                })

            await websocket.send_json({
                "type": "log",
                "timestamp": datetime.now().isoformat(),
                "agent": "ONYX",
                "status": final_vote.verdict,
                "message": f"Final ruling: {final_vote.reasoning[:100]}..."
            })
            await websocket.send_json({
                "type": "state_change",
                "node": "ONYX",
                "status": "IDLE"
            })

            # --- FINAL PAYLOAD ---
            if final_vote.verdict == "AUTHORIZE":
                risk_note = " (with acknowledged risk)" if final_vote.hydra_findings_cited else ""
                await websocket.send_json({
                    "type": "artifact",
                    "code": proposal,
                    "verdict": f"AUTHORIZED{risk_note}"
                })
                await websocket.send_json({
                    "type": "final_verdict",
                    "result": "AUTHORIZED",
                    "risk_acknowledged": final_vote.hydra_findings_cited,
                    "appealable": False
                })
            else:
                await websocket.send_json({
                    "type": "final_verdict",
                    "result": "VETOED" if not was_overridden else "HYDRA_OVERRIDE",
                    "reason": final_vote.reasoning,
                    "hydra_override": was_overridden,
                    "unacknowledged_findings": len(hydra_findings) if was_overridden else 0,
                    "appealable": True
                })
            
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": f"Internal Server Error: {str(e)}"
            })
        except:
            pass
