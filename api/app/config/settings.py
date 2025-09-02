"""
Configuration settings for the FastAPI Steganography Backend.

This module handles all application configuration including:
- Environment variables loading
- Application settings validation
- Default values and constraints
- Security and performance settings
"""

from typing import List, Optional
from pathlib import Path
from pydantic import Field, field_validator, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict
import os


class Settings(BaseSettings):
    """
    Application settings with environment variable support.
    
    All settings can be overridden via environment variables.
    See .env.example for available configuration options.
    """
    
    # Application Information
    app_name: str = Field(default="Steganography API", description="Application name")
    app_version: str = Field(default="1.0.0", description="Application version")
    environment: str = Field(default="development", description="Environment (development/staging/production)")
    debug: bool = Field(default=True, description="Enable debug mode")
    api_prefix: str = Field(default="/api/v1", description="API prefix for all endpoints")
    
    # Server Configuration
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")
    workers: int = Field(default=1, description="Number of worker processes")
    
    # Logging Configuration
    log_level: str = Field(default="debug", description="Logging level")
    log_format: str = Field(default="json", description="Log format (json/text)")
    log_file: str = Field(default="logs/app.log", description="Log file path")
    
    # File Upload Settings
    max_file_size: int = Field(default=50, description="Maximum file size in MB")
    allowed_extensions: List[str] = Field(
        default=["png", "jpg", "jpeg", "bmp", "tiff"],
        description="Allowed file extensions"
    )
    upload_dir: str = Field(default="uploads", description="Upload directory path")
    
    # Request Configuration
    request_timeout: int = Field(default=300, description="Request timeout in seconds")
    max_request_size: int = Field(default=52428800, description="Maximum request size in bytes")
    
    # CORS Settings
    cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080,http://localhost:4200,http://127.0.0.1:4200,*",
        description="Allowed CORS origins (comma-separated)"
    )
    cors_methods: str = Field(
        default="GET,POST,PUT,DELETE,OPTIONS",
        description="Allowed CORS methods (comma-separated)"
    )
    cors_headers: str = Field(default="*", description="Allowed CORS headers (comma-separated)")
    
    # Security Settings
    secret_key: str = Field(
        default="your-super-secret-key-change-this-in-production",
        description="Secret key for JWT tokens"
    )
    access_token_expire_minutes: int = Field(
        default=30,
        description="Access token expiration time in minutes"
    )
    algorithm: str = Field(default="HS256", description="JWT algorithm")
    
    # Redis Configuration (optional)
    redis_url: Optional[str] = Field(
        default="redis://localhost:6379",
        description="Redis connection URL"
    )
    redis_password: Optional[str] = Field(
        default=None,
        description="Redis password"
    )
    redis_db: int = Field(default=0, description="Redis database number")
    
    # Database Configuration (if needed)
    database_url: Optional[str] = Field(
        default="sqlite:///./steganography.db",
        description="Database connection URL"
    )
    
    # External API Settings
    external_api_key: Optional[str] = Field(
        default=None,
        description="External API key"
    )
    external_api_url: Optional[str] = Field(
        default=None,
        description="External API URL"
    )
    
    # Monitoring and Performance
    enable_metrics: bool = Field(default=True, description="Enable metrics collection")
    metrics_port: int = Field(default=9090, description="Metrics server port")
    
    @field_validator("max_file_size")
    @classmethod
    def validate_max_file_size(cls, v):
        """Validate maximum file size is reasonable."""
        if v < 1 or v > 1000:
            raise ValueError("max_file_size must be between 1 and 1000 MB")
        return v
    
    @field_validator("allowed_extensions")
    @classmethod
    def validate_extensions(cls, v):
        """Validate file extensions."""
        valid_extensions = {"png", "jpg", "jpeg", "bmp", "tiff", "gif", "webp"}
        for ext in v:
            if ext.lower() not in valid_extensions:
                raise ValueError(f"Unsupported file extension: {ext}")
        return [ext.lower() for ext in v]
    
    
    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v):
        """Validate environment value."""
        allowed_envs = {"development", "staging", "production"}
        if v.lower() not in allowed_envs:
            raise ValueError(f"environment must be one of: {allowed_envs}")
        return v.lower()
    
    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v):
        """Validate log level."""
        allowed_levels = {"debug", "info", "warning", "error", "critical"}
        if v.lower() not in allowed_levels:
            raise ValueError(f"log_level must be one of: {allowed_levels}")
        return v.lower()
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == "production"
    
    @property
    def is_debug(self) -> bool:
        """Check if debug mode is enabled."""
        return self.debug and not self.is_production
    
    @property
    def max_file_size_bytes(self) -> int:
        """Get maximum file size in bytes."""
        return self.max_file_size * 1024 * 1024
    
    @property
    def upload_path(self) -> Path:
        """Get upload directory path as Path object."""
        return Path(self.upload_dir)
    
    @property
    def log_path(self) -> Path:
        """Get log file path as Path object."""
        return Path(self.log_file)
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def cors_methods_list(self) -> List[str]:
        """Get CORS methods as a list."""
        return [method.strip().upper() for method in self.cors_methods.split(",")]
    
    @property
    def cors_headers_list(self) -> List[str]:
        """Get CORS headers as a list."""
        if self.cors_headers == "*":
            return ["*"]
        return [header.strip() for header in self.cors_headers.split(",")]
    
    def create_directories(self) -> None:
        """Create necessary directories if they don't exist."""
        self.upload_path.mkdir(parents=True, exist_ok=True)
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


# Global settings instance
settings = Settings()

# Create necessary directories on module import
settings.create_directories()


def get_settings() -> Settings:
    """
    Dependency function to get settings instance.
    
    Returns:
        Settings: The global settings instance
    """
    return settings