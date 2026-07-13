from pydantic import BaseModel, Field
from enum import Enum


class DensityStatus(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"


class SectorDensity(BaseModel):
    """Crowd density data for a single stadium sector."""
    sector_id: str = Field(..., description="Unique sector identifier")
    sector_name: str = Field(..., description="Human-readable sector name")
    capacity: int = Field(..., description="Maximum capacity of sector")
    current_count: int = Field(..., description="Current headcount in sector")
    density_percentage: float = Field(..., description="Occupancy percentage 0-100")
    status: DensityStatus = Field(default=DensityStatus.NORMAL)
    trend: str = Field(default="stable", description="rising/falling/stable")


class CrowdSnapshot(BaseModel):
    """Full stadium crowd density snapshot."""
    timestamp: str
    total_attendance: int
    stadium_capacity: int
    overall_density: float
    sectors: list[SectorDensity]
    hotspots: list[str] = Field(default_factory=list, description="Sectors with critical density")
