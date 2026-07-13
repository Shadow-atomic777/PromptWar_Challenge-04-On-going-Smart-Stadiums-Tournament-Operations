from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

# Resolve the backend directory so .env is always found
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_ENV_FILE = _BACKEND_DIR / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "OmniStadium"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # API Keys
    GEMINI_API_KEY: str = ""

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./omnistadium.db"

    # Simulation
    SIMULATION_TICK_SECONDS: int = 5

    # Stadium Config
    STADIUM_CAPACITY: int = 80000
    STADIUM_NAME: str = "MetLife Stadium"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
