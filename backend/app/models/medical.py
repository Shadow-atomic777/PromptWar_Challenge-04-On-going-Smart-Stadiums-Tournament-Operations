from pydantic import BaseModel, Field
from enum import Enum


class IncidentSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentType(str, Enum):
    HEAT_EXHAUSTION = "heat_exhaustion"
    FALL = "fall"
    CARDIAC = "cardiac"
    DEHYDRATION = "dehydration"
    CROWD_CRUSH = "crowd_crush"
    ALLERGIC_REACTION = "allergic_reaction"
    OTHER = "other"


class IncidentStatus(str, Enum):
    ACTIVE = "active"
    RESPONDING = "responding"
    RESOLVED = "resolved"


class MedicalIncident(BaseModel):
    """A single medical or safety incident."""
    incident_id: str
    incident_type: IncidentType
    severity: IncidentSeverity
    sector: str
    description: str
    status: IncidentStatus = Field(default=IncidentStatus.ACTIVE)
    responders_assigned: int = Field(default=0)
    created_at: str
    resolved_at: str | None = None


class MedicalSnapshot(BaseModel):
    """All medical incidents and station status."""
    timestamp: str
    active_incidents: list[MedicalIncident]
    total_active: int
    total_resolved_today: int
    medical_stations_available: int
    ambulances_on_standby: int
