import os
import secrets
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_api_key(api_key: str = Security(api_key_header)) -> str:
    """
    Validate API key from request header.
    Uses constant-time comparison to prevent timing attacks.
    """
    configured_key = os.environ.get("API_KEY")

    if not configured_key:
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="API key required"
        )

    # Use constant-time comparison to prevent timing attacks
    if secrets.compare_digest(api_key.encode('utf-8'), configured_key.encode('utf-8')):
        return api_key

    raise HTTPException(
        status_code=403,
        detail="Invalid credentials"
    )
