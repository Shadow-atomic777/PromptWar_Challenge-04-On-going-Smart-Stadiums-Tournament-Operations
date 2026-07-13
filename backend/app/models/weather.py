from pydantic import BaseModel, Field
from enum import Enum


class WeatherCondition(str, Enum):
    SUNNY = "sunny"
    PARTLY_CLOUDY = "partly_cloudy"
    CLOUDY = "cloudy"
    RAINY = "rainy"
    STORMY = "stormy"
    WINDY = "windy"


class WeatherAlertLevel(str, Enum):
    NONE = "none"
    ADVISORY = "advisory"
    WARNING = "warning"
    SEVERE = "severe"


class WeatherAlert(BaseModel):
    """A specific weather alert."""
    alert_type: str
    level: WeatherAlertLevel
    message: str
    issued_at: str


class WeatherSnapshot(BaseModel):
    """Current weather conditions."""
    timestamp: str
    temperature_celsius: float
    feels_like_celsius: float
    humidity_percent: float
    wind_speed_kmh: float
    wind_direction: str = Field(default="NW")
    condition: WeatherCondition
    uv_index: float
    heat_index: float
    visibility_km: float = Field(default=10.0)
    alerts: list[WeatherAlert] = Field(default_factory=list)
    roof_status: str = Field(default="open", description="open/closed/partial")
