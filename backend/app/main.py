from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from app.core.config import get_settings
from app.core.database import init_db
from app.api.simulation_routes import router as sim_router
from app.api.chat_routes import router as chat_router
from app.api.ops_routes import router as ops_router
from app.api.ws_routes import router as ws_router
from app.services.simulation import SimulationEngine

settings = get_settings()

# Global simulation engine instance
simulation_engine: SimulationEngine | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    global simulation_engine

    # Startup
    print(f"[{settings.APP_NAME} v{settings.APP_VERSION}] starting...")
    await init_db()

    # Start simulation engine
    simulation_engine = SimulationEngine()
    sim_task = asyncio.create_task(simulation_engine.run())
    print(f"[Simulation Engine] running in background (tick every {settings.SIMULATION_TICK_SECONDS}s)")

    yield

    # Shutdown
    print("Shutting down...")
    if simulation_engine:
        simulation_engine.stop()
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Multi-Agent AI Stadium Operations Center for FIFA World Cup 2026",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(sim_router, prefix="/api/sim", tags=["Simulation"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(ops_router, prefix="/api/ops", tags=["Operations"])
app.include_router(ws_router, tags=["WebSocket"])


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "description": "Multi-Agent AI Stadium Operations Center",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "simulation_active": simulation_engine is not None and simulation_engine.running,
    }
