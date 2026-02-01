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
    AI_MODEL = os.getenv("AI_MODEL", "llama-4-scout-17b-16e-instruct")
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", "1000"))
    TEMPERATURE = float(os.getenv("TEMPERATURE", "0.2"))
    
    # Available AI models
    AVAILABLE_MODELS = {
        "llama-4-scout-17b-16e-instruct": {
            "name": "Llama 4 Scout 17B",
            "description": "Fast and efficient model for research tasks",
            "provider": "Cerebras",
            "max_tokens": 8192,
        },
        "llama3.1-8b": {
            "name": "Llama 3.1 8B",
            "description": "Balanced performance and speed",
            "provider": "Cerebras",
            "max_tokens": 8192,
        },
        "llama3.1-70b": {
            "name": "Llama 3.1 70B",
            "description": "High-quality responses with deeper reasoning",
            "provider": "Cerebras",
            "max_tokens": 8192,
        },
    }
    
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