from pydantic import BaseModel
from typing import List, Optional, Union, Literal

# --- Data Models (Matching Frontend strictly) ---

class ValidationData(BaseModel):
    type: Literal['area', 'line', 'point']
    count: Optional[int] = None
    coordinates: List[List[float]]  # [[x, y], [x, y]]

class Option(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    priceModifier: float

class CostBreakdown(BaseModel):
    material: Optional[float] = 0
    labor: Optional[float] = 0
    formula: Optional[str] = None
    components: Optional[List[str]] = []
    source: Optional[str] = "Generic Market Rate 2025"

class CostItem(BaseModel):
    """
    Represents a single line item in the Project Cost Breakdown.
    Must strictly match src/types/index.ts interface.
    """
    id: str
    projectId: Optional[str] = None  # Assigned when added to project
    levelId: Optional[str] = None
    phase: Literal['ground', 'structure', 'electrical', 'plumbing', 'interior', 'completion', 'admin']
    elementName: str
    description: str
    quantity: float
    unit: str # 'm', 'm2', 'st', etc.
    unitPrice: float
    totalCost: float
    wastePercentage: Optional[float] = None
    totalQuantity: Optional[float] = None
    confidenceScore: float = 1.0
    
    # Metadata
    sourceDrawingId: Optional[str] = None
    assemblyId: Optional[str] = None
    calculationLogic: Optional[str] = None
    guidelineReference: Optional[str] = None
    
    # Detailed Cost Breakdown (Explainability)
    breakdown: Optional[CostBreakdown] = None
    
    # Interactive Data
    options: Optional[List[Option]] = None
    selectedOptionId: Optional[str] = None
    validationData: Optional[ValidationData] = None
    
    # Context
    roomId: Optional[str] = None
    system: Optional[Literal['structure', 'el', 'vvs', 'interior']] = None
    
    # User Overrides
    customUnitPrice: Optional[float] = None
    customQuantity: Optional[float] = None
    isUserAdded: Optional[bool] = False
    userNotes: Optional[str] = None

class Scenario(BaseModel):
    title: str
    description: str
    costDelta: float # e.g. -50000
    items: List[CostItem] # The proposed items to add/replace

class ChatResponse(BaseModel):
    text: str
    scenario: Optional[Scenario] = None

class Project(BaseModel):
    id: str
    name: str
    location: str
    floorPlanUrl: Optional[str] = None
