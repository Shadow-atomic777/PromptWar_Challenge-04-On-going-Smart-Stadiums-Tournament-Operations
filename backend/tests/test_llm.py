from unittest.mock import patch, MagicMock
import pytest
from app.agents.supervisor import SupervisorAgent
from app.models.chat import ChatResponse

def test_supervisor_agent_no_key():
    """Test that supervisor gracefully handles missing API key."""
    with patch('app.agents.supervisor.settings') as mock_settings:
        mock_settings.GEMINI_API_KEY = None
        agent = SupervisorAgent()
        
        with pytest.raises(ValueError) as excinfo:
            agent.process_fan_query("Where is the bathroom?", "north_lower", {})
        
        assert "GEMINI_API_KEY is not configured" in str(excinfo.value)

def test_supervisor_summarize_state():
    """Test the internal state summarization method."""
    agent = SupervisorAgent()
    agent.client = MagicMock() # Mock client to bypass None check
    
    mock_state = {
        "stadium": {"match": {"home_team": "USA", "home_score": 1, "away_team": "Brazil", "away_score": 0, "phase": "1st Half", "current_minute": 22}},
        "weather": {"temperature_celsius": 24, "condition": "Clear"},
        "queues": {"queues": [{"name": "Hotdog Stand", "sector": "north", "current_wait_minutes": 5}]},
    }
    
    summary = agent._summarize_state(mock_state, "north_lower")
    
    assert "USA 1 - 0 Brazil" in summary
    assert "24°C, Clear" in summary
    assert "Hotdog Stand (Sector: north): 5 min wait" in summary

@patch('app.agents.supervisor.genai.Client')
def test_supervisor_process_query(mock_client_class):
    """Test that the supervisor successfully processes a query when Gemini responds."""
    # Setup mock
    mock_client = MagicMock()
    mock_client_class.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.text = '''{
        "message": "The bathroom is located in Sector North.",
        "agents_used": ["supervisor", "route_planner"],
        "reasoning_steps": [
            {"agent_name": "route_planner", "action": "find_restroom", "input_summary": "north", "output_summary": "found"}
        ],
        "suggestions": ["Show me the map"],
        "confidence": 0.95
    }'''
    mock_client.models.generate_content.return_value = mock_response
    
    # Initialize agent with fake key
    with patch('app.agents.supervisor.settings') as mock_settings:
        mock_settings.GEMINI_API_KEY = "fake-key"
        agent = SupervisorAgent()
        
        response = agent.process_fan_query("Where is bathroom?", "north", {})
        
        assert isinstance(response, ChatResponse)
        assert response.message == "The bathroom is located in Sector North."
        assert "route_planner" in response.agents_used
        assert len(response.reasoning_steps) == 1
        assert response.reasoning_steps[0].agent_name == "route_planner"
