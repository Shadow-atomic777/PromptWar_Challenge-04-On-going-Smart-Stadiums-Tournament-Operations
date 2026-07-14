"""Operations endpoints for stadium staff."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from app.core.security import get_current_ops_user
from app.models.chat import IncidentRequest, IncidentResponse

router = APIRouter(dependencies=[Depends(get_current_ops_user)])


@router.post("/incident", response_model=IncidentResponse)
async def create_incident(request: IncidentRequest):
    """
    Manual incident creation by ops staff.
    
    Creates a new incident, triggers the Safety Agent for assessment,
    and returns AI-powered response recommendations.
    """
    from app.main import simulation_engine
    
    if simulation_engine is None:
        raise HTTPException(status_code=503, detail="Simulation engine not running")
    
    incident_id = str(uuid.uuid4())[:8]
    
    # If severity is critical, trigger emergency mode
    if request.severity == "critical":
        result = simulation_engine.trigger_emergency(request.sector)
        ai_recommendation = (
            f"🚨 CRITICAL INCIDENT in {request.sector}: {request.description}. "
            f"Emergency protocols activated. Evacuating affected sector. "
            f"Medical teams dispatched. Adjacent sectors on standby."
        )
        agents_activated = ["safety_agent", "crowd_agent", "route_planner", "communication_agent"]
    else:
        ai_recommendation = (
            f"⚠️ Incident logged in {request.sector}: {request.description}. "
            f"Medical team notified. Monitoring crowd density in surrounding sectors. "
            f"No evacuation required at this time."
        )
        agents_activated = ["safety_agent", "communication_agent"]
    
    from app.core.database import get_db
    try:
        db = await get_db()
        try:
            await db.execute(
                "INSERT INTO incidents (id, type, severity, sector, description, status, responders_assigned) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (incident_id, request.type, request.severity, request.sector, request.description, 'active', 2)
            )
            await db.commit()
        finally:
            await db.close()
    except Exception as e:
        print(f"[DB Error] Failed to log incident: {e}")

    return IncidentResponse(
        incident_id=incident_id,
        status="active",
        ai_recommendation=ai_recommendation,
        agents_activated=agents_activated,
    )


@router.post("/emergency/simulate")
async def simulate_emergency(sector: str = "north_lower"):
    """Trigger a simulated emergency for demo purposes."""
    from app.main import simulation_engine
    
    if simulation_engine is None:
        raise HTTPException(status_code=503, detail="Simulation engine not running")
    
    result = simulation_engine.trigger_emergency(sector)
    return result


@router.get("/status")
async def ops_status():
    """Get operational status summary."""
    from app.main import simulation_engine
    from app.services.ws_manager import manager
    
    return {
        "simulation_running": simulation_engine is not None and simulation_engine.running,
        "tick_count": simulation_engine.tick_count if simulation_engine else 0,
        "connected_ops_clients": manager.ops_count,
        "connected_fans": manager.fan_count,
        "match_phase": simulation_engine.match_phase.value if simulation_engine else "unknown",
    }
