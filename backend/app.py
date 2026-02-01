"""
FastAPI application entry point.
Run with: uvicorn app:app --reload
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from config.settings import Settings
from middleware.rate_limit import RateLimitMiddleware

# Create FastAPI app
app = FastAPI(
    title="AI Research Agent API",
    description="Multi-agent research system powered by Exa and Cerebras with dynamic agent allocation",
    version="2.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None,
)

# Get allowed origins from environment or use defaults
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Support multiple origins via comma-separated list
additional_origins = os.getenv("ADDITIONAL_CORS_ORIGINS", "")
allowed_origins = [
    frontend_url,
    "http://localhost:3000",  # Next.js default
    "http://localhost:5173",  # Vite default
    "http://localhost:8080",  # Alternative port
]

# Add any additional origins from environment
if additional_origins:
    allowed_origins.extend(
        [origin.strip() for origin in additional_origins.split(",") if origin.strip()]
    )

# Remove duplicates while preserving order
allowed_origins = list(dict.fromkeys(allowed_origins))

# Configure CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Enable rate limiting in production
if os.getenv("ENVIRONMENT") == "production":
    max_requests = int(os.getenv("RATE_LIMIT_REQUESTS", "10"))
    window_hours = int(os.getenv("RATE_LIMIT_WINDOW_HOURS", "1"))
    app.add_middleware(
        RateLimitMiddleware, max_requests=max_requests, window_hours=window_hours
    )

# Include API routes
app.include_router(router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    is_production = os.getenv("ENVIRONMENT") == "production"
    print("🚀 AI Research Agent API starting...")
    print(f"🔧 Environment: {'Production' if is_production else 'Development'}")
    if not is_production:
        print("📚 API Documentation: http://localhost:8000/docs")
        print("🔍 Alternative Docs: http://localhost:8000/redoc")
    print("✅ Server ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    print("👋 Shutting down AI Research Agent API...")


if __name__ == "__main__":
    import uvicorn

    is_development = os.getenv("ENVIRONMENT") != "production"

    # Use PORT from environment (Render provides this) or default to 8000 for local dev
    port = int(os.getenv("PORT", "8000"))

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=is_development,  # Only auto-reload in development
        log_level="info" if is_development else "warning",
        access_log=is_development,
    )
