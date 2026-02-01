"""
Authentication utilities for the API.
"""

import os
from fastapi import HTTPException, status, Header
from typing import Optional


def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """
    Verify the API key from the X-API-Key header.
    """
    # Skip auth in development for ease of use
    if os.getenv("ENVIRONMENT") == "development":
        return True

    expected_key = os.getenv("API_SECRET")

    # If no API_SECRET is set, skip authentication (for initial setup)
    if not expected_key:
        return True

    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required. Provide it in the X-API-Key header.",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    if x_api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    return True
