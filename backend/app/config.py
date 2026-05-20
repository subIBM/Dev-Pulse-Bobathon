"""
Configuration management for DevPulse backend
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # IBM Services
    ibm_bob_api_key: str = ""
    ibm_bob_base_url: str = "https://api.ibm.com/bob/v1"
    ibm_agent_studio_url: str = ""
    ibm_agent_studio_api_key: str = ""
    ibm_agent_id: str = ""
    
    # Application
    app_name: str = "DevPulse"
    app_version: str = "1.0.0"
    database_path: str = "./devpulse.db"
    log_level: str = "INFO"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Development
    debug: bool = False
    
    # API Settings
    api_timeout: int = 30
    max_file_size_mb: int = 10
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

# Made with Bob
