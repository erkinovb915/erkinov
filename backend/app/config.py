from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Application configuration loaded strictly from environment variables."""

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    database_url: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/erkinov_portfolio"
    )
    cors_origins: str = "http://localhost:5173"
    cors_origin_regex: str | None = None
    admin_api_key: str = ""
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    app_env: str = "production"
    port: int = 8000

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("DATABASE_URL must be a non-empty PostgreSQL URL.")
        cleaned = value.strip()
        if cleaned.startswith("postgres://"):
            cleaned = "postgresql+psycopg://" + cleaned[len("postgres://") :]
        elif cleaned.startswith("postgresql://"):
            cleaned = "postgresql+psycopg://" + cleaned[len("postgresql://") :]
        elif cleaned.startswith("postgresql+psycopg2://"):
            cleaned = "postgresql+psycopg://" + cleaned[len("postgresql+psycopg2://") :]
        return cleaned

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip().rstrip("/")
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
