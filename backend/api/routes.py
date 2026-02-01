"""
FastAPI routes for the research agent API.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from api.models import ResearchRequest, ResearchResponse, HealthResponse
from agents.lead_agent import LeadAgent
from api.dependencies import get_lead_agent, get_search_service, get_ai_service
from utils.activity import activity_manager
from utils.auth import verify_api_key
from middleware.rate_limit import rate_limiter
from typing import Optional
import asyncio
import json

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check(
    search_service=Depends(get_search_service), ai_service=Depends(get_ai_service)
):
    """
    Health check endpoint to verify all services are running.
    """
    return HealthResponse(
        status="healthy",
        message="All services operational",
        services={"search_service": "operational", "ai_service": "operational"},
    )


@router.post("/research", response_model=ResearchResponse, tags=["Research"])
async def research(
    request: ResearchRequest,
    lead_agent: LeadAgent = Depends(get_lead_agent),
    _: bool = Depends(verify_api_key),
):
    """
    Perform multi-agent research on a given query.

    - **query**: The research question or topic (3-500 characters)
    - **num_results_per_agent**: Number of search results per subagent (1-5)

    Returns comprehensive research findings synthesized by multiple specialized agents.
    """
    try:
        # Create session and perform research using the lead agent
        session_id = activity_manager.create_session(request.query)
        result = lead_agent.research(
            request.query,
            num_results_per_agent=request.num_results_per_agent or 2,
            silent=True,
            session_id=session_id,
            model=request.model,
        )

        return ResearchResponse(
            query=result["query"],
            subagents=result["subagents"],
            total_sources=result["total_sources"],
            synthesis=result["synthesis"],
            session_id=session_id,
            subagent_results=result.get("subagent_results"),
            complexity_analysis=result.get("complexity_analysis"),
            model=result.get("model"),
        )

    except Exception as e:
        # Log the actual error for debugging
        import logging

        logger = logging.getLogger(__name__)
        logger.error(f"Research failed: {str(e)}", exc_info=True)

        # Return generic error to client (don't expose internal details)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Research operation failed. Please try again later.",
        )


@router.get("/activity", tags=["Activity"])
async def activity(session_id: Optional[str] = None):
    """
    Get current activity status and recent events.
    """
    try:
        return activity_manager.snapshot(session_id)
    except Exception as e:
        import logging

        logger = logging.getLogger(__name__)
        logger.error(f"Failed to fetch activity: {str(e)}", exc_info=True)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch activity status. Please try again later.",
        )


@router.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "message": "AI Research Agent API",
        "version": "1.0.0",
        "endpoints": {"health": "/health", "research": "/research", "docs": "/docs"},
    }


@router.get("/activity/stream/{session_id}", tags=["Activity"])
async def activity_stream(session_id: str):
    """SSE stream of activity events for a given session."""

    async def event_generator():
        last_event_count = 0
        while True:
            snap = activity_manager.snapshot(session_id)
            events = snap.get("events", [])
            if len(events) > last_event_count:
                for evt in events[last_event_count:]:
                    payload = json.dumps(evt)
                    yield f"data: {payload}\n\n"
                last_event_count = len(events)
            await asyncio.sleep(0.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/rate-limit", tags=["Rate Limit"])
async def rate_limit_status(request: Request):
    """
    Get current rate limit status for the client.
    """
    # Get client IP
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    else:
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            client_ip = real_ip
        elif request.client:
            client_ip = request.client.host
        else:
            client_ip = "unknown"

    allowed, remaining, reset_time = rate_limiter.check(client_ip)

    return {
        "limit": 10,
        "remaining": remaining if allowed else 0,
        "reset_seconds": reset_time,
        "window_hours": 1,
    }


@router.get("/models", tags=["Models"])
async def get_models():
    """
    Get list of available AI models.
    """
    from api.models import ModelInfo, ModelsResponse
    from config.settings import Settings

    models = []
    for model_id, model_info in Settings.AVAILABLE_MODELS.items():
        models.append(
            ModelInfo(
                id=model_id,
                name=model_info["name"],
                description=model_info["description"],
                provider=model_info["provider"],
                max_tokens=model_info["max_tokens"],
            )
        )

    return ModelsResponse(models=models, default_model=Settings.AI_MODEL)
