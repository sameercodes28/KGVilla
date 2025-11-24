import os
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_api_key(api_key: str = Security(api_key_header)):
    # In production, this should be a list or loaded from a secret manager
    # For this architecture, we load from env var
    configured_key = os.environ.get("API_KEY")

    if not configured_key:
        # Security: Fail securely if API_KEY is not configured in environment
        raise HTTPException(
            status_code=500,
            detail="Server misconfiguration: API_KEY not set"
        )

    # Check if API key was provided (auto_error=False means it could be None)
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="API key required"
        )

    if api_key == configured_key:
        return api_key

    raise HTTPException(
        status_code=403,
        detail="Could not validate credentials"
    )
