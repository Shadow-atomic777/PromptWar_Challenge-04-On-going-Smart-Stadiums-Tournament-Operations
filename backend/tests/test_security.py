import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_security_headers(async_client: AsyncClient):
    """Test that the application returns OWASP-recommended security headers."""
    # Hit the root endpoint which has no auth to check global middleware
    res = await async_client.get("/")
    assert res.status_code == 200
    
    headers = res.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert "Strict-Transport-Security" in headers
    assert "Content-Security-Policy" in headers

@pytest.mark.asyncio
async def test_rate_limiting_brute_force_protection(async_client: AsyncClient):
    """Test that the /api/auth/login endpoint limits brute-force attempts."""
    
    # We send 6 bad login requests (Limit is 5/minute). 
    # State might carry over from other tests, so we just check that AT LEAST ONE gets 429
    got_429 = False
    for i in range(6):
        res = await async_client.post("/api/auth/staff/login", json={
            "staff_id": "FAKE-ID",
            "password": "wrongpassword"
        })
        if res.status_code == 429:
            got_429 = True
            assert "Rate limit exceeded" in res.json().get("error", "") or "RateLimit" in str(res.json())
            break
            
    assert got_429, "Rate limiter did not block brute-force attempts"
