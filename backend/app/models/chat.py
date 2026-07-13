from pydantic import BaseModel, Field


class AgentStep(BaseModel):
    """A single step in the agent reasoning chain."""
    agent_name: str
    action: str
    input_summary: str
    output_summary: str
    duration_ms: float


class ChatRequest(BaseModel):
    """Fan chat request."""
    fan_id: str = Field(default="anonymous")
    message: str = Field(..., min_length=1, max_length=500)
    sector: str | None = Field(default=None, description="Fan's current sector")
    context: dict | None = Field(default=None, description="Additional context")


class ChatResponse(BaseModel):
    """AI response to fan query."""
    message: str
    agents_used: list[str] = Field(default_factory=list)
    reasoning_steps: list[AgentStep] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    confidence: float = Field(default=0.9, ge=0, le=1)


class IncidentRequest(BaseModel):
    """Manual incident creation request from ops staff."""
    incident_type: str
    severity: str
    sector: str
    description: str


class IncidentResponse(BaseModel):
    """Response after creating an incident."""
    incident_id: str
    status: str
    ai_recommendation: str
    agents_activated: list[str]
