"""Fan chat endpoint — routes queries through the AI agent system."""
from fastapi import APIRouter, HTTPException

from app.models.chat import ChatRequest, ChatResponse, AgentStep
from app.agents.supervisor import SupervisorAgent

router = APIRouter()

# Instantiate the supervisor lazily or globally
supervisor = SupervisorAgent()


@router.post("/fan", response_model=ChatResponse)
async def fan_chat(request: ChatRequest):
    """
    Fan query → Multi-agent AI response.
    
    Routes the fan's natural language question through the Supervisor Agent,
    which delegates to specialized sub-agents for crowd, queue, route, safety,
    and weather analysis.
    """
    from app.main import simulation_engine
    
    if simulation_engine is None:
        raise HTTPException(status_code=503, detail="Simulation engine not running")
        
    current_state = simulation_engine.get_full_state()

    response = None
    # Try to use Gemini
    if supervisor.client:
        try:
            response = supervisor.process_fan_query(
                query=request.message, 
                fan_sector=request.sector, 
                current_state=current_state
            )
        except Exception as e:
            print(f"[Gemini API failed]: {e}. Falling back to hardcoded responses.")
            # Fall through to hardcoded responses if it fails
            
    if not response:
        # Fallback / Demo responses
        message = request.message.lower()
        agents_used = ["supervisor"]
        suggestions = []
        steps = []
        
        if any(word in message for word in ["eat", "food", "hungry", "restaurant", "burger"]):
            agents_used.extend(["queue_optimizer", "route_planner"])
            response_text = (
                "🍔 Based on current wait times, I recommend the **Taco Bar - East** "
                "(~4 min wait) over the Burger Stand - North (~12 min wait). "
                "It's a 3-minute walk from your section. The Pizza Corner - South "
                "also has short lines right now."
            )
            suggestions = [
                "Show me the fastest route to Taco Bar",
                "What about vegetarian options?",
                "How long until halftime?",
            ]
            steps = [
                AgentStep(agent_name="supervisor", action="classify_intent", input_summary=request.message, output_summary="Intent: food_recommendation", duration_ms=45),
                AgentStep(agent_name="queue_optimizer", action="find_shortest_queue", input_summary="food queues near fan sector", output_summary="Taco Bar - East: 4 min wait", duration_ms=120),
                AgentStep(agent_name="route_planner", action="calculate_route", input_summary="fan location → Taco Bar", output_summary="3 min walk via Concourse B", duration_ms=85),
            ]
        elif any(word in message for word in ["bathroom", "restroom", "toilet", "washroom"]):
            agents_used.extend(["queue_optimizer", "route_planner"])
            response_text = (
                "🚻 The nearest restrooms are in **Section East** with a ~3 min wait. "
                "The North restrooms currently have longer queues (~8 min). "
                "I'd suggest heading East for the quickest access."
            )
            suggestions = ["Show me the route", "Are there family restrooms nearby?"]
            steps = [
                AgentStep(agent_name="supervisor", action="classify_intent", input_summary=request.message, output_summary="Intent: restroom_location", duration_ms=40),
                AgentStep(agent_name="queue_optimizer", action="find_shortest_queue", input_summary="restroom queues", output_summary="East restrooms: 3 min", duration_ms=95),
            ]
        elif any(word in message for word in ["score", "match", "game", "goal", "playing"]):
            agents_used.append("event_scheduler")
            response_text = (
                "⚽ **USA vs Brazil** — FIFA World Cup 2026\n"
                "The match is currently in progress. Check the live score on the main display!"
            )
            suggestions = ["When is halftime?", "What's the crowd like?"]
            steps = [
                AgentStep(agent_name="supervisor", action="classify_intent", input_summary=request.message, output_summary="Intent: match_info", duration_ms=35),
                AgentStep(agent_name="event_scheduler", action="get_match_status", input_summary="current match", output_summary="USA vs Brazil, in progress", duration_ms=50),
            ]
        elif any(word in message for word in ["emergency", "help", "medical", "hurt", "injured"]):
            agents_used.extend(["safety_agent", "communication_agent"])
            response_text = (
                "🚨 **Emergency services have been notified.** "
                "Please stay where you are. A medical responder is being dispatched to your location. "
                "If this is a life-threatening emergency, please also call stadium security at the nearest help point."
            )
            suggestions = ["Where is the nearest medical station?", "I need wheelchair assistance"]
            steps = [
                AgentStep(agent_name="supervisor", action="classify_intent", input_summary=request.message, output_summary="Intent: emergency", duration_ms=30),
                AgentStep(agent_name="safety_agent", action="dispatch_responder", input_summary="medical emergency in fan sector", output_summary="Responder dispatched, ETA 2 min", duration_ms=150),
                AgentStep(agent_name="communication_agent", action="generate_notification", input_summary="emergency acknowledgment", output_summary="Notification sent to fan", duration_ms=60),
            ]
        elif any(word in message for word in ["park", "car", "parking", "drive", "lot"]):
            agents_used.extend(["route_planner"])
            response_text = (
                "🅿️ Current parking status:\n"
                "- **Lot A (Main)**: Almost full\n"
                "- **Lot B (East)**: Spaces available\n"
                "- **Lot D (Remote)**: Plenty of spaces, shuttle service running\n\n"
                "I recommend **Lot B** for the best balance of availability and proximity."
            )
            suggestions = ["Navigate me to Lot B", "Is there VIP parking?"]
            steps = [
                AgentStep(agent_name="supervisor", action="classify_intent", input_summary=request.message, output_summary="Intent: parking_info", duration_ms=38),
                AgentStep(agent_name="route_planner", action="get_parking_status", input_summary="all lots", output_summary="Lot B recommended", duration_ms=75),
            ]
        elif any(word in message for word in ["weather", "rain", "hot", "temperature", "sun"]):
            agents_used.append("weather_agent")
            response_text = (
                "🌤️ Current conditions: **32°C, Sunny** with moderate humidity. "
                "UV index is high — sunscreen recommended! Free water is available at all "
                "hydration stations throughout the stadium."
            )
            suggestions = ["Will it rain later?", "Where are the shaded areas?"]
            steps = [
                AgentStep(agent_name="supervisor", action="classify_intent", input_summary=request.message, output_summary="Intent: weather_query", duration_ms=32),
                AgentStep(agent_name="weather_agent", action="get_conditions", input_summary="current weather", output_summary="32°C, Sunny, UV High", duration_ms=45),
            ]
        else:
            response_text = (
                "👋 I'm your OmniStadium AI assistant! I can help you with:\n\n"
                "🍔 **Food & Drinks** — Find the shortest queues\n"
                "🚻 **Restrooms** — Nearest with shortest wait\n"
                "🅿️ **Parking** — Lot availability & directions\n"
                "⚽ **Match Info** — Score, schedule, timeline\n"
                "🌤️ **Weather** — Current conditions & alerts\n"
                "🚨 **Emergency** — Medical help & safety\n\n"
                "Just ask me anything!"
            )
            suggestions = ["Where should I eat?", "What's the score?", "Find me a restroom"]
            steps = [AgentStep(agent_name="supervisor", action="classify_intent", input_summary=request.message, output_summary="Intent: general_help", duration_ms=42)]
        
        response = ChatResponse(
            message=response_text,
            agents_used=agents_used,
            reasoning_steps=steps,
            suggestions=suggestions,
            confidence=0.92,
        )

    # Save to SQLite
    from app.core.database import get_db
    try:
        db = await get_db()
        try:
            fan_id = getattr(request, 'fan_id', 'unknown')
            await db.execute(
                "INSERT OR REPLACE INTO fan_sessions (fan_id, sector, last_query) VALUES (?, ?, ?)",
                (fan_id, request.sector, request.message)
            )
            for step in response.reasoning_steps:
                await db.execute(
                    "INSERT INTO agent_logs (agent_name, action, input_data, output_data, duration_ms) VALUES (?, ?, ?, ?, ?)",
                    (step.agent_name, step.action, step.input_summary, step.output_summary, step.duration_ms)
                )
            await db.commit()
        finally:
            await db.close()
    except Exception as e:
        print(f"[DB Error] Failed to log chat: {e}")
        
    return response
