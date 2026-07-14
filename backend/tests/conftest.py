import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import sys
import os

# Add the backend directory to sys.path to allow absolute imports from 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.database import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_test_env():
    """Ensure database tables exist and mock the simulation engine before running tests."""
    import app.main as main
    from app.services.simulation import SimulationEngine
    
    await init_db()
    
    # Manually instantiate so endpoints don't return 503 Service Unavailable
    main.simulation_engine = SimulationEngine()
    
    yield
    
    main.simulation_engine = None

@pytest_asyncio.fixture
async def async_client():
    """Provide an asynchronous HTTPX client configured with the FastAPI ASGI app."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        yield client
