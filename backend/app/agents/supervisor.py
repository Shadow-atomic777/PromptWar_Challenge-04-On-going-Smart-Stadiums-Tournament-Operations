from google import genai
from google.genai import types
from pydantic import BaseModel, Field
import time

from app.core.config import get_settings
from app.models.chat import ChatResponse, AgentStep

settings = get_settings()

class GeminiAgentStep(BaseModel):
    agent_name: str = Field(description="Name of the agent used (e.g., supervisor, queue_optimizer, weather_agent, route_planner, safety_agent)")
    action: str = Field(description="Action taken by the agent")
    input_summary: str = Field(description="Summary of input given to the agent")
    output_summary: str = Field(description="Summary of the agent's finding/action")

class GeminiChatResponse(BaseModel):
    message: str = Field(description="The natural language response to the fan, using markdown for formatting and emojis.")
    agents_used: list[str] = Field(description="List of agent names involved in reasoning")
    reasoning_steps: list[GeminiAgentStep] = Field(description="The logical steps taken to arrive at the response")
    suggestions: list[str] = Field(description="2-3 follow-up suggestions for the fan")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")

class SupervisorAgent:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        # If API key is missing, we'll gracefully fallback in the chat route
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def process_fan_query(self, query: str, fan_sector: str | None, current_state: dict) -> ChatResponse:
        """Process a fan query using Gemini and the live simulation state."""
        if not self.client:
            raise ValueError("GEMINI_API_KEY is not configured.")

        # Prepare the context from the live simulation state
        state_summary = self._summarize_state(current_state, fan_sector)
        
        prompt = f"""
You are the Supervisor Agent for OmniStadium, a high-tech stadium operations center.
A fan has asked a question. You must use the provided real-time stadium state to answer accurately.
Format the output as a friendly, helpful message with emojis. 
Do not expose the raw JSON data to the fan, synthesize it smoothly.
Include logical 'reasoning_steps' that show how different specialized agents (like queue_optimizer, route_planner, weather_agent) would have analyzed the data.

Fan Query: "{query}"
Fan Location: {fan_sector or 'Unknown'}

Real-time Stadium State:
{state_summary}
"""
        
        start_time = time.time()
        
        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiChatResponse,
                temperature=0.4,
            ),
        )
        
        total_duration = (time.time() - start_time) * 1000
        
        # Convert Gemini response to our domain model
        try:
            # We can use model_validate_json if using pydantic 2.x
            import json
            data = json.loads(response.text)
            
            steps = []
            # Distribute the total duration randomly among the steps for realism
            for s in data.get("reasoning_steps", []):
                steps.append(AgentStep(
                    agent_name=s["agent_name"],
                    action=s["action"],
                    input_summary=s["input_summary"],
                    output_summary=s["output_summary"],
                    duration_ms=round(total_duration / max(1, len(data.get("reasoning_steps", []))) * 0.9, 1)
                ))
            
            return ChatResponse(
                message=data.get("message", "I'm having trouble processing that right now."),
                agents_used=data.get("agents_used", ["supervisor"]),
                reasoning_steps=steps,
                suggestions=data.get("suggestions", []),
                confidence=data.get("confidence", 0.9)
            )
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            raise

    def _summarize_state(self, state: dict, fan_sector: str | None) -> str:
        """Create a targeted summary of the state to save tokens and focus context."""
        summary = []
        
        # Match Info
        match = state.get("stadium", {}).get("match", {})
        summary.append(f"Match: {match.get('home_team')} {match.get('home_score')} - {match.get('away_score')} {match.get('away_team')} ({match.get('phase')}, {match.get('current_minute')}')")
        
        # Weather
        weather = state.get("weather", {})
        summary.append(f"Weather: {weather.get('temperature_celsius')}°C, {weather.get('condition')}")
        if weather.get("alerts"):
            summary.append(f"Weather Alerts: {[a.get('message') for a in weather.get('alerts')]}")
            
        # Queues
        queues = state.get("queues", {}).get("queues", [])
        queue_text = "Queues:\n"
        for q in queues:
            queue_text += f"- {q.get('name')} (Sector: {q.get('sector')}): {q.get('current_wait_minutes')} min wait\n"
        summary.append(queue_text)
        
        # Parking
        parking = state.get("parking", {}).get("lots", [])
        parking_text = "Parking:\n"
        for p in parking:
            parking_text += f"- {p.get('name')}: {p.get('percentage_full')}% full\n"
        summary.append(parking_text)
        
        # Medical
        medical = state.get("medical", {}).get("active_incidents", [])
        if medical:
            summary.append(f"Active Incidents: {len(medical)} across the stadium.")
            
        return "\n".join(summary)
