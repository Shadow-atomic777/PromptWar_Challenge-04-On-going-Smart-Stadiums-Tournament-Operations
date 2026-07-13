"""REST API endpoints for simulation data."""
from fastapi import APIRouter, HTTPException

router = APIRouter()


def _get_sim_engine():
    """Get the running simulation engine instance."""
    from app.main import simulation_engine
    if simulation_engine is None:
        raise HTTPException(status_code=503, detail="Simulation engine not running")
    return simulation_engine


@router.get("/crowd")
async def get_crowd_data():
    """Get live crowd density per sector."""
    engine = _get_sim_engine()
    return engine.get_crowd_snapshot().model_dump()


@router.get("/queues")
async def get_queue_data():
    """Get wait times at food/restroom/gates."""
    engine = _get_sim_engine()
    return engine.get_queue_snapshot().model_dump()


@router.get("/parking")
async def get_parking_data():
    """Get parking lot occupancy."""
    engine = _get_sim_engine()
    return engine.get_parking_snapshot().model_dump()


@router.get("/medical")
async def get_medical_data():
    """Get active medical incidents."""
    engine = _get_sim_engine()
    return engine.get_medical_snapshot().model_dump()


@router.get("/weather")
async def get_weather_data():
    """Get temperature, humidity, alerts."""
    engine = _get_sim_engine()
    return engine.get_weather_snapshot().model_dump()


@router.get("/stadium")
async def get_stadium_data():
    """Get gate status, match timeline."""
    engine = _get_sim_engine()
    return engine.get_stadium_snapshot().model_dump()


@router.get("/full")
async def get_full_state():
    """Get all simulation data in a single payload."""
    engine = _get_sim_engine()
    return engine.get_full_state()
