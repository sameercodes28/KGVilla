from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

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
def analyze_drawing(project_id: str):
    # TODO: Receive file, send to Vertex AI, return BoQItems
    return {"message": "AI Analysis stub - Implementation coming in Phase 2"}
