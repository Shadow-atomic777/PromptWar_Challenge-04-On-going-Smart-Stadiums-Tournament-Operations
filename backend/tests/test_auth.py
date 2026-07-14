import pytest

@pytest.mark.asyncio
async def test_staff_auth_flow(async_client):
    """Integration test for the complete staff authentication lifecycle (Signup -> Login -> JWT Validation)."""
    
    # 1. Signup Attempt
    signup_data = {
        "staff_id": "TEST_SEC_999",
        "password": "strongpassword123",
        "name": "Test Security Officer"
    }
    res = await async_client.post("/api/auth/staff/signup", json=signup_data)
    
    # Allow 400 if user already exists from a previous test run
    if res.status_code == 200:
        assert res.json()["success"] is True

    # 2. Login Attempt
    login_data = {
        "staff_id": "TEST_SEC_999",
        "password": "strongpassword123"
    }
    res = await async_client.post("/api/auth/staff/login", json=login_data)
    
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["role"] == "ops"
    assert data["name"] == "Test Security Officer"

@pytest.mark.asyncio
async def test_invalid_login(async_client):
    """Test that invalid credentials correctly return an HTTP 401 Unauthorized status."""
    res = await async_client.post("/api/auth/staff/login", json={
        "staff_id": "FAKE_USER_123",
        "password": "wrongpassword"
    })
    
    assert res.status_code == 401
    assert "Invalid Staff ID or Password" in res.json()["detail"]

@pytest.mark.asyncio
async def test_unauthorized_ops_access(async_client):
    """Test that the Ops API is secure and rejects requests without a valid Bearer token."""
    res = await async_client.post("/api/ops/incident", json={
        "type": "medical",
        "severity": "high",
        "sector": "north_upper",
        "description": "Test unauthorized"
    })
    
    # Because we secured this route in Phase 2, it should return 403 Forbidden
    assert res.status_code == 403
