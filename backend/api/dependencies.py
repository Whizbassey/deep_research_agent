"""
FastAPI dependencies for dependency injection.
Ensures single instances of services are shared across requests.
"""
from functools import lru_cache
from services.search_service import SearchService
from services.ai_service import AIService
from agents.sub_agent import SubAgent
from agents.lead_agent import LeadAgent

# Cache these so they're created once and reused
@lru_cache()
def get_search_service() -> SearchService:
    """Get singleton SearchService instance"""
    return SearchService()

@lru_cache()
def get_ai_service() -> AIService:
    """Get singleton AIService instance"""
    return AIService()

@lru_cache()
def get_sub_agent() -> SubAgent:
    """Get singleton SubAgent instance"""
    search_service = get_search_service()
    return SubAgent(search_service)

@lru_cache()
def get_lead_agent() -> LeadAgent:
    """Get singleton LeadAgent instance"""
    ai_service = get_ai_service()
    sub_agent = get_sub_agent()
    return LeadAgent(ai_service, sub_agent)