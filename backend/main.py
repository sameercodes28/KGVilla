from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from ai_service import analyze_image_with_gemini

app = FastAPI(title="KGVilla API", version="0.1.0")

# Allow CORS (so your frontend can talk to this backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models (Matching Frontend) ---

class BoQItem(BaseModel):
    id: str
    projectId: str
    phase: str
    elementName: str
    description: str
    quantity: float
    unit: str
    unitPrice: float
    totalCost: float
    confidenceScore: float = 1.0
    calculationLogic: Optional[str] = None

class Project(BaseModel):
    id: str
    name: str
    location: str

# --- Routes ---

@app.get("/")
def read_root():
    return {"status": "active", "service": "KGVilla Backend"}

@app.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str):
    # TODO: Fetch from Firestore
    return {
        "id": project_id, 
        "name": "Mock Project from Backend", 
        "location": "Stockholm"
    }

@app.post("/analyze")
async def analyze_drawing(file: UploadFile = File(...)):
    """
    Receives a floor plan (PDF/Image), analyzes it with Gemini 1.5 Pro,
    and returns a breakdown of costs and quantities.
    """
    try:
        contents = await file.read()
        result = await analyze_image_with_gemini(contents, file.content_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
