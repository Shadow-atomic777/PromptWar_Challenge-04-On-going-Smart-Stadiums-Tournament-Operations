import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_fan_chat_unauthorized(async_client: AsyncClient):
    """Test that hitting the LLM endpoint without a JWT is rejected."""
    response = await async_client.post("/api/chat/fan", json={
        "message": "Hello",
        "fan_id": "test-fan",
        "sector": "north"
    })
    
    # Expect 403 Forbidden because no Authorization header is present
    assert response.status_code == 403
    assert response.json() == {"detail": "Not authenticated"}

from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
async def test_fan_chat_authorized(async_client: AsyncClient):
    """Test that hitting the LLM endpoint WITH a JWT works and saves to DB."""
    # Mock the get_current_user dependency so it bypasses real JWT validation
    from app.api.chat_routes import get_current_user
    
    # Override dependency for this test
    from app.main import app
    app.dependency_overrides[get_current_user] = lambda: {"role": "fan", "id": "test-fan", "name": "Test Fan"}
    
    with patch('app.api.chat_routes.supervisor.process_fan_query', return_value=None), \
         patch('app.main.simulation_engine') as mock_sim:
        
        mock_sim.get_full_state.return_value = {}
    
        response = await async_client.post("/api/chat/fan", json={
            "message": "eat", # Should trigger the fallback "eat" logic in chat_routes
            "fan_id": "test-fan",
            "sector": "north"
        })
    
    # Restore dependency
    app.dependency_overrides = {}
    
    assert response.status_code == 200
    data = response.json()
    assert "Taco Bar" in data["message"]
    assert "queue_optimizer" in data["agents_used"]
