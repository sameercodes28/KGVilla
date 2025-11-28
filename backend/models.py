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

class QuantityBreakdownItem(BaseModel):
    """A single item contributing to a quantity total (e.g., a room)."""
    name: str                          # e.g., "WC/D1", "TVÄTT"
    value: float                       # e.g., 3.1, 7.8
    unit: str                          # e.g., "m²"
    category: Optional[str] = None     # e.g., "bathroom", "laundry"

class QuantityBreakdown(BaseModel):
    """Shows how a quantity was calculated from individual components."""
    items: List[QuantityBreakdownItem] = []
    total: float
    unit: str
    calculationMethod: Optional[str] = None  # e.g., "Sum of wet room floor areas"

class PriceSource(BaseModel):
    """
    Documents where a unit price came from for verifiability.
    All prices must be traceable to reputable Swedish sources.
    """
    sourceName: str                        # e.g., "Byggstart.se"
    sourceUrl: Optional[str] = None        # e.g., "https://www.byggstart.se/grunda-hus"
    verificationDate: str                  # e.g., "2025-11" (YYYY-MM format)
    marketRangeLow: Optional[float] = None # Market low end
    marketRangeHigh: Optional[float] = None # Market high end
    notes: Optional[str] = None            # Any additional context

class CostBreakdown(BaseModel):
    material: Optional[float] = 0
    labor: Optional[float] = 0
    formula: Optional[str] = None
    components: Optional[List[str]] = []
    source: Optional[str] = "Generic Market Rate 2025"

class PrefabDiscount(BaseModel):
    """
    Shows JB Villan efficiency advantage vs general contractor pricing.

    Efficiency Types:
    - PREFAB: Item is manufactured off-site in JB Villan's factory
    - STREAMLINED: Item benefits from faster build time (downstream effect of prefab)
    - STANDARDIZED: Item benefits from proven, standardized designs (lower risk)
    - BULK: Item benefits from volume purchasing agreements (B2B pricing)
    - VENDOR: Item benefits from long-term vendor partnerships
    - BUNDLED: Item costs are bundled into turn-key price (absorbed overhead)
    """
    efficiencyType: Literal['PREFAB', 'STREAMLINED', 'STANDARDIZED', 'BULK', 'VENDOR', 'BUNDLED'] = 'PREFAB'
    generalContractorPrice: float     # What a general contractor would charge
    jbVillanPrice: float              # JB Villan's price
    savingsAmount: float              # generalContractorPrice - jbVillanPrice
    savingsPercent: int               # Percentage saved
    reason: str                       # Short reason for the savings
    explanation: Optional[str] = None # Detailed explanation of why this efficiency applies

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

    # Quantity Breakdown (shows which rooms/components contribute to total)
    quantityBreakdown: Optional[QuantityBreakdown] = None
    
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

    # JB Villan Prefab Efficiency
    prefabDiscount: Optional[PrefabDiscount] = None  # If present, item has prefab efficiency

    # Price Source (Verifiability)
    priceSource: Optional[PriceSource] = None  # Documents where the unit price came from

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
    totalArea: Optional[float] = None
    boa: Optional[float] = None       # Living area (BOA)
    biarea: Optional[float] = None    # Secondary area (Biarea)
