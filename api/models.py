"""
Pydantic models for API request and response validation.
"""
from pydantic import BaseModel, Field
from typing import List, Optional

class ResearchRequest(BaseModel):
    """Request model for research endpoint"""
    query: str = Field(..., min_length=3, max_length=500, description="Research query")
    num_results_per_agent: Optional[int] = Field(2, ge=1, le=5, description="Results per subagent")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "Best Agentic AI Framework",
                "num_results_per_agent": 2
            }
        }

class Source(BaseModel):
    """Source information"""
    title: str
    content: str

class SubagentResult(BaseModel):
    """Result from a single subagent"""
    subtask: int
    search_focus: str
    sources: List[Source]

class ResearchResponse(BaseModel):
    """Response model for research endpoint"""
    query: str
    subagents: int
    total_sources: int
    synthesis: str
    subagent_results: Optional[List[SubagentResult]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "Best Agentic AI Framework",
                "subagents": 3,
                "total_sources": 6,
                "synthesis": "Executive Summary: ...",
                "subagent_results": []
            }
        }

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    message: str
    services: dict