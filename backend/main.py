"""
KGVilla Backend API
===================

This is the entry point for the backend server. It is built with **FastAPI**, a modern,
high-performance web framework for building APIs with Python.

Key Responsibilities:
1.  **Serve API Endpoints:** Handle HTTP requests from the frontend.
2.  **Data Validation:** Use Pydantic models to ensure data integrity.
3.  **AI Orchestration:** Route file uploads to the `ai_service` for processing.

Technical Decision:
We chose FastAPI because it natively supports asynchronous programming (needed for AI calls),
automatically generates documentation (Swagger UI), and is strictly typed (Pydantic), reducing bugs.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
from google.cloud import firestore
from ai_service import analyze_image_with_gemini, chat_with_gemini
from models import CostItem, Project, ChatResponse

# ... (existing imports)

class ChatRequest(BaseModel):
    message: str
    currentItems: List[CostItem]

# ... (existing routes)

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Conversational AI Endpoint.
    Allows the user to ask "What if" questions about the current estimate.
    Returns text answer + optional 'Scenario' proposal (data change).
    """
    try:
        return await chat_with_gemini(request.message, request.currentItems)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
app = FastAPI(title="KGVilla API", version="0.1.0")

# --- CORS Configuration ---
# Cross-Origin Resource Sharing (CORS) is a security feature in browsers.
# Since our Frontend (GitHub Pages) and Backend (Cloud Run) are on different domains,
# we must explicitly allow the Frontend to talk to the Backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace "*" with the specific GitHub Pages URL for security.
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers (Authentication, etc.)
)

from google.cloud import firestore
from google.api_core.exceptions import NotFound

# ... (existing imports)

# Initialize Firestore
# Defensive init for build environment
try:
    db = firestore.Client(project=os.environ.get("GOOGLE_CLOUD_PROJECT", "kgvilla"))
    _firestore_available = True
except Exception as e:
    print(f"WARNING: Firestore client failed to initialize: {e}")
    _firestore_available = False

# ... (existing CORS and Models)

# --- API Routes ---

@app.get("/projects", response_model=List[Project])
def list_projects():
    """List all projects from Firestore."""
    if not _firestore_available:
        return []
    
    docs = db.collection("projects").stream()
    return [Project(**doc.to_dict()) for doc in docs]

@app.post("/projects")
def create_update_project(project: Project):
    """Create or Update project metadata."""
    if not _firestore_available:
        return {"status": "error", "message": "Firestore unavailable"}
    
    db.collection("projects").document(project.id).set(project.model_dump())
    return {"status": "success", "id": project.id}

@app.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str):
    """Fetch project metadata."""
    if not _firestore_available:
        # Fallback for testing
        return Project(id=project_id, name="Mock Project", location="Stockholm")

    doc = db.collection("projects").document(project_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Project not found")
    return Project(**doc.to_dict())

@app.post("/projects/{project_id}/items")
def save_project_items(project_id: str, items: List[CostItem]):
    """Save the full list of cost items for a project."""
    if not _firestore_available:
        return {"status": "mock_saved"}
        
    # Store items as a JSON blob in a separate collection 'cost_data' to keep 'projects' light
    # Or just a field. Let's use a separate doc in 'cost_data' collection keyed by project_id
    data = {"items": [item.model_dump() for item in items]}
    db.collection("cost_data").document(project_id).set(data)
    return {"status": "success", "count": len(items)}

@app.get("/projects/{project_id}/items", response_model=List[CostItem])
def get_project_items(project_id: str):
    """Load cost items."""
    if not _firestore_available:
        return []
        
    doc = db.collection("cost_data").document(project_id).get()
    if not doc.exists:
        return []
    
    data = doc.to_dict()
    return [CostItem(**item) for item in data.get("items", [])]

# ... (analyze endpoint)

@app.post("/analyze")

async def analyze_drawing(file: UploadFile = File(...)):

    """

    AI Analysis Endpoint.

    

    Process:

    1.  Receives a floor plan file (PDF or Image) from the frontend.

    2.  Reads the file into memory.

    3.  Passes it to `ai_service.analyze_image_with_gemini` for processing.

    4.  Returns a structured JSON list of `CostItem` objects.

    

    Error Handling:

    Catches any errors from the AI service and returns a 500 Internal Server Error.

    """

    try:

        # Read the raw bytes of the uploaded file

        contents = await file.read()

        

        # Call the AI service to process the image

        result = await analyze_image_with_gemini(contents, file.content_type)

        

        return result

    except Exception as e:

        # If anything goes wrong, return a clear error message to the client

        raise HTTPException(status_code=500, detail=str(e))



class ChatRequest(BaseModel):

    message: str

    currentItems: List[CostItem]



@app.post("/chat", response_model=ChatResponse)

async def chat_endpoint(request: ChatRequest):

    """

    Conversational AI Endpoint.

    Allows the user to ask "What if" questions about the current estimate.

    Returns text answer + optional 'Scenario' proposal (data change).

    """

    try:

        return await chat_with_gemini(request.message, request.currentItems)

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))
