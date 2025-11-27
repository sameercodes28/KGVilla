"""
OCR Service Module
==================
Deterministic floor plan analysis using Google Document AI.
Extracts room data and calculates pricing from printed annotations.
"""
import os
import re
import math
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
# Based on analysis of 11 real floor plans from JB Villan
ROOM_CATEGORIES = {
    "bedroom": ["SOVRUM", "SOV", "MASTER", "EV. SOV", "EV SOV", "EV.SOV"],
    "living": ["VARDAGSRUM", "V.RUM", "ALLRUM", "RUM", "MATPLATS", "ROOM"],  # V.RUM is common abbreviation
    "kitchen": ["KÖK"],
    "bathroom": ["WC", "BAD", "DUSCH"],
    "laundry": ["TVÄTT", "TVÄTTSTUGA", "GROVENTRÉ", "GROVKÖK", "GROVENTR"],
    "entry": ["ENTRÉ", "HALL", "ENTRE", "ENTR", "VINDFÅNG"],  # ENTR is OCR variant of ENTRÉ
    "closet": ["KLK", "KLÄDKAMMARE", "GARDEROB"],  # Walk-in closets - BOA (inside heated area)
    "storage": ["FÖRRÅD", "KALLFÖRRÅD"],  # External storage - Biarea (only these are Biarea)
    "garage": ["GARAGE", "CARPORT"],
    "utility": ["TEKNIK", "PANNRUM"],
    "terrace": ["ALTAN", "UTEPLATS", "TERRASS", "VERANDA", "DECK", "BALKONG"],
}

# --- BOA vs Biarea Classification (Swedish SS 21054:2009) ---
# Biarea = Secondary area (unheated: garage, external storage, technical rooms)
# BOA = Living area (heated living spaces, including walk-in closets)
BIAREA_CATEGORIES = ["garage", "storage", "utility"]  # Rooms that count as Biarea
# Note: "closet" is NOT in Biarea - walk-in closets inside the house are BOA

# Wall thickness adjustment factor
# Floor plan room labels show NTA (net area, inside walls)
# BRA (gross usable area) includes inner wall thickness
# Typical inner walls: 100-120mm, adds ~3.5% to net area
WALL_THICKNESS_FACTOR = 1.035  # 3.5% adjustment for wall thickness

# Equipment labels that indicate features (from floor plan analysis)
EQUIPMENT_LABELS = {
    "heat_pump": ["VP"],  # Värmepump
    "laundry": ["TM", "TT"],  # Tvättmaskin, Torktumlare
    "kitchen_appliances": ["F", "K", "DM", "U/M", "MVU"],  # Frys, Kyl, Diskmaskin, Mikro
    "fireplace": ["BRASKAMIN", "KAMIN"],
    "electrical": ["ELC", "EI30"],  # Elcentral, Fire rating
    "hvac": ["VMS", "GVF", "GVF1", "GVF2"],  # Varmvattenberedare, Golvvärme
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
        "closet": 850,       # Parquet (same as bedroom)
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


def is_biarea(category: str) -> bool:
    """
    Determine if a room category is Biarea (secondary area) vs BOA (living area).

    Per Swedish SS 21054:2009:
    - BOA (Boarea) = Heated living spaces
    - Biarea = Unheated/secondary spaces (garage, storage, technical rooms)
    """
    return category in BIAREA_CATEGORIES


def calculate_area_breakdown(rooms: List[Dict]) -> Dict[str, float]:
    """
    Calculate BOA (living area) and Biarea (secondary area) from room list.

    Also applies wall thickness adjustment to convert from NTA (net) to BRA (gross).

    Returns:
        {
            "boa_net": float,      # Living area (net, from room labels)
            "biarea_net": float,   # Secondary area (net, from room labels)
            "total_net": float,    # Total net area
            "boa_gross": float,    # Living area with wall adjustment
            "biarea_gross": float, # Secondary area with wall adjustment
            "total_gross": float,  # Total gross area (comparable to builder specs)
        }
    """
    boa_net = 0.0
    biarea_net = 0.0

    for room in rooms:
        category = room.get("category", "storage")
        area = room.get("area", 0)

        if is_biarea(category):
            biarea_net += area
        else:
            boa_net += area

    total_net = boa_net + biarea_net

    # Apply wall thickness adjustment for gross area
    # This makes our calculation comparable to builder specs
    boa_gross = round(boa_net * WALL_THICKNESS_FACTOR, 1)
    biarea_gross = round(biarea_net * WALL_THICKNESS_FACTOR, 1)
    total_gross = round(total_net * WALL_THICKNESS_FACTOR, 1)

    return {
        "boa_net": round(boa_net, 1),
        "biarea_net": round(biarea_net, 1),
        "total_net": round(total_net, 1),
        "boa_gross": boa_gross,
        "biarea_gross": biarea_gross,
        "total_gross": total_gross,
    }


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


def extract_text_with_bounding_boxes(image_bytes: bytes, mime_type: str) -> Tuple[str, List[Dict]]:
    """
    Extract text WITH bounding box coordinates from Document AI.

    Returns:
        Tuple of (full_text, list of text blocks with coordinates)
        Each block: {"text": str, "x": float, "y": float, "width": float, "height": float}
    """
    if not _documentai_available:
        logger.error("Document AI not available")
        return "", []

    if not _processor_id:
        logger.error("DOCUMENTAI_PROCESSOR_ID not configured")
        return "", []

    try:
        client_options = {"api_endpoint": f"{LOCATION}-documentai.googleapis.com"}
        client = documentai.DocumentProcessorServiceClient(client_options=client_options)
        name = f"projects/{PROJECT_ID}/locations/{LOCATION}/processors/{_processor_id}"

        raw_document = documentai.RawDocument(
            content=image_bytes,
            mime_type=mime_type
        )

        request = documentai.ProcessRequest(
            name=name,
            raw_document=raw_document
        )

        result = client.process_document(request=request)
        document = result.document
        full_text = document.text

        # Extract text blocks with bounding boxes
        text_blocks = []

        # Process each page (typically just one for floor plans)
        for page in document.pages:
            # Extract from tokens (most granular level)
            for token in page.tokens:
                # Get text using text_anchor
                text = ""
                if token.layout.text_anchor.text_segments:
                    for segment in token.layout.text_anchor.text_segments:
                        start = int(segment.start_index) if segment.start_index else 0
                        end = int(segment.end_index) if segment.end_index else 0
                        text += full_text[start:end]

                text = text.strip()
                if not text:
                    continue

                # Get bounding box (normalized coordinates 0-1)
                bbox = token.layout.bounding_poly
                if bbox.normalized_vertices:
                    vertices = bbox.normalized_vertices
                    # Calculate center point and dimensions
                    x_coords = [v.x for v in vertices]
                    y_coords = [v.y for v in vertices]

                    x_min, x_max = min(x_coords), max(x_coords)
                    y_min, y_max = min(y_coords), max(y_coords)

                    # Center point (normalized 0-1)
                    center_x = (x_min + x_max) / 2
                    center_y = (y_min + y_max) / 2

                    text_blocks.append({
                        "text": text,
                        "x": center_x,
                        "y": center_y,
                        "x_min": x_min,
                        "x_max": x_max,
                        "y_min": y_min,
                        "y_max": y_max,
                    })

        logger.info(f"Extracted {len(text_blocks)} text blocks with bounding boxes")
        return full_text, text_blocks

    except Exception as e:
        logger.error(f"Document AI bounding box extraction error: {e}")
        return "", []


def parse_rooms_with_spatial_matching(text_blocks: List[Dict]) -> List[Dict]:
    """
    Parse rooms using 2D spatial matching of bounding boxes.

    This solves the problem of adjacent rooms (like SOV2 and SOV3) getting
    their areas swapped due to text extraction order.

    Algorithm:
    1. Identify all room name blocks
    2. Identify all area value blocks
    3. For each room, find the spatially closest area using Euclidean distance
    """
    rooms = []
    seen_rooms = set()

    # Room name patterns - must handle OCR variations
    # Note: Patterns are checked in order, first match wins
    # IMPORTANT: Document AI often tokenizes "SOV 1" as "SOV" alone, so we match "SOV" by itself
    room_patterns = [
        # Bedrooms - handle all variations including standalone SOV
        r'^SOVRUM\s*\d*$', r'^SOV\s*\d+$', r'^SOV\d+$', r'^SOV$',  # SOV alone
        r'^EV\.?\s*SOV', r'^EV\.\s*SOV',  # "EV. SOV" or "EV SOV"
        # Living/Dining - MATPLATS must be explicit
        r'^V\.?RUM$', r'^VARDAGSRUM$', r'^ALLRUM$', r'^MATPLATS$', r'^Room$',
        # Kitchen (with variations)
        r'^KÖK$', r'^KÖKVARDAGSRUM$', r'^KÖK/VARDAGSRUM$', r'^KOK$', r'^KÖK/MATPLATS$',
        # Bathrooms - handle WC/D1, WC/D2, WCD1, WCD2, WC, etc.
        r'^WC/D\d+$', r'^WCD\d+$', r'^WC/?D?\d*$', r'^WC/BAD$', r'^BAD$', r'^DUSCH',
        # Laundry - handle combined rooms
        r'^TVÄTT/GROVENTR', r'^GROVENTR[EÉ]/TVÄTT', r'^TVÄTT', r'^TVÄTTSTUGA$',
        r'^GROVENTR[EÉ]?$', r'^TVATT$',
        # Entry - explicit patterns for all variations
        r'^ENTRÉ$', r'^ENTRE$', r'^ENTR$', r'^HALL$', r'^VINDFÅNG$',
        # Closets - KLK1, KLK2, KLK 1, etc.
        r'^KLK\s*\d*$', r'^KLK\d+$', r'^KLÄDKAMMARE$',
        # Storage - handle combined GARAGE/FÖRRÅD
        r'^GARAGE/FÖRRÅD$', r'^FÖRRÅD/GARAGE$', r'^FÖRRÅD$', r'^GARAGE$', r'^TEKNIK$',
        # Outdoor
        r'^ALTAN$', r'^UTEPLATS$', r'^TERRASS$',
    ]

    # Area patterns - multiple patterns to catch different OCR extraction styles
    # Pattern 1: Full pattern like "8.3 m²" or "12.7m2"
    area_pattern = r'^(\d{1,3}[.,/]\d)\s*m?[²³2]?$'
    # Pattern 2: Just the number like "2.7" (m² might be separate token)
    area_pattern_num_only = r'^(\d{1,2}[.,/]\d)$'

    # Separate room blocks and area blocks
    room_blocks = []
    area_blocks = []

    for block in text_blocks:
        text = block["text"].upper().strip()

        # Check if it's a room name
        matched = False
        for pattern in room_patterns:
            if re.match(pattern, text, re.IGNORECASE):
                room_blocks.append({
                    "name": text,
                    "x": block["x"],
                    "y": block["y"],
                    "category": classify_room(text),
                })
                matched = True
                break

        # Log potential room names that didn't match (for debugging)
        if not matched and len(text) >= 3 and len(text) <= 12:
            # Check if it looks like it could be a room name
            if text.isalpha() or text.replace('/', '').replace('.', '').isalnum():
                if text not in ['INV', 'GVF', 'BOA', 'BTA', 'BOYTA', 'BIYTA', 'TAK', 'PLANT', 'RYGG']:
                    logger.debug(f"Unmatched potential room: '{text}' at ({block['x']:.3f}, {block['y']:.3f})")

        # Check if it's an area value - try multiple patterns
        text_normalized = text.replace(',', '.')
        area_match = re.match(area_pattern, text_normalized)
        if not area_match:
            # Try number-only pattern (e.g., "2.7" without "m²")
            area_match = re.match(area_pattern_num_only, text_normalized)

        if area_match:
            # Handle OCR misreading "." as "/" (e.g., "2/4" should be "2.4")
            area_str = area_match.group(1).replace(',', '.').replace('/', '.')
            area_val = float(area_str)
            # Valid room area range (1-100 m²)
            if 1.0 <= area_val <= 100:
                area_blocks.append({
                    "area": area_val,
                    "x": block["x"],
                    "y": block["y"],
                    "text": text,
                })

    logger.info(f"Found {len(room_blocks)} room labels and {len(area_blocks)} area values")

    # Room size validation ranges
    ROOM_SIZE_HINTS = {
        "living": (8, 60),
        "bedroom": (5, 25),
        "kitchen": (6, 35),
        "bathroom": (2, 12),
        "laundry": (2, 15),
        "entry": (2, 20),
        "closet": (1, 10),
        "storage": (3, 40),
        "garage": (15, 60),
    }

    def euclidean_distance(x1, y1, x2, y2):
        return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

    def is_plausible_size(category: str, area: float) -> bool:
        if category in ROOM_SIZE_HINTS:
            min_size, max_size = ROOM_SIZE_HINTS[category]
            return min_size <= area <= max_size
        return True

    # Match each room to its spatially closest plausible area
    used_areas = set()

    for room_block in room_blocks:
        room_name = room_block["name"]
        room_x = room_block["x"]
        room_y = room_block["y"]
        category = room_block["category"]

        best_area = None
        best_distance = float('inf')
        best_area_idx = None

        for idx, area_block in enumerate(area_blocks):
            if idx in used_areas:
                continue

            area_val = area_block["area"]

            # Skip implausible sizes for this room type
            if not is_plausible_size(category, area_val):
                continue

            # Calculate 2D distance
            dist = euclidean_distance(room_x, room_y, area_block["x"], area_block["y"])

            # Prefer areas that are BELOW or to the RIGHT of the room name
            # (typical floor plan layout: label above or left of area)
            if area_block["y"] >= room_y or area_block["x"] >= room_x:
                # Slight preference for areas below/right
                dist *= 0.9

            if dist < best_distance:
                best_distance = dist
                best_area = area_val
                best_area_idx = idx

        if best_area is not None:
            room_key = (room_name, round(best_area, 1))

            if room_key not in seen_rooms:
                seen_rooms.add(room_key)
                rooms.append({
                    "name": room_name,
                    "area": best_area,
                    "category": category,
                    "is_biarea": is_biarea(category),
                    "spatial_distance": best_distance,  # For debugging
                })
                used_areas.add(best_area_idx)
                logger.info(f"Matched {room_name} -> {best_area} m² (distance: {best_distance:.4f})")

    return rooms


def parse_rooms_from_text(text: str) -> List[Dict]:
    """
    Parse room names and areas from OCR text.

    Uses a three-phase approach to handle floor plan OCR challenges:
    1. Find all room name positions
    2. Find all area positions (excluding summary areas like BOYTA, BIYTA)
    3. Match each room to nearest area using proximity-based matching

    Looks for patterns like:
    - "SOVRUM 1\n11.9 m²"
    - "KÖK 18.1 m²"
    - "VARDAGSRUM\n30.7 m²"
    """
    rooms = []
    seen_rooms = set()  # Deduplicate by (name, area) combination

    # Pre-processing: Find summary label positions to exclude their areas
    # Summary areas like "BIYTA: 34.0m²" should not be matched to rooms
    summary_pattern = r'(BOYTA|BIYTA|BTA|BYGGYTA)\s*:\s*'
    summary_exclusion_zones = set()
    for m in re.finditer(summary_pattern, text, re.IGNORECASE):
        # Mark 50 chars after summary label as exclusion zone
        for i in range(m.start(), min(m.end() + 30, len(text))):
            summary_exclusion_zones.add(i)

    # Known room name patterns (Swedish)
    # Updated based on analysis of 11 real floor plans from JB Villan
    room_keywords = [
        # Bedrooms - multiple naming conventions
        r'SOVRUM\s*\d*',
        r'SOV\s*\d+',                  # SOV with number (SOV 1, SOV 2)
        r'SOV(?!\s*\d)',               # SOV alone (no number following)
        r'EV\.?\s*SOV(?:RUM)?',        # Eventuellt sovrum (no trailing digits to avoid capturing area)
        # Living/dining - combined rooms MUST come before individual patterns
        r'KÖKVARDAGSRUM',              # No-slash variant (OCR sometimes drops /)
        r'KÖK\s*/\s*VARDAGSRUM',       # Kitchen/living combo with slash
        r'KÖKSMATPLATS',               # No-slash variant
        r'KÖK\s*/\s*MATPLATS',         # Kitchen/dining combo
        r'MATPLATSVARDAGSRUM',         # No-slash variant
        r'MATPLATS\s*/\s*VARDAGSRUM',  # Dining/living combo
        # Individual living/dining patterns - AFTER combined patterns
        r'V\.RUM',                     # Abbreviated vardagsrum (before VARDAGSRUM to match first)
        r'VARDAGSRUM',
        r'KÖK(?!S)(?!/)(?!\s*/)',      # Kitchen alone (negative lookahead for combined patterns)
        r'MATPLATS(?!/)(?!\s*/)',      # Dining alone
        r'ALLRUM',
        r'Room',                       # Generic (seen in some plans)
        # Utility/laundry - MUST come BEFORE entry patterns to avoid partial matches
        r'GROVENTR[EÉ]\s*/\s*TVÄTT',   # Utility entrance/laundry (with or without accent)
        r'TVÄTT\s*/\s*GROVENTR[EÉ]',   # Laundry/utility entrance
        r'GROVENTR[EÉ](?!/)(?!\s*/)',  # Utility entrance alone
        r'TVÄTT(?:STUGA)?(?!/)(?!\s*/)',  # Laundry alone
        r'GROVKÖK',
        # Entry areas - AFTER utility patterns, use word boundaries
        # Exclude "OVER ENTRE" (label meaning "above entry"), "GROVENTRE", etc.
        r'(?<!OVER )(?<!GROV)ENTRÉ(?![A-Z])',   # ENTRÉ not after OVER or GROV
        r'(?<!OVER )(?<!GROV)ENTRE(?![A-Z])',   # ENTRE not after OVER or GROV
        r'(?<!OVER )(?<!GROV)ENTR(?![A-ZÉE])',  # ENTR alone, not part of other words
        r'HALL(?!\w)',                 # HALL not followed by letters
        r'VINDFÅNG',
        # Bathrooms - multiple conventions
        r'WC/BAD',                     # WC/bathroom combo
        r'WC/D\s*\d*',                 # WC/dusch numbered
        r'WC\s*\d*',                   # WC numbered
        r'BAD(?:RUM)?',
        r'DUSCH',
        # Storage - including numbered closets
        r'KLK\s*\d*',                  # Numbered closets (KLK 1, KLK2, etc.)
        r'KLÄDKAMMARE',
        r'FÖRRÅD',
        # Garage - including combined storage
        r'GARAGE\s*/\s*FÖRRÅD',        # Garage/storage combo
        r'GARAGE(?!/)(?!\s*/)',        # Garage alone
        r'CARPORT',
        # Technical rooms
        r'TEKNIK',
        r'PANNRUM',
        # Outdoor spaces (terrace/deck)
        r'ALTAN',
        r'UTEPLATS',
        r'TERRASS',
        r'VERANDA',
        r'BALKONG',
    ]

    # Phase 1: Find all room names with their positions
    room_name_pattern = '(' + '|'.join(room_keywords) + ')'
    room_matches = list(re.finditer(room_name_pattern, text, re.IGNORECASE))

    # Phase 2: Find all areas with their positions, EXCLUDING summary areas
    # Match areas like "8.9 m²", "18.8 m²", "5.2 m³", "2.9 m" (OCR sometimes misreads ² or omits it)
    area_pattern = r'(\d{1,3}[.,]\d)\s*m[²³2]?(?=\s|$|[^\w])'
    all_area_matches = list(re.finditer(area_pattern, text, re.IGNORECASE))

    # Filter out areas in summary exclusion zones
    area_matches = []
    for m in all_area_matches:
        if m.start() not in summary_exclusion_zones:
            area_matches.append(m)

    # Phase 3: Three-pass matching strategy
    # Pass 1: STRICT - area immediately following room (within 20 chars)
    # Pass 2: PROXIMITY - closest area within reasonable distance
    # Pass 3: FALLBACK - remaining rooms get remaining areas by order

    used_rooms = set()
    used_areas = set()

    # Room size validation ranges (typical Swedish floor plans)
    # These help avoid obviously wrong matches - ranges are permissive
    ROOM_SIZE_HINTS = {
        "living": (8, 60),     # VARDAGSRUM, ALLRUM, MATPLATS - 8-60 m² (ALLRUM can be ~10-12)
        "bedroom": (5, 25),    # SOV typically 5-25 m² (master can be larger)
        "kitchen": (6, 35),    # KÖK typically 6-35 m² (open kitchens larger)
        "bathroom": (2, 12),   # WC/BAD typically 2-12 m²
        "laundry": (2, 15),    # TVÄTT typically 2-15 m²
        "entry": (2, 20),      # ENTRÉ typically 2-20 m² (large entries exist)
        "closet": (1, 10),     # KLK typically 1-10 m² (walk-ins can be larger)
        "storage": (3, 40),    # FÖRRÅD typically 3-40 m² (variable)
        "garage": (15, 60),    # GARAGE typically 15-60 m²
    }

    # Helper function to validate and extract area
    def get_valid_area(area_match):
        area_str = area_match.group(1)
        area_val = float(area_str.replace(',', '.'))
        if 1.0 <= area_val <= 100:  # Valid room area range
            return area_val
        return None

    def is_plausible_size(category: str, area: float) -> bool:
        """Check if area is plausible for the room category."""
        if category in ROOM_SIZE_HINTS:
            min_size, max_size = ROOM_SIZE_HINTS[category]
            return min_size <= area <= max_size
        return True  # No hint, accept any size

    # Pass 1: Strict immediate matching (within 20 chars)
    # Only match if area is plausible for the room type
    for room_idx, room_match in enumerate(room_matches):
        room_name = room_match.group(1).strip().upper()
        room_name = ' '.join(room_name.split())  # Clean whitespace
        room_end = room_match.end()
        category = classify_room(room_name)

        for area_idx, area_match in enumerate(area_matches):
            if area_idx in used_areas:
                continue

            distance = area_match.start() - room_end
            if 0 <= distance <= 20:  # Strict: within 20 chars after room
                area_val = get_valid_area(area_match)
                if area_val is None:
                    continue

                # Skip if area is implausible for this room type
                if not is_plausible_size(category, area_val):
                    continue

                room_key = (room_name, round(area_val, 1))

                if room_key not in seen_rooms:
                    seen_rooms.add(room_key)
                    rooms.append({
                        "name": room_name,
                        "area": area_val,
                        "category": category,
                        "is_biarea": is_biarea(category),
                    })
                    used_rooms.add(room_idx)
                    used_areas.add(area_idx)
                break

    # Pass 2: Proximity matching - find closest plausible area within 50 chars
    for room_idx, room_match in enumerate(room_matches):
        if room_idx in used_rooms:
            continue

        room_name = room_match.group(1).strip().upper()
        room_name = ' '.join(room_name.split())
        room_end = room_match.end()
        category = classify_room(room_name)

        # Find closest unused area that is plausible for this room type
        best_area_idx = None
        best_distance = float('inf')
        best_area_val = None

        for area_idx, area_match in enumerate(area_matches):
            if area_idx in used_areas:
                continue

            # Allow area before or after room, but prefer after
            distance = area_match.start() - room_end
            abs_distance = abs(distance)

            # Only consider areas within 50 chars (reduced from 80 for precision)
            if abs_distance <= 50:
                area_val = get_valid_area(area_match)
                if area_val is None:
                    continue

                # Skip if area is implausible for this room type
                if not is_plausible_size(category, area_val):
                    continue

                # Prefer areas AFTER the room name (positive distance)
                # Add penalty for areas before the room
                effective_distance = abs_distance if distance >= 0 else abs_distance + 20

                if effective_distance < best_distance:
                    best_distance = effective_distance
                    best_area_idx = area_idx
                    best_area_val = area_val

        if best_area_idx is not None:
            room_key = (room_name, round(best_area_val, 1))

            if room_key not in seen_rooms:
                seen_rooms.add(room_key)
                rooms.append({
                    "name": room_name,
                    "area": best_area_val,
                    "category": category,
                    "is_biarea": is_biarea(category),
                })
                used_rooms.add(room_idx)
                used_areas.add(best_area_idx)

    # Pass 3: Fallback - match remaining rooms to plausible remaining areas
    unmatched_rooms = [(idx, m) for idx, m in enumerate(room_matches) if idx not in used_rooms]
    unmatched_areas = [(idx, m) for idx, m in enumerate(area_matches) if idx not in used_areas]

    valid_unmatched_areas = []
    for area_idx, area_match in unmatched_areas:
        area_val = get_valid_area(area_match)
        if area_val is not None:
            valid_unmatched_areas.append((area_idx, area_match, area_val))

    # For each unmatched room, try to find a plausible area
    for room_idx, room_match in unmatched_rooms:
        room_name = room_match.group(1).strip().upper()
        room_name = ' '.join(room_name.split())
        category = classify_room(room_name)

        # Find first plausible unused area
        for i, (area_idx, area_match, area_val) in enumerate(valid_unmatched_areas):
            if is_plausible_size(category, area_val):
                room_key = (room_name, round(area_val, 1))

                if room_key not in seen_rooms:
                    seen_rooms.add(room_key)
                    rooms.append({
                        "name": room_name,
                        "area": area_val,
                        "category": category,
                        "is_biarea": is_biarea(category),
                    })
                    valid_unmatched_areas.pop(i)
                    break

    return rooms


def detect_equipment(text: str) -> Dict[str, bool]:
    """
    Detect equipment labels in floor plan text.

    These labels indicate what features are included in the building.
    Based on analysis of 11 real floor plans.
    """
    detected = {
        "has_heat_pump": False,
        "has_laundry": False,
        "has_fireplace": False,
    }

    text_upper = text.upper()

    # Check for heat pump (VP = Värmepump)
    if re.search(r'\bVP\b', text_upper):
        detected["has_heat_pump"] = True
        logger.info("Detected heat pump (VP) in floor plan")

    # Check for laundry (TM = Tvättmaskin, TT = Torktumlare)
    if re.search(r'\b(TM|TT)\b', text_upper):
        detected["has_laundry"] = True
        logger.info("Detected laundry equipment (TM/TT) in floor plan")

    # Check for fireplace (BRASKAMIN, KAMIN)
    if re.search(r'\b(BRASKAMIN|KAMIN)', text_upper):
        detected["has_fireplace"] = True
        logger.info("Detected fireplace in floor plan")

    return detected


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
            description=f"Insulated slab on grade with 300mm EPS under, 100mm edge insulation. Includes reinforcement mesh, radon barrier, and underfloor heating pipes preparation. Rate: 3,500 kr/m² based on 2025 market rates.",
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

        # Patio/terrace door - ONLY if terrace detected
        terrace_rooms = [r for r in rooms if r["category"] == "terrace"]
        if terrace_rooms:
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

    # --- INTERIOR: Appliances ---
    # Appliances - ONLY if kitchen or laundry detected
    has_kitchen = any(r["category"] == "kitchen" for r in rooms)
    has_laundry = any(r["category"] == "laundry" for r in rooms)
    if has_kitchen or has_laundry:
        items.append(CostItem(
            id="interior-appliances",
            phase="interior",  # Moved from completion to interior
            elementName="Kitchen & Laundry Appliances",
            description="Stove, fridge, dishwasher, washer, dryer",
            quantity=1,
            unit="st",
            unitPrice=PRICING["appliances_package"],
            totalCost=PRICING["appliances_package"],
            confidenceScore=0.9,
            guidelineReference="Market Rate"
        ))

    # --- COMPLETION (External Works) ---

    # External works - ONLY if detected in floor plan
    # Terrace/Deck - only if detected (ALTAN, UTEPLATS, TERRASS, etc.)
    terrace_rooms = [r for r in rooms if r["category"] == "terrace"]
    if terrace_rooms:
        terrace_area = sum(r["area"] for r in terrace_rooms)
        items.append(CostItem(
            id="completion-terrace",
            phase="completion",
            elementName="Terrace/Deck",
            description=f"Impregnated wood deck - {terrace_area:.1f} m². Includes foundation, joists, decking boards, railing. Per AMA Hus standards.",
            quantity=terrace_area,
            unit="m²",
            unitPrice=PRICING["terrace_per_m2"],
            totalCost=terrace_area * PRICING["terrace_per_m2"],
            confidenceScore=1.0,  # High confidence - actually detected
            guidelineReference="AMA Hus 23"
        ))

    # NOTE: Entry steps REMOVED - was hardcoded assumption
    # Entry steps should only be included if explicitly shown in floor plan
    # or requested by user. Most floor plans don't show exterior steps.

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

    1. Extract text via Document AI OCR with bounding boxes
    2. Parse room names and areas using SPATIAL matching (2D coordinates)
    3. Detect equipment (heat pump, laundry, fireplace)
    4. Calculate BOA (living area) vs Biarea (secondary area)
    5. Apply wall thickness adjustment for accurate totals
    6. Calculate pricing using fixed rates

    Returns: {
        items: List[CostItem],
        totalArea: float,           # Total gross area (comparable to builder specs)
        boa: float,                 # Living area (BOA) - gross
        biarea: float,              # Secondary area (Biarea) - gross
        rooms: List[Dict],
        equipment: Dict,
        areaBreakdown: Dict         # Detailed area breakdown
    }
    """
    # Step 1: OCR with bounding boxes for spatial matching
    text, text_blocks = extract_text_with_bounding_boxes(image_bytes, mime_type)

    if not text:
        logger.warning("No text extracted, falling back to empty result")
        return {
            "items": [],
            "totalArea": 0,
            "boa": 0,
            "biarea": 0,
            "rooms": [],
            "equipment": {},
            "areaBreakdown": {}
        }

    logger.info(f"Extracted {len(text)} characters from document")

    # Step 2: Parse rooms using SPATIAL matching (uses 2D bounding box coordinates)
    # This fixes issues where adjacent rooms (SOV2/SOV3) get their areas swapped
    rooms = []
    if text_blocks:
        rooms = parse_rooms_with_spatial_matching(text_blocks)
        logger.info(f"Spatial matching found {len(rooms)} rooms")

    # Fallback to text-based matching if spatial matching found too few rooms
    if len(rooms) < 3:
        logger.warning(f"Spatial matching found only {len(rooms)} rooms, falling back to text-based")
        rooms = parse_rooms_from_text(text)
        logger.info(f"Text-based matching found {len(rooms)} rooms")

    summary = parse_summary_areas(text)

    # Step 3: Detect equipment labels (VP, TM, TT, BRASKAMIN, etc.)
    equipment = detect_equipment(text)

    # Step 4: Calculate BOA vs Biarea with wall thickness adjustment
    area_breakdown = calculate_area_breakdown(rooms)

    logger.info(
        f"Found {len(rooms)} rooms | "
        f"BOA: {area_breakdown['boa_gross']} m² | "
        f"Biarea: {area_breakdown['biarea_gross']} m² | "
        f"Total: {area_breakdown['total_gross']} m² | "
        f"Equipment: {equipment}"
    )

    # Step 5: Calculate pricing
    items = calculate_pricing(rooms, summary)

    # Use gross total area (with wall adjustment) as the main totalArea
    # This makes our calculation comparable to builder specifications
    total_area = area_breakdown["total_gross"]

    # If OCR found explicit BOYTA, use that for BOA instead
    if summary.get("boyta", 0) > 0:
        area_breakdown["boa_gross"] = summary["boyta"]
        # Recalculate total if we have both explicit values
        if summary.get("biyta", 0) > 0:
            area_breakdown["biarea_gross"] = summary["biyta"]
        total_area = area_breakdown["boa_gross"] + area_breakdown["biarea_gross"]

    return {
        "items": [item.model_dump() for item in items],
        "totalArea": round(total_area, 1),
        "boa": area_breakdown["boa_gross"],                 # Living area (gross)
        "biarea": area_breakdown["biarea_gross"],           # Secondary area (gross)
        "rooms": rooms,
        "equipment": equipment,
        "areaBreakdown": area_breakdown,                    # Full breakdown for transparency
        "summary": {
            "boyta": summary.get("boyta", 0),
            "byggyta": summary.get("byggyta", 0),
            "room_count": len(rooms),
            "bedroom_count": len([r for r in rooms if r["category"] == "bedroom"]),
            "bathroom_count": len([r for r in rooms if r["category"] == "bathroom"]),
            "boa_rooms": len([r for r in rooms if not r.get("is_biarea", False)]),
            "biarea_rooms": len([r for r in rooms if r.get("is_biarea", False)]),
        },
        "extracted_text": text[:500]  # For debugging
    }
