import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

logger = logging.getLogger("api")

class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        # Add request ID to request state for access in endpoints
        request.state.request_id = request_id
        
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        
        log_data = {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "process_time_ms": round(process_time, 2),
            "client_ip": request.client.host if request.client else None
        }
        
        # Log level based on status
        if response.status_code >= 500:
            logger.error(str(log_data))
        elif response.status_code >= 400:
            logger.warning(str(log_data))
        else:
            logger.info(str(log_data))
            
        # Add Request-ID header to response
        response.headers["X-Request-ID"] = request_id
        
        return response
