"""
KGVilla Backend API
"""
import os
import sys
import logging
import traceback
import uuid
from datetime import datetime, timedelta

# Add current directory to path to ensure local imports work in all environments
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from typing import List
from fastapi import FastAPI, HTTPException, UploadFile, File, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore
from ai_service import analyze_image_with_gemini, chat_with_gemini, generate_narrative_explanation, _vertex_available
from ocr_service import analyze_floor_plan_deterministic, _documentai_available
from models import CostItem, Project, ChatResponse
from security import get_api_key
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from middleware import StructuredLoggingMiddleware

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Rate Limiter ---
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="KGVilla API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(StructuredLoggingMiddleware)

# --- Configuration ---
ALLOWED_ORIGINS_STR = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,https://sameercodes28.github.io")
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",")]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_CONTENT_TYPES = {"application/pdf", "image/png", "image/jpeg", "image/webp"}

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key", "Authorization"],
)

# --- Global Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Pass through HTTPExceptions (they are intentional)
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    error_id = str(uuid.uuid4())[:8]
    logger.error(
        f"Error {error_id}: {type(exc).__name__}: {exc}\n"
        f"Path: {request.url.path}\n"
        f"Traceback:\n{traceback.format_exc()}"
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "error_id": error_id,
            "message": "An unexpected error occurred. Please contact support."
        }
    )

# --- Firestore Init ---
_firestore_available = False
db = None
try:
    # Use explicit project ID if possible
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "kgvilla")
    db = firestore.Client(project=project_id)
    _firestore_available = True
    logger.info(f"Firestore initialized for project {project_id}")
except Exception as e:
    logger.error(f"Firestore failed: {e}")
    _firestore_available = False

# --- Models ---
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000, description="User message")
    currentItems: List[CostItem] = Field(..., max_length=500, description="Current project items")

class ExplainRequest(BaseModel):
    item: CostItem = Field(..., description="Cost item to explain")
    context: dict = Field(default={}, description="Floor plan context (room, dimensions, boa, biarea)")

# --- Routes ---
@app.get("/")
def read_root():
    status = {
        "status": "active",
        "service": "KGVilla Backend",
        "version": "1.0.0",
        "checks": {
            "firestore": "connected" if _firestore_available else "disconnected",
            "document_ai": "connected" if _documentai_available else "disconnected",
            "vertex_ai": "connected" if _vertex_available else "disconnected (fallback)"
        }
    }
    return status

# --- Health Check Cache ---
_last_health_check = None
_cached_health_response = None
HEALTH_CHECK_TTL = timedelta(seconds=30)

@app.get("/health")
async def health_check():
    global _last_health_check, _cached_health_response
    
    now = datetime.utcnow()
    if _cached_health_response and _last_health_check and (now - _last_health_check) < HEALTH_CHECK_TTL:
        return _cached_health_response

    health = {
        "status": "healthy",
        "checks": {
            "firestore": "unknown",
            "vertex_ai": "unknown"
        }
    }
    
    # Check Firestore
    try:
        if _firestore_available and db:
            # Perform actual read
            list(db.collection("projects").limit(1).stream())
            health["checks"]["firestore"] = "ok"
        else:
            health["checks"]["firestore"] = "not_configured"
    except Exception as e:
        health["status"] = "degraded"
        health["checks"]["firestore"] = f"error: {type(e).__name__}"
        logger.error(f"Health check failed (Firestore): {e}")

    # Check Vertex AI
    if _vertex_available:
        health["checks"]["vertex_ai"] = "ok"
    else:
        health["checks"]["vertex_ai"] = "not_configured"

    status_code = 200 if health["status"] == "healthy" else 503
    
    response = JSONResponse(content=health, status_code=status_code)
    
    # Update cache
    _last_health_check = now
    _cached_health_response = response
    
    return response

@app.get("/projects", response_model=List[Project])
def list_projects(api_key: str = Depends(get_api_key)):
    if not _firestore_available or not db:
        return []
    try:
        docs = db.collection("projects").stream()
        return [Project(**doc.to_dict()) for doc in docs]
    except Exception as e:
        # Global handler will catch and log this
        raise e

@app.post("/projects")
def create_update_project(project: Project, api_key: str = Depends(get_api_key)):
    if not _firestore_available or not db:
        # In dev/offline mode, we might want to return success to let frontend proceed?
        # But frontend handles offline. Let's return 503 to indicate backend storage failed.
        raise HTTPException(status_code=503, detail="Firestore unavailable")
    
    db.collection("projects").document(project.id).set(project.model_dump())
    return {"status": "success", "id": project.id}

@app.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str, api_key: str = Depends(get_api_key)):
    if not _firestore_available or not db:
        # Mock fallback for resilience
        return Project(id=project_id, name="Offline Project", location="Local")
    
    doc = db.collection("projects").document(project_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Project not found")
    return Project(**doc.to_dict())

@app.delete("/projects/{project_id}")
def delete_project(project_id: str, api_key: str = Depends(get_api_key)):
    if not _firestore_available or not db:
        return {"status": "mock_deleted"}
    
    db.collection("projects").document(project_id).delete()
    db.collection("cost_data").document(project_id).delete()
    logger.info(f"Deleted project: {project_id}")
    return {"status": "success", "id": project_id}

@app.post("/projects/{project_id}/items")
def save_project_items(project_id: str, items: List[CostItem], api_key: str = Depends(get_api_key)):
    if not _firestore_available or not db:
        return {"status": "mock_saved"}
    
    data = {"items": [item.model_dump() for item in items]}
    db.collection("cost_data").document(project_id).set(data)
    return {"status": "success", "count": len(items)}

@app.get("/projects/{project_id}/items", response_model=List[CostItem])
def get_project_items(project_id: str, api_key: str = Depends(get_api_key)):
    if not _firestore_available or not db:
        return []
    
    try:
        doc = db.collection("cost_data").document(project_id).get()
        if not doc.exists:
            return []
        data = doc.to_dict()
        return [CostItem(**item) for item in data.get("items", [])]
    except Exception as e:
        logger.error(f"Get items failed: {e}")
        return []

@app.post("/analyze")
@limiter.limit("20/minute")
async def analyze_drawing(request: Request, file: UploadFile = File(...), api_key: str = Depends(get_api_key)):
    # 1. Validate Content Type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )

    # 2. Read content
    contents = await file.read()
    
    # 3. Validate Size
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(contents)} bytes). Max size: 10MB"
        )

    logger.info(f"Analyzing file: {file.filename} ({len(contents)} bytes)")

    # 4. Process - Use Document AI (deterministic) if available, else Gemini (fallback)
    if _documentai_available:
        logger.info("Using Document AI OCR for deterministic analysis")
        result = await analyze_floor_plan_deterministic(contents, file.content_type)
    else:
        logger.info("Document AI not available, falling back to Gemini")
        result = await analyze_image_with_gemini(contents, file.content_type)

    return result

@app.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat_endpoint(request: Request, body: ChatRequest, api_key: str = Depends(get_api_key)):
    return await chat_with_gemini(body.message, body.currentItems)

@app.post("/explain")
@limiter.limit("30/minute")
async def explain_cost_item(request: Request, body: ExplainRequest, api_key: str = Depends(get_api_key)):
    """
    Generate a detailed narrative explanation for a cost item.
    Returns flowing prose covering WHY, HOW, WHAT, and REGULATIONS.
    """
    logger.info(f"Generating explanation for: {body.item.elementName}")
    return await generate_narrative_explanation(body.item, body.context)
