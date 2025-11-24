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
    "bedroom": ["SOVRUM", "SOV", "MASTER", "EV. SOV", "EV SOV"],
    "living": ["VARDAGSRUM", "ALLRUM", "RUM", "MATPLATS"],
    "kitchen": ["KÖK"],
    "bathroom": ["WC", "BAD", "DUSCH"],
    "laundry": ["TVÄTT", "TVÄTTSTUGA", "GROVENTRÉ"],
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

    # Windows & Doors
    "window_per_m2": 8500,       # Average window cost per m² glass
    "exterior_door": 25000,      # Front door
    "interior_door": 8500,       # Per door
    "patio_door": 35000,         # Sliding/french doors

    # HVAC & Ventilation
    "heat_pump": 120000,         # Air-to-water heat pump
    "underfloor_heating_per_m2": 450,  # Wet rooms
    "ventilation_ftx": 85000,    # FTX system with heat recovery
    "radiator": 4500,            # Per unit

    # Interior finishing
    "interior_wall_per_m2": 1450,  # Gypsum, paint
    "painting_per_m2": 180,        # Walls and ceiling

    # Plumbing system
    "plumbing_base": 45000,      # Pipes, connections
    "water_heater": 15000,

    # Ground preparation
    "excavation_per_m2": 300,      # Site preparation
    "drainage_per_m2": 150,        # Perimeter drainage

    # Additional structure
    "insulation_per_m2": 200,      # Extra insulation beyond walls

    # Electrical
    "distribution_board": 22000,   # Main electrical panel

    # Interior finishing
    "trim_per_m2": 250,            # Baseboards, door/window frames

    # Site costs
    "site_overhead_pct": 0.05,     # Scaffolding, containers, waste (5%)
    "contingency_pct": 0.10,       # Risk margin (10%)

    # Exterior finishing
    "facade_cladding_per_m2": 1200,  # Träpanel/puts
    "exterior_paint_per_m2": 180,    # Exterior paint
    "gutters_per_m": 650,            # Stuprännor
    "soffit_per_m": 450,             # Vindskivor

    # Connection fees (Swedish averages)
    "va_connection": 120000,         # Water/sewer connection
    "el_connection": 35000,          # Electrical grid connection

    # Appliances
    "appliances_package": 65000,     # Stove, fridge, dishwasher, washer, dryer

    # Bathroom accessories
    "bathroom_accessories": 8000,    # Mirror, cabinet, towel rail per bathroom

    # Wardrobes
    "wardrobe_per_bedroom": 12000,   # Built-in wardrobe

    # Lighting
    "lighting_fixtures": 25000,      # Complete lighting package

    # External works
    "driveway_per_m2": 450,          # Gravel/stone driveway
    "terrace_per_m2": 2500,          # Wooden deck
    "steps_entry": 15000,            # Entry steps

    # Insurance/guarantees
    "construction_insurance": 25000,  # Byggförsäkring

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
    seen_rooms = set()  # Deduplicate by (name, area) combination

    # Known room name patterns (Swedish)
    room_keywords = [
        r'SOVRUM\s*\d*',
        r'SOV\s*\d*',
        r'EV\.?\s*SOV(?:RUM)?\s*\d*',  # Eventuellt sovrum
        r'KÖK(?:\s*/\s*VARDAGSRUM)?',
        r'MATPLATS(?:\s*/\s*VARDAGSRUM)?',  # Dining/living combo
        r'VARDAGSRUM',
        r'ALLRUM',
        r'ENTRÉ?',
        r'GROVENTRÉ(?:\s*/\s*TVÄTT)?',  # Utility entrance
        r'HALL',
        r'TVÄTT(?:STUGA)?(?:\s*/\s*GROVENTRÉ)?',
        r'WC/?D?\s*\d*',
        r'WC/BAD',
        r'BAD(?:RUM)?',
        r'DUSCH',
        r'KLK\s*\d*',  # Numbered closets
        r'KLÄDKAMMARE',
        r'FÖRRÅD',
        r'GARAGE(?:\s*/\s*FÖRRÅD)?',
        r'TEKNIK',
        r'PANNRUM',
    ]

    # Build pattern: room keyword followed by area (allow up to 30 chars between)
    room_pattern = '(' + '|'.join(room_keywords) + r')[\s\S]{0,30}?(\d{1,3}[.,]\d)\s*m[²2]'

    matches = re.findall(room_pattern, text, re.IGNORECASE)

    for room_name, area_str in matches:
        room_name = room_name.strip().upper()
        area = float(area_str.replace(',', '.'))

        # Skip very small areas (likely labels, not rooms)
        if area < 1.0:
            continue

        # Skip very large areas (likely summary values like BOYTA)
        if area > 100:
            continue

        category = classify_room(room_name)

        # Deduplicate by (name, area) to avoid OCR duplicates
        room_key = (room_name, round(area, 1))
        if room_key in seen_rooms:
            continue
        seen_rooms.add(room_key)

        rooms.append({
            "name": room_name,
            "area": area,
            "category": category
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

    # Try to extract building dimensions (in mm, e.g., "7290", "15690")
    # These are typically 4-5 digit numbers representing mm
    dimension_matches = re.findall(r'\b(\d{4,5})\b', text)
    if dimension_matches:
        # Convert to meters and find likely building dimensions
        dims_m = sorted([int(d) / 1000 for d in dimension_matches if 3000 < int(d) < 30000], reverse=True)
        if len(dims_m) >= 2:
            # Use largest dimensions as building length/width
            summary["building_length"] = dims_m[0]
            summary["building_width"] = dims_m[1]
            # Calculate more accurate byggyta if not already set
            if summary["byggyta"] == 0:
                summary["byggyta"] = dims_m[0] * dims_m[1]

    return summary


def calculate_pricing(rooms: List[Dict], summary: Dict[str, float]) -> List[CostItem]:
    """
    Calculate deterministic pricing based on extracted room data.
    Returns list of CostItem objects.
    """
    items = []
    room_count = len(rooms)

    # Get summary areas, or estimate from room data
    byggyta = summary.get("byggyta", 0) or summary.get("bta", 0)
    boyta = summary.get("boyta", 0)

    # If no summary areas provided, estimate from rooms
    total_room_area = sum(r["area"] for r in rooms)

    # Estimate boyta as living area (exclude garage, storage)
    if boyta == 0:
        living_area = sum(r["area"] for r in rooms if r["category"] not in ["garage", "storage"])
        boyta = living_area if living_area > 0 else total_room_area

    # Estimate byggyta as total footprint (all rooms + 10% for walls)
    if byggyta == 0:
        byggyta = total_room_area * 1.1  # Add 10% for wall thickness

    # --- GROUND WORKS ---
    if byggyta > 0:
        # Excavation/site preparation
        items.append(CostItem(
            id="ground-excavation",
            phase="ground",
            elementName="Excavation & Site Preparation",
            description=f"Ground preparation, leveling - {byggyta} m²",
            quantity=byggyta,
            unit="m²",
            unitPrice=PRICING["excavation_per_m2"],
            totalCost=byggyta * PRICING["excavation_per_m2"],
            confidenceScore=0.9,
            guidelineReference="AMA Anläggning"
        ))

        # Foundation
        items.append(CostItem(
            id="ground-foundation",
            phase="ground",
            elementName="Foundation (Platta på mark)",
            description=f"Insulated slab on grade with 300mm EPS under, 100mm edge insulation. Includes reinforcement mesh, radon barrier, and underfloor heating pipes preparation. Rate: 3,500 kr/m² based on 2024 market rates.",
            quantity=byggyta,
            unit="m²",
            unitPrice=PRICING["foundation_per_m2"],
            totalCost=byggyta * PRICING["foundation_per_m2"],
            confidenceScore=1.0,
            guidelineReference="BBR 6:1, SS 21054"
        ))

        # Drainage
        perimeter = (byggyta ** 0.5) * 4
        items.append(CostItem(
            id="ground-drainage",
            phase="ground",
            elementName="Perimeter Drainage",
            description=f"Drainage system around building - {perimeter:.0f} m",
            quantity=perimeter,
            unit="m",
            unitPrice=PRICING["drainage_per_m2"],
            totalCost=perimeter * PRICING["drainage_per_m2"],
            confidenceScore=0.85,
            guidelineReference="BBR 6:1"
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
            id="structure-ext-walls",
            phase="structure",
            elementName="Exterior Walls (260mm Energy)",
            description=f"Timber frame 45x220mm + 45x45mm service layer. Mineral wool insulation U-value ≤0.18 W/m²K per BBR 9. Includes vapor barrier, wind barrier, and gypsum interior. Wall area estimated from building perimeter × 2.5m height.",
            quantity=wall_area,
            unit="m²",
            unitPrice=PRICING["exterior_wall_per_m2"],
            totalCost=wall_area * PRICING["exterior_wall_per_m2"],
            confidenceScore=0.8,
            guidelineReference="BBR 9:4, AMA Hus"
        ))

        # Additional insulation
        items.append(CostItem(
            id="structure-insulation",
            phase="structure",
            elementName="Additional Insulation",
            description=f"Extra insulation for energy compliance - {boyta:.0f} m²",
            quantity=boyta,
            unit="m²",
            unitPrice=PRICING["insulation_per_m2"],
            totalCost=boyta * PRICING["insulation_per_m2"],
            confidenceScore=0.85,
            guidelineReference="BBR 9"
        ))

        # Facade cladding
        items.append(CostItem(
            id="structure-facade",
            phase="structure",
            elementName="Facade Cladding",
            description=f"Timber panel/render finish - {wall_area:.0f} m²",
            quantity=wall_area,
            unit="m²",
            unitPrice=PRICING["facade_cladding_per_m2"],
            totalCost=wall_area * PRICING["facade_cladding_per_m2"],
            confidenceScore=0.85,
            guidelineReference="AMA Hus"
        ))

        # Exterior paint
        items.append(CostItem(
            id="structure-ext-paint",
            phase="structure",
            elementName="Exterior Painting",
            description=f"Facade painting - {wall_area:.0f} m²",
            quantity=wall_area,
            unit="m²",
            unitPrice=PRICING["exterior_paint_per_m2"],
            totalCost=wall_area * PRICING["exterior_paint_per_m2"],
            confidenceScore=0.9,
            guidelineReference="AMA Hus"
        ))

        # Gutters
        roof_perimeter = perimeter
        items.append(CostItem(
            id="structure-gutters",
            phase="structure",
            elementName="Gutters & Downpipes",
            description=f"Stuprännor och hängrännor - {roof_perimeter:.0f} m",
            quantity=roof_perimeter,
            unit="m",
            unitPrice=PRICING["gutters_per_m"],
            totalCost=roof_perimeter * PRICING["gutters_per_m"],
            confidenceScore=0.9,
            guidelineReference="AMA Hus"
        ))

        # Soffit/fascia
        items.append(CostItem(
            id="structure-soffit",
            phase="structure",
            elementName="Soffit & Fascia",
            description=f"Vindskivor och underslag - {roof_perimeter:.0f} m",
            quantity=roof_perimeter,
            unit="m",
            unitPrice=PRICING["soffit_per_m"],
            totalCost=roof_perimeter * PRICING["soffit_per_m"],
            confidenceScore=0.9,
            guidelineReference="AMA Hus"
        ))

    # --- INTERIOR BY ROOM ---
    wet_room_area = 0
    standard_room_area = 0
    total_wet_wall_area = 0
    total_standard_wall_area = 0

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

        # Calculate wall area per room: perimeter * ceiling height
        # Perimeter ≈ 4 * sqrt(area) for roughly square rooms
        room_perimeter = 4 * (area ** 0.5)
        room_wall_area = room_perimeter * 2.5  # 2.5m ceiling height

        # Track areas for wall calculations
        if category in ["bathroom", "laundry"]:
            wet_room_area += area
            total_wet_wall_area += room_wall_area
        else:
            standard_room_area += area
            total_standard_wall_area += room_wall_area

    # Wet room walls (Säker Vatten compliant - ~3x standard cost)
    if total_wet_wall_area > 0:
        items.append(CostItem(
            id="interior-wet-walls",
            phase="interior",
            elementName="Wet Room Walls (Säker Vatten)",
            description=f"Full waterproofing system per Säker Vatten 2021:2. Includes wet room gypsum, liquid membrane (min 2 coats), reinforcement tape at corners, and ceramic tiles. Wall area calculated as perimeter × 2.5m height for each wet room. Rate ~3× standard walls due to waterproofing requirements.",
            quantity=total_wet_wall_area,
            unit="m²",
            unitPrice=PRICING["walls"]["wet_room"],
            totalCost=total_wet_wall_area * PRICING["walls"]["wet_room"],
            confidenceScore=0.85,
            guidelineReference="Säker Vatten 2021:2, BBV 21:1, BBR 6:5"
        ))

    # Standard room walls
    if total_standard_wall_area > 0:
        items.append(CostItem(
            id="interior-standard-walls",
            phase="interior",
            elementName="Standard Room Walls",
            description=f"Gypsum with paint finish - {total_standard_wall_area:.0f} m²",
            quantity=total_standard_wall_area,
            unit="m²",
            unitPrice=PRICING["walls"]["standard"],
            totalCost=total_standard_wall_area * PRICING["walls"]["standard"],
            confidenceScore=0.85,
            guidelineReference="AMA Hus"
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

    # --- CEILING & PAINTING ---
    if boyta > 0:
        # Ceiling finishing
        items.append(CostItem(
            id="interior-ceiling",
            phase="interior",
            elementName="Ceiling Finishing",
            description=f"Gypsum ceiling with paint - {boyta:.0f} m²",
            quantity=boyta,
            unit="m²",
            unitPrice=PRICING["ceiling"]["standard"],
            totalCost=boyta * PRICING["ceiling"]["standard"],
            confidenceScore=0.9,
            guidelineReference="AMA Hus"
        ))

    # --- WINDOWS & DOORS ---
    if boyta > 0:
        # Windows (estimate: 15% of floor area as glass)
        window_area = boyta * 0.15
        items.append(CostItem(
            id="structure-windows",
            phase="structure",
            elementName="Windows",
            description=f"Triple-glazed windows - {window_area:.0f} m²",
            quantity=window_area,
            unit="m²",
            unitPrice=PRICING["window_per_m2"],
            totalCost=window_area * PRICING["window_per_m2"],
            confidenceScore=0.8,
            guidelineReference="BBR 9 - Energy"
        ))

        # Exterior door
        items.append(CostItem(
            id="structure-ext-door",
            phase="structure",
            elementName="Exterior Door",
            description="Insulated entry door with frame",
            quantity=1,
            unit="st",
            unitPrice=PRICING["exterior_door"],
            totalCost=PRICING["exterior_door"],
            confidenceScore=1.0,
            guidelineReference="BBR"
        ))

        # Patio/terrace door
        items.append(CostItem(
            id="structure-patio-door",
            phase="structure",
            elementName="Patio Door",
            description="Sliding glass door to terrace",
            quantity=1,
            unit="st",
            unitPrice=PRICING["patio_door"],
            totalCost=PRICING["patio_door"],
            confidenceScore=0.9,
            guidelineReference="BBR"
        ))

        # Interior doors (estimate: 1 per room + 2 extra)
        door_count = room_count + 2
        items.append(CostItem(
            id="interior-doors",
            phase="interior",
            elementName="Interior Doors",
            description=f"Standard interior doors with frames - {door_count} st",
            quantity=door_count,
            unit="st",
            unitPrice=PRICING["interior_door"],
            totalCost=door_count * PRICING["interior_door"],
            confidenceScore=0.8,
            guidelineReference="AMA Hus"
        ))

    # --- HVAC & VENTILATION ---
    if boyta > 0:
        # Heat pump
        items.append(CostItem(
            id="hvac-heatpump",
            phase="plumbing",
            elementName="Heat Pump (Bergvärme/Luft-vatten)",
            description="Air-to-water heat pump ~8-10 kW sized for Swedish climate zone III. Includes indoor unit, outdoor unit, buffer tank, and controls. COP ≥4.0 required for BBR 9 energy compliance. Installation and commissioning included.",
            quantity=1,
            unit="st",
            unitPrice=PRICING["heat_pump"],
            totalCost=PRICING["heat_pump"],
            confidenceScore=0.9,
            guidelineReference="BBR 9:2, SS-EN 14825"
        ))

        # Underfloor heating in wet rooms
        if wet_room_area > 0:
            items.append(CostItem(
                id="hvac-underfloor",
                phase="plumbing",
                elementName="Underfloor Heating (Wet Rooms)",
                description=f"Electric/water underfloor heating - {wet_room_area:.0f} m²",
                quantity=wet_room_area,
                unit="m²",
                unitPrice=PRICING["underfloor_heating_per_m2"],
                totalCost=wet_room_area * PRICING["underfloor_heating_per_m2"],
                confidenceScore=0.9,
                guidelineReference="Säker Vatten"
            ))

        # Radiators (estimate: 1 per room)
        items.append(CostItem(
            id="hvac-radiators",
            phase="plumbing",
            elementName="Radiators",
            description=f"Panel radiators - {room_count} st",
            quantity=room_count,
            unit="st",
            unitPrice=PRICING["radiator"],
            totalCost=room_count * PRICING["radiator"],
            confidenceScore=0.8,
            guidelineReference="BBR"
        ))

        # FTX Ventilation
        items.append(CostItem(
            id="hvac-ventilation",
            phase="plumbing",
            elementName="FTX Ventilation System",
            description="Mechanical ventilation with heat recovery",
            quantity=1,
            unit="st",
            unitPrice=PRICING["ventilation_ftx"],
            totalCost=PRICING["ventilation_ftx"],
            confidenceScore=1.0,
            guidelineReference="BBR 6:2"
        ))

    # --- PLUMBING BASE ---
    items.append(CostItem(
        id="plumbing-base",
        phase="plumbing",
        elementName="Plumbing System",
        description="Water pipes, drainage, connections",
        quantity=1,
        unit="st",
        unitPrice=PRICING["plumbing_base"],
        totalCost=PRICING["plumbing_base"],
        confidenceScore=0.9,
        guidelineReference="Säker Vatten"
    ))

    items.append(CostItem(
        id="plumbing-waterheater",
        phase="plumbing",
        elementName="Water Heater",
        description="Hot water tank/cylinder",
        quantity=1,
        unit="st",
        unitPrice=PRICING["water_heater"],
        totalCost=PRICING["water_heater"],
        confidenceScore=1.0,
        guidelineReference="Säker Vatten"
    ))

    # Showers (one per bathroom)
    if bathroom_count > 0:
        items.append(CostItem(
            id="plumbing-shower",
            phase="plumbing",
            elementName="Shower Installation",
            description=f"Shower with mixer and drain - {bathroom_count} st",
            quantity=bathroom_count,
            unit="st",
            unitPrice=PRICING["shower_unit"],
            totalCost=bathroom_count * PRICING["shower_unit"],
            confidenceScore=1.0,
            guidelineReference="Säker Vatten"
        ))

        items.append(CostItem(
            id="plumbing-drain",
            phase="plumbing",
            elementName="Floor Drains",
            description=f"Wet room floor drains - {bathroom_count} st",
            quantity=bathroom_count,
            unit="st",
            unitPrice=PRICING["floor_drain"],
            totalCost=bathroom_count * PRICING["floor_drain"],
            confidenceScore=1.0,
            guidelineReference="Säker Vatten"
        ))

        # Bathroom accessories
        items.append(CostItem(
            id="interior-bath-accessories",
            phase="interior",
            elementName="Bathroom Accessories",
            description=f"Mirrors, cabinets, towel rails - {bathroom_count} st",
            quantity=bathroom_count,
            unit="st",
            unitPrice=PRICING["bathroom_accessories"],
            totalCost=bathroom_count * PRICING["bathroom_accessories"],
            confidenceScore=0.9,
            guidelineReference="AMA Hus"
        ))

    # Wardrobes (for bedrooms)
    bedroom_count = sum(1 for r in rooms if r["category"] == "bedroom")
    if bedroom_count > 0:
        items.append(CostItem(
            id="interior-wardrobes",
            phase="interior",
            elementName="Built-in Wardrobes",
            description=f"Garderober - {bedroom_count} st",
            quantity=bedroom_count,
            unit="st",
            unitPrice=PRICING["wardrobe_per_bedroom"],
            totalCost=bedroom_count * PRICING["wardrobe_per_bedroom"],
            confidenceScore=0.85,
            guidelineReference="AMA Hus"
        ))

    # --- ELECTRICAL (estimate based on room count) ---
    # Distribution board
    items.append(CostItem(
        id="electrical-panel",
        phase="electrical",
        elementName="Distribution Board",
        description="Main electrical panel with breakers",
        quantity=1,
        unit="st",
        unitPrice=PRICING["distribution_board"],
        totalCost=PRICING["distribution_board"],
        confidenceScore=1.0,
        guidelineReference="SS 437"
    ))

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

    # Lighting fixtures
    items.append(CostItem(
        id="electrical-lighting",
        phase="electrical",
        elementName="Lighting Fixtures",
        description="Complete lighting package for all rooms",
        quantity=1,
        unit="st",
        unitPrice=PRICING["lighting_fixtures"],
        totalCost=PRICING["lighting_fixtures"],
        confidenceScore=0.85,
        guidelineReference="SS 436"
    ))

    # --- COMPLETION (Appliances & External) ---
    # Appliances
    items.append(CostItem(
        id="completion-appliances",
        phase="completion",
        elementName="Kitchen & Laundry Appliances",
        description="Stove, fridge, dishwasher, washer, dryer",
        quantity=1,
        unit="st",
        unitPrice=PRICING["appliances_package"],
        totalCost=PRICING["appliances_package"],
        confidenceScore=0.9,
        guidelineReference="Market Rate"
    ))

    # External works (estimate based on byggyta)
    if byggyta > 0:
        # Terrace (estimate 20 m²) - standard for most villas
        terrace_area = 20
        items.append(CostItem(
            id="completion-terrace",
            phase="completion",
            elementName="Terrace/Deck",
            description=f"Impregnated wood deck, standard 20 m². Includes foundation, joists, decking boards, railing. Per AMA Hus standards.",
            quantity=terrace_area,
            unit="m²",
            unitPrice=PRICING["terrace_per_m2"],
            totalCost=terrace_area * PRICING["terrace_per_m2"],
            confidenceScore=0.7,
            guidelineReference="AMA Hus 23"
        ))

        # Entry steps
        items.append(CostItem(
            id="completion-steps",
            phase="completion",
            elementName="Entry Steps",
            description="Concrete entry steps with steel railing. BBR 3:4 accessibility requirements for max 150mm rise per step.",
            quantity=1,
            unit="st",
            unitPrice=PRICING["steps_entry"],
            totalCost=PRICING["steps_entry"],
            confidenceScore=0.8,
            guidelineReference="BBR 3:4"
        ))

    # --- INTERIOR TRIM ---
    if boyta > 0:
        items.append(CostItem(
            id="interior-trim",
            phase="interior",
            elementName="Interior Trim & Moldings",
            description=f"Baseboards, door frames, window frames - {boyta:.0f} m²",
            quantity=boyta,
            unit="m²",
            unitPrice=PRICING["trim_per_m2"],
            totalCost=boyta * PRICING["trim_per_m2"],
            confidenceScore=0.9,
            guidelineReference="AMA Hus"
        ))

    # --- ADMIN/MANDATORY ---
    # Connection fees
    items.append(CostItem(
        id="admin-va-connection",
        phase="admin",
        elementName="VA Connection (Water/Sewer)",
        description="Municipal water and sewer connection",
        quantity=1,
        unit="st",
        unitPrice=PRICING["va_connection"],
        totalCost=PRICING["va_connection"],
        confidenceScore=1.0,
        guidelineReference="Municipal Rate"
    ))

    items.append(CostItem(
        id="admin-el-connection",
        phase="admin",
        elementName="Electrical Grid Connection",
        description="Power company connection fee",
        quantity=1,
        unit="st",
        unitPrice=PRICING["el_connection"],
        totalCost=PRICING["el_connection"],
        confidenceScore=1.0,
        guidelineReference="Grid Company Rate"
    ))

    # Insurance
    items.append(CostItem(
        id="admin-insurance",
        phase="admin",
        elementName="Construction Insurance",
        description="Byggförsäkring",
        quantity=1,
        unit="st",
        unitPrice=PRICING["construction_insurance"],
        totalCost=PRICING["construction_insurance"],
        confidenceScore=1.0,
        guidelineReference="Insurance Standard"
    ))

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

    # --- SITE OVERHEAD & CONTINGENCY ---
    # Calculate subtotal for percentage-based costs
    subtotal = sum(item.totalCost for item in items)

    # Site overhead (scaffolding, containers, waste removal)
    site_overhead = subtotal * PRICING["site_overhead_pct"]
    items.append(CostItem(
        id="admin-site-overhead",
        phase="admin",
        elementName="Site Overhead",
        description="Scaffolding, containers, waste removal (5%)",
        quantity=1,
        unit="st",
        unitPrice=site_overhead,
        totalCost=site_overhead,
        confidenceScore=1.0,
        guidelineReference="Industry Standard"
    ))

    # Contingency (risk margin)
    contingency = subtotal * PRICING["contingency_pct"]
    items.append(CostItem(
        id="admin-contingency",
        phase="admin",
        elementName="Contingency",
        description="Risk margin and unforeseen costs (10%)",
        quantity=1,
        unit="st",
        unitPrice=contingency,
        totalCost=contingency,
        confidenceScore=1.0,
        guidelineReference="ABT 06"
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
