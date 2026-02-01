"""
Rate limiting middleware for API protection.
Simple in-memory rate limiter: 10 requests per hour per IP.
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
from typing import Dict, Tuple
import time


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware - 10 requests per hour per IP address.
    Uses in-memory storage (sufficient for single-instance demo).
    """

    def __init__(self, app, max_requests: int = 10, window_hours: int = 1):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_hours * 3600
        # Store: {ip_address: [(timestamp1, count), (timestamp2, count), ...]}
        self.request_logs: Dict[str, list] = {}

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks and static files
        path = request.url.path
        if path in ["/health", "/", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)

        # Get client IP
        client_ip = self._get_client_ip(request)

        # Check rate limit
        allowed, remaining, reset_time = self._check_rate_limit(client_ip)

        if not allowed:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again in {reset_time} seconds. Limit: {self.max_requests} requests per hour.",
            )

        # Process request
        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(time.time()) + reset_time)

        return response

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request headers"""
        # Check for forwarded IP (behind proxy)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fallback to direct connection
        if request.client:
            return request.client.host

        return "unknown"

    def _check_rate_limit(self, client_ip: str) -> Tuple[bool, int, int]:
        """
        Check if request is allowed under rate limit.

        Returns:
            Tuple of (allowed: bool, remaining: int, reset_time: int)
        """
        now = time.time()
        window_start = now - self.window_seconds

        # Get or create request log for this IP
        if client_ip not in self.request_logs:
            self.request_logs[client_ip] = []

        # Filter to only requests in current window
        self.request_logs[client_ip] = [
            ts for ts in self.request_logs[client_ip] if ts > window_start
        ]

        # Count current requests
        current_count = len(self.request_logs[client_ip])

        # Check if under limit
        if current_count >= self.max_requests:
            # Calculate time until oldest request expires
            if self.request_logs[client_ip]:
                oldest_request = min(self.request_logs[client_ip])
                reset_time = int(oldest_request + self.window_seconds - now) + 1
            else:
                reset_time = self.window_seconds
            return False, 0, reset_time

        # Log this request
        self.request_logs[client_ip].append(now)

        # Calculate remaining requests and reset time
        remaining = self.max_requests - current_count - 1
        reset_time = self.window_seconds

        if self.request_logs[client_ip]:
            oldest_request = min(self.request_logs[client_ip])
            reset_time = int(oldest_request + self.window_seconds - now) + 1

        return True, remaining, reset_time


# Simple rate limit checker for manual use
class RateLimiter:
    """Standalone rate limiter for use in endpoints"""

    def __init__(self, max_requests: int = 10, window_hours: int = 1):
        self.max_requests = max_requests
        self.window_seconds = window_hours * 3600
        self.request_logs: Dict[str, list] = {}

    def check(self, client_ip: str) -> Tuple[bool, int, int]:
        """Check rate limit for an IP"""
        now = time.time()
        window_start = now - self.window_seconds

        if client_ip not in self.request_logs:
            self.request_logs[client_ip] = []

        self.request_logs[client_ip] = [
            ts for ts in self.request_logs[client_ip] if ts > window_start
        ]

        current_count = len(self.request_logs[client_ip])

        if current_count >= self.max_requests:
            if self.request_logs[client_ip]:
                oldest_request = min(self.request_logs[client_ip])
                reset_time = int(oldest_request + self.window_seconds - now) + 1
            else:
                reset_time = self.window_seconds
            return False, 0, reset_time

        self.request_logs[client_ip].append(now)
        remaining = self.max_requests - current_count - 1

        if self.request_logs[client_ip]:
            oldest_request = min(self.request_logs[client_ip])
            reset_time = int(oldest_request + self.window_seconds - now) + 1
        else:
            reset_time = self.window_seconds

        return True, remaining, reset_time


# Global rate limiter instance
rate_limiter = RateLimiter(max_requests=10, window_hours=1)
