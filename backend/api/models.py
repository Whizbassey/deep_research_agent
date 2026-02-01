"""
Pydantic models for API request and response validation.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional


class ResearchRequest(BaseModel):
    """Request model for research endpoint"""

    query: str = Field(..., min_length=3, max_length=500, description="Research query")
    num_results_per_agent: Optional[int] = Field(
        2, ge=1, le=5, description="Results per subagent"
    )
    model: Optional[str] = Field(
        "gpt-oss-120b", description="AI model to use for research"
    )

    @validator("model")
    def validate_model(cls, v):
        """Validate that the model is in the allowed list."""
        from config.settings import Settings

        allowed_models = list(Settings.AVAILABLE_MODELS.keys())
        if v not in allowed_models:
            raise ValueError(
                f"Invalid model '{v}'. Allowed models: {', '.join(allowed_models)}"
            )
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "query": "Best Agentic AI Framework",
                "num_results_per_agent": 2,
                "model": "gpt-oss-120b",
            }
        }


class Source(BaseModel):
    """Source information"""

    title: str
    content: str
    url: Optional[str] = None


class SubagentResult(BaseModel):
    """Result from a single subagent"""

    subtask: int
    search_focus: str
    sources: List[Source]


class ComplexityAnalysis(BaseModel):
    """Query complexity analysis results"""

    complexity_score: int = Field(..., ge=1, le=5, description="Complexity score 1-5")
    num_subagents: int = Field(
        ..., ge=2, le=6, description="Number of subagents allocated"
    )
    explanation: str = Field(..., description="Explanation for allocation decision")
    estimated_sources: int = Field(..., description="Estimated sources needed")


class ResearchResponse(BaseModel):
    """Response model for research endpoint"""

    query: str
    subagents: int
    total_sources: int
    synthesis: str
    session_id: Optional[str] = None
    subagent_results: Optional[List[SubagentResult]] = None
    complexity_analysis: Optional[ComplexityAnalysis] = None
    model: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "query": "Best Agentic AI Framework",
                "subagents": 4,
                "total_sources": 12,
                "synthesis": "Executive Summary: ...",
                "subagent_results": [],
                "complexity_analysis": {
                    "complexity_score": 3,
                    "num_subagents": 4,
                    "explanation": "Multiple frameworks comparison required",
                    "estimated_sources": 16,
                },
                "model": "gpt-oss-120b",
            }
        }


class ModelInfo(BaseModel):
    """Model information"""

    id: str
    name: str
    description: str
    provider: str
    max_tokens: int


class ModelsResponse(BaseModel):
    """Response model for available models"""

    models: List[ModelInfo]
    default_model: str


class HealthResponse(BaseModel):
    """Health check response"""

    status: str
    message: str
    services: dict
