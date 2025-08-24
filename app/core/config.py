"""
Application configuration using Pydantic Settings
"""
from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import Field
import os
from pathlib import Path


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    # Application
    APP_NAME: str = Field(default="AI Video Creator")
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=False)
    
    # Google AI Studio
    GOOGLE_AI_API_KEY: Optional[str] = Field(default=None, description="Google AI Studio API Key")
    GOOGLE_PROJECT_NUMBER: Optional[str] = Field(default=None)
    
    # Kling AI
    KLING_API_ACCESS_KEY: Optional[str] = Field(default=None, description="Kling AI Access Key")
    KLING_API_SECRET_KEY: Optional[str] = Field(default=None, description="Kling AI Secret Key")
    KLING_API_BASE_URL: str = Field(default="https://api.klingai.com/v1")
    
    # Database
    DATABASE_URL: str = Field(default="sqlite:///./ai_video_creator.db")
    
    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    
    # Storage
    UPLOAD_DIR: Path = Field(default=Path("./uploads"))
    OUTPUT_DIR: Path = Field(default=Path("./outputs"))
    MAX_UPLOAD_SIZE: int = Field(default=104857600)  # 100MB
    
    # File Validation
    ALLOWED_IMAGE_TYPES: List[str] = Field(
        default=[".jpg", ".jpeg", ".png", ".webp", ".gif"]
    )
    ALLOWED_VIDEO_TYPES: List[str] = Field(
        default=[".mp4", ".avi", ".mov", ".webm"]
    )
    
    # API Settings
    API_HOST: str = Field(default="0.0.0.0")
    API_PORT: int = Field(default=8000)
    
    # Video Generation
    DEFAULT_VIDEO_DURATION: int = Field(default=5)
    MAX_VIDEO_DURATION: int = Field(default=30)
    DEFAULT_ASPECT_RATIO: str = Field(default="16:9")
    
    # Security
    SECRET_KEY: str = Field(default="change-this-in-production-to-a-secure-random-string")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Create directories if they don't exist
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        
        # Create temp directory
        temp_dir = Path("./temp")
        temp_dir.mkdir(exist_ok=True)


# Create global settings instance
settings = Settings()