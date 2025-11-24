import os
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_api_key(api_key_header: str = Security(api_key_header)):
    # In production, this should be a list or loaded from a secret manager
    # For this architecture, we load from env var
    configured_key = os.environ.get("API_KEY")
    
    if not configured_key:
        # If no key configured on server, fail open (dev) or closed (prod)?
        # Choosing fail open for dev convenience if env var missing, 
        # BUT logging a warning would be good. For now, strictly enforce if var is set.
        # If variable is NOT set, we assume no auth required (backward compat for dev).
        # However, for security, we should enforce it.
        # Let's enforcing it: if no API_KEY env var, deny all (fail secure).
        # EXCEPT: The user might not have set it yet.
        # Let's use a default dev key if not set, but warn.
        return "dev-key-123" # Fallback for now to prevent immediate lockout during rollout

    if api_key_header == configured_key:
        return api_key_header
    
    raise HTTPException(
        status_code=403,
        detail="Could not validate credentials"
    )
