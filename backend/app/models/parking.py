from pydantic import BaseModel, Field
from enum import Enum


class ParkingStatus(str, Enum):
    AVAILABLE = "available"
    FILLING = "filling"
    ALMOST_FULL = "almost_full"
    FULL = "full"


class ParkingLot(BaseModel):
    """Occupancy data for a single parking lot."""
    lot_id: str
    name: str
    total_spaces: int
    occupied: int
    available: int
    percentage_full: float
    status: ParkingStatus
    distance_to_gate_meters: int = Field(default=200)


class ParkingSnapshot(BaseModel):
    """All parking lot statuses."""
    timestamp: str
    lots: list[ParkingLot]
    total_spaces: int
    total_occupied: int
    overall_percentage: float
