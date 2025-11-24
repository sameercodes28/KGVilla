"""
OCR Service Module
==================
Deterministic floor plan analysis using Google Document AI.
Extracts room data and calculates pricing from printed annotations.
"""
import os
import re
import logging
from typing import List, Dict, Tuple
from models import CostItem

logger = logging.getLogger(__name__)

# Environment
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "kgvilla")
LOCATION = os.environ.get("DOCUMENTAI_LOCATION", "eu")  # Document AI location (EU for GDPR)

# --- Document AI Setup ---
_documentai_available = False
_processor_id = None

try:
    from google.cloud import documentai_v1 as documentai
    _documentai_available = True
    # Processor ID should be set in environment or created via Console
    _processor_id = os.environ.get("DOCUMENTAI_PROCESSOR_ID")
except ImportError as e:
    logger.warning(f"Document AI not available: {e}")

# --- Room Classification ---
ROOM_CATEGORIES = {
    "bedroom": ["SOVRUM", "MASTER"],
    "living": ["VARDAGSRUM", "ALLRUM", "RUM"],
    "kitchen": ["KÖK"],
    "bathroom": ["WC", "BAD", "DUSCH"],
    "laundry": ["TVÄTT", "TVÄTTSTUGA"],
    "entry": ["ENTRÉ", "HALL", "ENTRE"],
    "storage": ["FÖRRÅD", "KLK", "KLÄDKAMMARE", "GARDEROB"],
    "garage": ["GARAGE", "CARPORT"],
    "utility": ["TEKNIK", "PANNRUM"],
}

# --- Pricing Database (from SWEDISH_CONSTRUCTION_KNOWLEDGE_BASE.md) ---
# All prices in SEK, include materials + labor + 12% ABT06 risk premium
PRICING = {
    # Per m² rates by room type
    "flooring": {
        "bedroom": 850,      # Parquet
        "living": 850,       # Parquet
        "kitchen": 1600,     # Tile
        "bathroom": 1600,    # Tile
        "laundry": 1600,     # Tile
        "entry": 1600,       # Tile
        "storage": 450,      # Basic
        "garage": 350,       # Concrete/Epoxy
        "utility": 450,      # Basic
    },
    "walls": {
        "standard": 1450,    # Interior wall per m²
        "wet_room": 4200,    # Wet room wall (Säker Vatten compliant)
    },
    "ceiling": {
        "standard": 350,     # Paint
        "wet_room": 450,     # Moisture resistant
    },
    # Fixed costs
    "foundation_per_m2": 3500,
    "roof_per_m2": 2200,
    "exterior_wall_per_m2": 3800,

    # Per-unit costs
    "wc_unit": 14000,
    "washbasin_unit": 6000,
    "shower_unit": 8000,
    "floor_drain": 6500,
    "kitchen_base": 85000,   # Base kitchen installation

    # Electrical per point
    "socket": 1400,
    "spotlight": 1600,

    # Mandatory costs
    "climate_declaration": 20000,
    "ka_fee": 35000,         # Kontrollansvarig
    "bygglov": 40000,        # Building permit
    "project_mgmt": 60000,
}


def classify_room(room_name: str) -> str:
    """Classify room by Swedish name into pricing category."""
    room_upper = room_name.upper()
    for category, keywords in ROOM_CATEGORIES.items():
        for keyword in keywords:
            if keyword in room_upper:
                return category
    return "storage"  # Default


def extract_text_with_documentai(image_bytes: bytes, mime_type: str) -> str:
    """Extract all text from image using Document AI OCR."""
    if not _documentai_available:
        logger.error("Document AI not available")
        return ""

    if not _processor_id:
        logger.error("DOCUMENTAI_PROCESSOR_ID not configured")
        return ""

    try:
        # Set regional endpoint based on LOCATION
        client_options = {"api_endpoint": f"{LOCATION}-documentai.googleapis.com"}
        client = documentai.DocumentProcessorServiceClient(client_options=client_options)

        # Construct processor name
        name = f"projects/{PROJECT_ID}/locations/{LOCATION}/processors/{_processor_id}"

        # Create raw document
        raw_document = documentai.RawDocument(
            content=image_bytes,
            mime_type=mime_type
        )

        # Process
        request = documentai.ProcessRequest(
            name=name,
            raw_document=raw_document
        )

        result = client.process_document(request=request)

        return result.document.text

    except Exception as e:
        logger.error(f"Document AI error: {e}")
        return ""


def parse_rooms_from_text(text: str) -> List[Dict]:
    """
    Parse room names and areas from OCR text.

    Looks for patterns like:
    - "SOVRUM 1\n11.9 m²"
    - "KÖK 18.1 m²"
    - "VARDAGSRUM\n30.7 m²"
    """
    rooms = []

    # Pattern: Room name followed by area (with optional newline)
    # Matches: "SOVRUM 1" or "KÖK" followed by "18.1 m²" or "18,1 m²"
    pattern = r'([A-ZÅÄÖ][A-ZÅÄÖ0-9/\s]{1,20}?)\s*\n?\s*(\d{1,3}[.,]\d)\s*m[²2]'

    matches = re.findall(pattern, text, re.IGNORECASE)

    for room_name, area_str in matches:
        room_name = room_name.strip()
        # Convert comma to dot for float parsing
        area = float(area_str.replace(',', '.'))

        # Skip very small areas (likely labels, not rooms)
        if area < 1.0:
            continue

        rooms.append({
            "name": room_name,
            "area": area,
            "category": classify_room(room_name)
        })

    return rooms


def parse_summary_areas(text: str) -> Dict[str, float]:
    """
    Extract summary areas from text.

    Looks for:
    - BOYTA: 130.7m²
    - BTA: 184.9m²
    - BYGGYTA: 187.3m²
    """
    summary = {
        "boyta": 0,      # Living area (BOA)
        "bta": 0,        # Total area
        "biyta": 0,      # Non-living area
        "byggyta": 0,    # Building footprint
    }

    patterns = {
        "boyta": r'BOYTA[:\s]*(\d+[.,]\d+)\s*m',
        "bta": r'BTA[:\s]*(\d+[.,]\d+)\s*m',
        "biyta": r'BIYTA[:\s]*(\d+[.,]\d+)\s*m',
        "byggyta": r'BYGGYTA[:\s]*(\d+[.,]\d+)\s*m',
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            summary[key] = float(match.group(1).replace(',', '.'))

    return summary


def calculate_pricing(rooms: List[Dict], summary: Dict[str, float]) -> List[CostItem]:
    """
    Calculate deterministic pricing based on extracted room data.
    Returns list of CostItem objects.
    """
    items = []

    byggyta = summary.get("byggyta", 0) or summary.get("bta", 0)
    boyta = summary.get("boyta", 0)

    # --- GROUND WORKS ---
    if byggyta > 0:
        items.append(CostItem(
            id=f"ground-foundation",
            phase="ground",
            elementName="Foundation (Platta på mark)",
            description=f"Slab on grade foundation - {byggyta} m²",
            quantity=byggyta,
            unit="m²",
            unitPrice=PRICING["foundation_per_m2"],
            totalCost=byggyta * PRICING["foundation_per_m2"],
            confidenceScore=1.0,
            guidelineReference="SS 21054 - BYGGYTA"
        ))

    # --- STRUCTURE ---
    if byggyta > 0:
        # Roof
        items.append(CostItem(
            id=f"structure-roof",
            phase="structure",
            elementName="Roof Structure & Covering",
            description=f"Pitched roof with tiles - {byggyta} m²",
            quantity=byggyta,
            unit="m²",
            unitPrice=PRICING["roof_per_m2"],
            totalCost=byggyta * PRICING["roof_per_m2"],
            confidenceScore=1.0,
            guidelineReference="AMA Hus"
        ))

        # Exterior walls (estimate perimeter from area)
        perimeter = (byggyta ** 0.5) * 4 * 1.2  # Rough estimate
        wall_area = perimeter * 2.5  # 2.5m height
        items.append(CostItem(
            id=f"structure-ext-walls",
            phase="structure",
            elementName="Exterior Walls (260mm Energy)",
            description=f"Insulated timber frame walls - {wall_area:.0f} m²",
            quantity=wall_area,
            unit="m²",
            unitPrice=PRICING["exterior_wall_per_m2"],
            totalCost=wall_area * PRICING["exterior_wall_per_m2"],
            confidenceScore=0.8,
            guidelineReference="BBR 9 - Energy Requirements"
        ))

    # --- INTERIOR BY ROOM ---
    wet_room_area = 0
    standard_room_area = 0

    for room in rooms:
        category = room["category"]
        area = room["area"]
        name = room["name"]

        # Flooring
        floor_price = PRICING["flooring"].get(category, 450)
        items.append(CostItem(
            id=f"interior-floor-{name.lower().replace(' ', '-')}",
            phase="interior",
            elementName=f"Flooring - {name}",
            description=f"{'Tile' if category in ['bathroom', 'laundry', 'kitchen', 'entry'] else 'Parquet'} flooring",
            quantity=area,
            unit="m²",
            unitPrice=floor_price,
            totalCost=area * floor_price,
            confidenceScore=1.0,
            guidelineReference="SS 21054 - BOA"
        ))

        # Track areas for wall calculations
        if category in ["bathroom", "laundry"]:
            wet_room_area += area
        else:
            standard_room_area += area

    # Wet room walls (estimated from wet room floor area)
    if wet_room_area > 0:
        wet_wall_area = wet_room_area * 2.5  # Rough wall area estimate
        items.append(CostItem(
            id="interior-wet-walls",
            phase="interior",
            elementName="Wet Room Walls (Säker Vatten)",
            description=f"Waterproofed walls with tiles - {wet_wall_area:.0f} m²",
            quantity=wet_wall_area,
            unit="m²",
            unitPrice=PRICING["walls"]["wet_room"],
            totalCost=wet_wall_area * PRICING["walls"]["wet_room"],
            confidenceScore=0.9,
            guidelineReference="Säker Vatten 2021:2, BBV 21:1"
        ))

    # --- PLUMBING ---
    # Count bathrooms from rooms
    bathroom_count = sum(1 for r in rooms if r["category"] == "bathroom")
    if bathroom_count > 0:
        items.append(CostItem(
            id="plumbing-wc",
            phase="plumbing",
            elementName="WC Installation",
            description=f"Wall-hung WC with frame - {bathroom_count} units",
            quantity=bathroom_count,
            unit="st",
            unitPrice=PRICING["wc_unit"],
            totalCost=bathroom_count * PRICING["wc_unit"],
            confidenceScore=1.0,
            guidelineReference="Säker Vatten"
        ))
        items.append(CostItem(
            id="plumbing-basin",
            phase="plumbing",
            elementName="Washbasin & Mixer",
            description=f"Porcelain basin with mixer tap - {bathroom_count} units",
            quantity=bathroom_count,
            unit="st",
            unitPrice=PRICING["washbasin_unit"],
            totalCost=bathroom_count * PRICING["washbasin_unit"],
            confidenceScore=1.0,
            guidelineReference="Säker Vatten"
        ))

    # Kitchen
    kitchen_rooms = [r for r in rooms if r["category"] == "kitchen"]
    if kitchen_rooms:
        items.append(CostItem(
            id="interior-kitchen",
            phase="interior",
            elementName="Kitchen Installation",
            description="Cabinets, countertop, appliances, plumbing",
            quantity=1,
            unit="st",
            unitPrice=PRICING["kitchen_base"],
            totalCost=PRICING["kitchen_base"],
            confidenceScore=0.9,
            guidelineReference="AMA Hus"
        ))

    # --- ELECTRICAL (estimate based on room count) ---
    room_count = len(rooms)
    socket_count = room_count * 6  # Average 6 sockets per room
    items.append(CostItem(
        id="electrical-sockets",
        phase="electrical",
        elementName="Electrical Points",
        description=f"Sockets, switches, spotlights - {socket_count} points",
        quantity=socket_count,
        unit="st",
        unitPrice=PRICING["socket"],
        totalCost=socket_count * PRICING["socket"],
        confidenceScore=0.7,
        guidelineReference="SS 436 40 00"
    ))

    # --- ADMIN/MANDATORY ---
    items.append(CostItem(
        id="admin-klimat",
        phase="admin",
        elementName="Climate Declaration (LCA)",
        description="Mandatory climate impact assessment",
        quantity=1,
        unit="st",
        unitPrice=PRICING["climate_declaration"],
        totalCost=PRICING["climate_declaration"],
        confidenceScore=1.0,
        guidelineReference="PBL 2025"
    ))
    items.append(CostItem(
        id="admin-ka",
        phase="admin",
        elementName="Kontrollansvarig (KA)",
        description="Certified inspector fee",
        quantity=1,
        unit="st",
        unitPrice=PRICING["ka_fee"],
        totalCost=PRICING["ka_fee"],
        confidenceScore=1.0,
        guidelineReference="PBL"
    ))
    items.append(CostItem(
        id="admin-bygglov",
        phase="admin",
        elementName="Building Permit (Bygglov)",
        description="Municipal permit fee",
        quantity=1,
        unit="st",
        unitPrice=PRICING["bygglov"],
        totalCost=PRICING["bygglov"],
        confidenceScore=1.0,
        guidelineReference="PBL"
    ))
    items.append(CostItem(
        id="admin-mgmt",
        phase="admin",
        elementName="Project Management & BAS-P/U",
        description="Site management and safety coordination",
        quantity=1,
        unit="st",
        unitPrice=PRICING["project_mgmt"],
        totalCost=PRICING["project_mgmt"],
        confidenceScore=1.0,
        guidelineReference="AML"
    ))

    return items


async def analyze_floor_plan_deterministic(image_bytes: bytes, mime_type: str) -> Dict:
    """
    Main entry point for deterministic floor plan analysis.

    1. Extract text via Document AI OCR
    2. Parse room names and areas
    3. Calculate pricing using fixed rates

    Returns: {items: List[CostItem], totalArea: float, rooms: List[Dict]}
    """
    # Step 1: OCR
    text = extract_text_with_documentai(image_bytes, mime_type)

    if not text:
        logger.warning("No text extracted, falling back to empty result")
        return {"items": [], "totalArea": 0, "rooms": []}

    logger.info(f"Extracted {len(text)} characters from document")

    # Step 2: Parse
    rooms = parse_rooms_from_text(text)
    summary = parse_summary_areas(text)

    logger.info(f"Found {len(rooms)} rooms, BOYTA: {summary.get('boyta', 0)} m²")

    # Step 3: Calculate
    items = calculate_pricing(rooms, summary)

    # Calculate total area
    total_area = summary.get("boyta", 0) or sum(r["area"] for r in rooms)

    return {
        "items": [item.model_dump() for item in items],
        "totalArea": total_area,
        "rooms": rooms,
        "extracted_text": text[:500]  # For debugging
    }
