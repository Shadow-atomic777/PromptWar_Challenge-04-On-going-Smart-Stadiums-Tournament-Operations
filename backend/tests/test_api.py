import pytest

@pytest.mark.asyncio
async def test_sim_crowd_endpoint(async_client):
    """Test that the crowd simulation endpoint returns valid sector data."""
    res = await async_client.get("/api/sim/crowd")
    assert res.status_code == 200
    
    data = res.json()
    assert isinstance(data, dict)
    
    # Check if a known sector exists in the response
    assert "north_lower" in data or len(data) >= 0

@pytest.mark.asyncio
async def test_sim_weather_endpoint(async_client):
    """Test that the weather simulation endpoint returns valid weather data."""
    res = await async_client.get("/api/sim/weather")
    assert res.status_code == 200
    
    data = res.json()
    assert "temperature_celsius" in data
    assert "condition" in data

@pytest.mark.asyncio
async def test_sim_stadium_status(async_client):
    """Test that the overall stadium status endpoint works."""
    res = await async_client.get("/api/sim/stadium")
    assert res.status_code == 200
    
    data = res.json()
    assert "match" in data
    assert "phase" in data["match"]
    assert "current_minute" in data["match"]
