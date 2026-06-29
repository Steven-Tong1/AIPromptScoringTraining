"""Application configuration management."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "postgresql://postgres:Admin19950929@localhost:5432/ai_prompt_training"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None

    # Multi-Model API Keys
    DEEPSEEK_API_KEY: Optional[str] = None
    QWEN_API_KEY: Optional[str] = None
    KIMI_API_KEY: Optional[str] = None
    DOUBAO_API_KEY: Optional[str] = None
    CLAUDE_API_KEY: Optional[str] = None

    # App
    APP_NAME: str = "AIPromptScoringTraining"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
