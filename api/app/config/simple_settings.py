"""
Simple configuration for academic steganography project.

Đồ án môn học: Data Hiding với Adaptive LSB Steganography
"""

from typing import List
from pydantic_settings import BaseSettings


class SimpleSettings(BaseSettings):
    """Simple settings for academic project"""
    
    # Basic app info
    app_name: str = "Steganography API - Academic Project"
    app_version: str = "1.0.0"
    debug: bool = True
    api_prefix: str = "/api/v1"
    
    # CORS settings (simple string list)
    cors_origins: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = None  # Don't load .env file to avoid conflicts
        extra = "ignore"  # Ignore extra environment variables


# Global settings instance
settings = SimpleSettings()


def get_settings() -> SimpleSettings:
    """Get settings instance"""
    return settings
