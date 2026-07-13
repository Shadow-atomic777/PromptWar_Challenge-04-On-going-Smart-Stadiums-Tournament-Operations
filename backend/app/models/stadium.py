from pydantic import BaseModel, Field
from enum import Enum


class GateStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    RESTRICTED = "restricted"
    EMERGENCY_ONLY = "emergency_only"


class MatchPhase(str, Enum):
    PRE_MATCH = "pre_match"
    FIRST_HALF = "first_half"
    HALFTIME = "halftime"
    SECOND_HALF = "second_half"
    EXTRA_TIME = "extra_time"
    PENALTIES = "penalties"
    POST_MATCH = "post_match"


class Gate(BaseModel):
    """Status of a single stadium gate."""
    gate_id: str
    name: str
    status: GateStatus
    flow_rate: int = Field(default=0, description="People per minute passing through")
    sector: str


class MatchInfo(BaseModel):
    """Current match status."""
    home_team: str
    away_team: str
    home_score: int = 0
    away_score: int = 0
    phase: MatchPhase
    current_minute: int = 0
    competition: str = "FIFA World Cup 2026"


class StadiumSnapshot(BaseModel):
    """Overall stadium status snapshot."""
    timestamp: str
    stadium_name: str
    gates: list[Gate]
    match: MatchInfo
    announcements: list[str] = Field(default_factory=list)
    emergency_mode: bool = False
