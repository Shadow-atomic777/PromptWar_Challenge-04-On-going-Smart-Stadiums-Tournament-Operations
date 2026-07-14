import os
from dotenv import load_dotenv

# Force loading .env file
load_dotenv()

if not os.getenv("GEMINI_API_KEY"):
    print("❌ Error: GEMINI_API_KEY is not set in your .env file!")
    exit(1)

print(f"✅ Found GEMINI_API_KEY: {os.getenv('GEMINI_API_KEY')[:10]}...")

from app.agents.supervisor import SupervisorAgent

print("\n🤖 Initializing Gemini Supervisor Agent...")
supervisor = SupervisorAgent()

# Dummy state to test with
mock_state = {
    "stadium": {"match": {"home_team": "USA", "home_score": 1, "away_team": "Brazil", "away_score": 0, "phase": "first_half", "current_minute": 32}},
    "weather": {"temperature_celsius": 28, "condition": "clear", "alerts": []},
    "queues": {"queues": [{"name": "Burger Stand", "sector": "north_lower", "current_wait_minutes": 15}, {"name": "Taco Bar", "sector": "east_lower", "current_wait_minutes": 2}]},
    "parking": {"lots": [{"name": "Lot A", "percentage_full": 95}]},
    "medical": {"active_incidents": []}
}

print("\n🗣️ Fan: 'I am hungry but I don't want to wait long. I am in the north lower sector. What should I do?'")
print("⏳ Waiting for Gemini's response (this will test the API connection)...\n")

try:
    response = supervisor.process_fan_query(
        query="I am hungry but I don't want to wait long. I am in the north lower sector. What should I do?",
        fan_sector="north_lower",
        current_state=mock_state
    )
    
    print("✅ GEMINI API SUCCESS!")
    print("--------------------------------------------------")
    print(f"Message: {response.message}")
    print(f"Agents Used: {response.agents_used}")
    print("Reasoning Steps:")
    for step in response.reasoning_steps:
        print(f" - [{step.agent_name}] {step.action}: {step.output_summary} ({step.duration_ms}ms)")
    print("--------------------------------------------------")

except Exception as e:
    print(f"❌ GEMINI API FAILED: {e}")
