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
from pydantic import BaseModel
from typing import List, Optional
import os
from ai_service import analyze_image_with_gemini

# Initialize the FastAPI app
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

# --- Data Models (Pydantic) ---
# These classes define the structure of the data we expect to send/receive.
# They match the TypeScript interfaces in the Frontend (`src/types/index.ts`).

class BoQItem(BaseModel):
    """
    Represents a single line item in the Bill of Quantities (BoQ).
    Example: "15m2 of Parquet Flooring"
    """
    id: str
    projectId: str
    phase: str  # e.g., "ground", "structure", "interior"
    elementName: str  # e.g., "Ekparkett 3-stav"
    description: str
    quantity: float
    unit: str  # e.g., "m2", "st"
    unitPrice: float  # Estimated cost per unit in SEK
    totalCost: float
    confidenceScore: float = 1.0  # How confident the AI is (0.0 - 1.0)
    calculationLogic: Optional[str] = None  # Explanation of how this was calculated

class Project(BaseModel):
    """
    Basic metadata for a construction project.
    """
    id: str
    name: str
    location: str

# --- API Routes ---

@app.get("/")
def read_root():
    """
    Health Check Endpoint.
    Used by Cloud Run to verify the container is alive and ready to serve traffic.
    """
    return {"status": "active", "service": "KGVilla Backend"}

@app.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str):
    """
    Fetch project details by ID.
    (Currently a mock stub, will connect to Firestore in the future)
    """
    # TODO: Fetch real data from Google Cloud Firestore
    return {
        "id": project_id, 
        "name": "Mock Project from Backend", 
        "location": "Stockholm"
    }

@app.post("/analyze")
async def analyze_drawing(file: UploadFile = File(...)):
    """
    AI Analysis Endpoint.
    
    Process:
    1.  Receives a floor plan file (PDF or Image) from the frontend.
    2.  Reads the file into memory.
    3.  Passes it to `ai_service.analyze_image_with_gemini` for processing.
    4.  Returns a structured JSON list of `BoQItem` objects.
    
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