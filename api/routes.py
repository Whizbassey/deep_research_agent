"""
FastAPI routes for the research agent API.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from api.models import ResearchRequest, ResearchResponse, HealthResponse
from agents.lead_agent import LeadAgent
from api.dependencies import get_lead_agent, get_search_service, get_ai_service

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check(
    search_service = Depends(get_search_service),
    ai_service = Depends(get_ai_service)
):
    """
    Health check endpoint to verify all services are running.
    """
    return HealthResponse(
        status="healthy",
        message="All services operational",
        services={
            "search_service": "operational",
            "ai_service": "operational"
        }
    )

@router.post("/research", response_model=ResearchResponse, tags=["Research"])
async def research(
    request: ResearchRequest,
    lead_agent: LeadAgent = Depends(get_lead_agent)
):
    """
    Perform multi-agent research on a given query.
    
    - **query**: The research question or topic (3-500 characters)
    - **num_results_per_agent**: Number of search results per subagent (1-5)
    
    Returns comprehensive research findings synthesized by multiple specialized agents.
    """
    try:
        # Perform research using the lead agent
        result = lead_agent.research(request.query)
        
        return ResearchResponse(
            query=result["query"],
            subagents=result["subagents"],
            total_sources=result["total_sources"],
            synthesis=result["synthesis"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Research failed: {str(e)}"
        )

@router.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "message": "AI Research Agent API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "research": "/research",
            "docs": "/docs"
        }
    }