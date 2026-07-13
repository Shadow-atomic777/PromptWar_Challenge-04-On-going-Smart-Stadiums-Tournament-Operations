from pydantic import BaseModel, Field
from enum import Enum


class QueueType(str, Enum):
    FOOD = "food"
    RESTROOM = "restroom"
    MERCHANDISE = "merchandise"
    GATE = "gate"


class QueueStatus(str, Enum):
    SHORT = "short"
    MODERATE = "moderate"
    LONG = "long"
    VERY_LONG = "very_long"


class QueueInfo(BaseModel):
    """Wait time and status for a single queue."""
    queue_id: str
    name: str = Field(..., description="E.g., 'Hot Dogs - Section 12'")
    queue_type: QueueType
    sector: str
    current_wait_minutes: float
    queue_length: int = Field(..., description="Number of people in line")
    status: QueueStatus
    estimated_service_rate: float = Field(default=2.0, description="People served per minute")


class QueueSnapshot(BaseModel):
    """All queue statuses across the stadium."""
    timestamp: str
    queues: list[QueueInfo]
    average_wait_minutes: float
    busiest_queue: str | None = None
    recommendation: str | None = None
