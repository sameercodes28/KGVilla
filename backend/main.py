"""
KGVilla Backend API
"""
import os
import sys
import logging

# Add current directory to path to ensure local imports work in all environments
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore
from ai_service import analyze_image_with_gemini, chat_with_gemini, _vertex_available
from models import CostItem, Project, ChatResponse, Scenario
from pydantic import BaseModel

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="KGVilla API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://sameercodes28.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Firestore Init
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

# Models for Request Body
class ChatRequest(BaseModel):
    message: str
    currentItems: List[CostItem]

# Routes
@app.get("/")
def read_root():
    status = {
        "status": "active",
        "service": "KGVilla Backend",
        "checks": {
            "firestore": "connected" if _firestore_available else "disconnected",
            "vertex_ai": "connected" if _vertex_available else "disconnected (check credentials)"
        }
    }
    return status

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/projects", response_model=List[Project])
def list_projects():
    if not _firestore_available or not db:
        return []
    try:
        docs = db.collection("projects").stream()
        return [Project(**doc.to_dict()) for doc in docs]
    except Exception as e:
        logger.error(f"List projects failed: {e}")
        return []

@app.post("/projects")
def create_update_project(project: Project):
    if not _firestore_available or not db:
        return {"status": "error", "message": "Firestore unavailable"}
    try:
        db.collection("projects").document(project.id).set(project.model_dump())
        return {"status": "success", "id": project.id}
    except Exception as e:
        logger.error(f"Create project failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str):
    if not _firestore_available or not db:
        return Project(id=project_id, name="Mock Project", location="Stockholm")
    
    doc = db.collection("projects").document(project_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Project not found")
    return Project(**doc.to_dict())

@app.delete("/projects/{project_id}")
def delete_project(project_id: str):
    if not _firestore_available or not db:
        return {"status": "mock_deleted"}
    
    try:
        db.collection("projects").document(project_id).delete()
        db.collection("cost_data").document(project_id).delete()
        logger.info(f"Deleted project: {project_id}")
        return {"status": "success", "id": project_id}
    except Exception as e:
        logger.error(f"Delete failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/projects/{project_id}/items")
def save_project_items(project_id: str, items: List[CostItem]):
    if not _firestore_available or not db:
        return {"status": "mock_saved"}
    
    try:
        data = {"items": [item.model_dump() for item in items]}
        db.collection("cost_data").document(project_id).set(data)
        return {"status": "success", "count": len(items)}
    except Exception as e:
        logger.error(f"Save items failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects/{project_id}/items", response_model=List[CostItem])
def get_project_items(project_id: str):
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
async def analyze_drawing(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        logger.info(f"Analyzing file: {file.filename} ({len(contents)} bytes)")
        result = await analyze_image_with_gemini(contents, file.content_type)
        return result
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        return await chat_with_gemini(request.message, request.currentItems)
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
