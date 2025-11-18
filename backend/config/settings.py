"""
Configuration settings for the AI agent system.
Loads API keys from environment variables.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings"""
    
    EXA_API_KEY = os.getenv("EXA_API_KEY")
    CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
    
    # Model settings
    AI_MODEL = "gpt-oss-120b"
    MAX_TOKENS = 1000
    TEMPERATURE = 0.2
    
    # Search settings
    DEFAULT_SEARCH_RESULTS = 10
    MAX_CHARACTERS_PER_RESULT = 1000
    
    @classmethod
    def validate(cls):
        """Validate that all required settings are present"""
        if not cls.EXA_API_KEY:
            raise ValueError("EXA_API_KEY not found in environment variables")
        if not cls.CEREBRAS_API_KEY:
            raise ValueError("CEREBRAS_API_KEY not found in environment variables")

# Validate settings on import
Settings.validate()