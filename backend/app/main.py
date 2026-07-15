from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import asyncio
import os

from app.core.config import get_settings
from app.core.database import init_db
from app.api.simulation_routes import router as sim_router
from app.api.chat_routes import router as chat_router
from app.api.ops_routes import router as ops_router
from app.api.ws_routes import router as ws_router
from app.api.auth_routes import router as auth_router
from app.services.simulation import SimulationEngine

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter
import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

settings = get_settings()

# Global simulation engine instance
simulation_engine: SimulationEngine | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    global simulation_engine

    # Startup
    logger.info(f"[{settings.APP_NAME} v{settings.APP_VERSION}] starting...")
    await init_db()

    # Start simulation engine
    simulation_engine = SimulationEngine()
    sim_task = asyncio.create_task(simulation_engine.run())
    logger.info(f"[Simulation Engine] running in background (tick every {settings.SIMULATION_TICK_SECONDS}s)")

    yield

    # Shutdown
    logger.info("Shutting down...")
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

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; connect-src 'self' *; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';"
    return response

# Mount routers
app.include_router(sim_router, prefix="/api/sim", tags=["Simulation"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(ops_router, prefix="/api/ops", tags=["Operations"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
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

# Serve React Frontend (Single Page Application)
frontend_dist = os.path.join(os.path.dirname(__file__), "../../frontend/dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Prevent API routes from being intercepted by the frontend catch-all
        if full_path.startswith("api/"):
            return {"error": "Not Found"}
            
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Fallback to index.html for React Router
        return FileResponse(os.path.join(frontend_dist, "index.html"))
