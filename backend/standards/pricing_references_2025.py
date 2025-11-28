"""
KGVilla Pricing References - Sweden 2025

All prices are based on Swedish market data from reputable sources.
Prices are updated for 2025 and include material + labor unless otherwise noted.

IMPORTANT: When changing any price, update the source reference and verification date.

Sources Key:
- byggstart.se: Large Swedish construction price aggregator
- bygglov.se: Government-affiliated building permit information
- scb.se: Statistics Sweden (official government statistics)
- greenmatch.se: Energy efficiency pricing database
- husexperter.se: Expert construction guides
"""

from dataclasses import dataclass
from typing import Optional
from datetime import date

@dataclass
class PriceReference:
    """A price with its source reference."""
    value: float
    unit: str
    source_name: str
    source_url: str
    verification_date: str  # YYYY-MM
    market_range_low: Optional[float] = None
    market_range_high: Optional[float] = None
    notes: Optional[str] = None

# =============================================================================
# GROUND WORK / MARKARBETE
# =============================================================================

EXCAVATION_PER_M2 = PriceReference(
    value=1000,  # CORRECTED from 300
    unit="kr/m²",
    source_name="Bygglov.se",
    source_url="https://bygglov.se/guide/utomhus/schaktning",
    verification_date="2025-11",
    market_range_low=500,
    market_range_high=1500,
    notes="Schaktning och markberedning. Range varies by soil conditions."
)

DRAINAGE_PER_M = PriceReference(
    value=400,  # CORRECTED from 150
    unit="kr/m",
    source_name="Bygglov.se",
    source_url="https://bygglov.se/guide/utomhus/schaktning",
    verification_date="2025-11",
    market_range_low=300,
    market_range_high=600,
    notes="Perimeter drainage system"
)

FOUNDATION_PER_M2 = PriceReference(
    value=3500,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/gjuta-platta",
    verification_date="2025-11",
    market_range_low=1500,
    market_range_high=4000,
    notes="Platta på mark inkl isolering 300mm, armering, betong. Exkl golvvärme."
)

# =============================================================================
# STRUCTURE / STOMME
# =============================================================================

EXTERIOR_WALL_PER_M2 = PriceReference(
    value=3800,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=3000,
    market_range_high=4500,
    notes="Timber frame 45x220mm, mineral wool, sheathing, vapor barrier"
)

ROOF_PER_M2 = PriceReference(
    value=2200,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=1800,
    market_range_high=2800,
    notes="Pitched roof with concrete tiles, includes trusses and insulation"
)

WINDOW_PER_M2 = PriceReference(
    value=8500,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=6000,
    market_range_high=12000,
    notes="Triple-glazed windows, installed"
)

EXTERIOR_DOOR = PriceReference(
    value=25000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=15000,
    market_range_high=40000,
    notes="Insulated entry door with frame, installed"
)

INTERIOR_DOOR = PriceReference(
    value=8500,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=5000,
    market_range_high=12000,
    notes="Standard interior door with frame, installed"
)

# =============================================================================
# FLOORING / GOLV
# =============================================================================

FLOORING_PARQUET_PER_M2 = PriceReference(
    value=850,
    unit="kr/m²",
    source_name="Hernogolv.se",
    source_url="https://hernogolv.se/lagga-golv-kostnad/",
    verification_date="2025-11",
    market_range_low=650,
    market_range_high=1200,
    notes="Parquet flooring material + installation"
)

FLOORING_TILE_PER_M2 = PriceReference(
    value=1600,
    unit="kr/m²",
    source_name="Qicon.se",
    source_url="https://qicon.se/pris/kakel-badrum/",
    verification_date="2025-11",
    market_range_low=1200,
    market_range_high=2500,
    notes="Ceramic tile flooring material + installation"
)

FLOORING_BASIC_PER_M2 = PriceReference(
    value=450,
    unit="kr/m²",
    source_name="Proffsmagasinet.se",
    source_url="https://www.proffsmagasinet.se/kunskapsportalen/guider/prisguide-golv",
    verification_date="2025-11",
    market_range_low=300,
    market_range_high=600,
    notes="Basic flooring for storage/utility rooms"
)

FLOORING_GARAGE_PER_M2 = PriceReference(
    value=350,
    unit="kr/m²",
    source_name="Proffsmagasinet.se",
    source_url="https://www.proffsmagasinet.se/kunskapsportalen/guider/prisguide-golv",
    verification_date="2025-11",
    market_range_low=250,
    market_range_high=500,
    notes="Epoxy or sealed concrete garage floor"
)

# =============================================================================
# WALLS & CEILING / VÄGGAR & TAK
# =============================================================================

INTERIOR_WALL_STANDARD_PER_M2 = PriceReference(
    value=1450,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=1000,
    market_range_high=1800,
    notes="Gypsum board wall with paint finish"
)

INTERIOR_WALL_WETROOM_PER_M2 = PriceReference(
    value=4200,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/renovera-badrum",
    verification_date="2025-11",
    market_range_low=3500,
    market_range_high=5500,
    notes="Wet room walls with full waterproofing per Säker Vatten 2021:2"
)

CEILING_STANDARD_PER_M2 = PriceReference(
    value=350,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=250,
    market_range_high=500,
    notes="Gypsum ceiling with paint"
)

PAINTING_PER_M2 = PriceReference(
    value=180,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=120,
    market_range_high=250,
    notes="Interior painting, 2 coats"
)

# =============================================================================
# BATHROOM / BADRUM
# =============================================================================

WC_UNIT = PriceReference(
    value=14000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/renovera-badrum",
    verification_date="2025-11",
    market_range_low=8000,
    market_range_high=25000,
    notes="Wall-hung WC with concealed cistern, installed"
)

WASHBASIN_UNIT = PriceReference(
    value=6000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/renovera-badrum",
    verification_date="2025-11",
    market_range_low=3000,
    market_range_high=12000,
    notes="Porcelain basin with mixer tap, installed"
)

SHOWER_UNIT = PriceReference(
    value=8000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/renovera-badrum",
    verification_date="2025-11",
    market_range_low=5000,
    market_range_high=15000,
    notes="Shower with mixer and rain head, installed"
)

FLOOR_DRAIN = PriceReference(
    value=6500,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/renovera-badrum",
    verification_date="2025-11",
    market_range_low=4000,
    market_range_high=10000,
    notes="Wet room floor drain per Säker Vatten"
)

BATHROOM_ACCESSORIES = PriceReference(
    value=8000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/renovera-badrum",
    verification_date="2025-11",
    market_range_low=5000,
    market_range_high=15000,
    notes="Mirror, cabinet, towel rails per bathroom"
)

# =============================================================================
# KITCHEN / KÖK
# =============================================================================

KITCHEN_BASE = PriceReference(
    value=85000,
    unit="kr/st",
    source_name="Husexperter.se",
    source_url="https://www.husexperter.se/pris/vad-kostar-koksrenovering",
    verification_date="2025-11",
    market_range_low=50000,
    market_range_high=200000,
    notes="Budget kitchen (IKEA level) with countertop and installation"
)

APPLIANCES_PACKAGE = PriceReference(
    value=65000,
    unit="kr/st",
    source_name="Husexperter.se",
    source_url="https://www.husexperter.se/pris/vad-kostar-koksrenovering",
    verification_date="2025-11",
    market_range_low=40000,
    market_range_high=100000,
    notes="Stove, fridge, dishwasher, washer, dryer"
)

# =============================================================================
# HVAC / VVS
# =============================================================================

HEAT_PUMP = PriceReference(
    value=120000,
    unit="kr/st",
    source_name="Greenmatch.se",
    source_url="https://www.greenmatch.se/luftvaermepump/luft-vattenvaermepump/pris",
    verification_date="2025-11",
    market_range_low=95000,
    market_range_high=195000,
    notes="Luft-vatten värmepump 8-10kW with installation"
)

FTX_VENTILATION = PriceReference(
    value=85000,
    unit="kr/st",
    source_name="FTXsystem.se",
    source_url="https://www.ftxsystem.se/blog-posts/vad-kostar-ftxsystem",
    verification_date="2025-11",
    market_range_low=70000,
    market_range_high=150000,
    notes="FTX system with heat recovery for villa 120-160 m²"
)

UNDERFLOOR_HEATING_PER_M2 = PriceReference(
    value=450,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/renovera-badrum",
    verification_date="2025-11",
    market_range_low=300,
    market_range_high=700,
    notes="Electric/water underfloor heating in wet rooms"
)

RADIATOR = PriceReference(
    value=4500,
    unit="kr/st",
    source_name="Greenmatch.se",
    source_url="https://www.greenmatch.se/luftvaermepump/luft-vattenvaermepump/pris",
    verification_date="2025-11",
    market_range_low=3000,
    market_range_high=8000,
    notes="Panel radiator with installation"
)

PLUMBING_BASE = PriceReference(
    value=45000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/renovera-badrum",
    verification_date="2025-11",
    market_range_low=30000,
    market_range_high=70000,
    notes="Basic plumbing system - pipes, connections"
)

WATER_HEATER = PriceReference(
    value=15000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/renovera-badrum",
    verification_date="2025-11",
    market_range_low=10000,
    market_range_high=25000,
    notes="Hot water tank/cylinder"
)

# =============================================================================
# ELECTRICAL / EL
# =============================================================================

SOCKET = PriceReference(
    value=1800,  # CORRECTED from 1400
    unit="kr/st",
    source_name="Husexperter.se",
    source_url="https://www.husexperter.se/pris/vad-kostar-elektriker",
    verification_date="2025-11",
    market_range_low=1500,
    market_range_high=2500,
    notes="New electrical outlet installation"
)

SPOTLIGHT = PriceReference(
    value=1600,
    unit="kr/st",
    source_name="Husexperter.se",
    source_url="https://www.husexperter.se/pris/vad-kostar-elektriker",
    verification_date="2025-11",
    market_range_low=1200,
    market_range_high=2000,
    notes="Recessed spotlight installation"
)

DISTRIBUTION_BOARD = PriceReference(
    value=22000,
    unit="kr/st",
    source_name="Husexperter.se",
    source_url="https://www.husexperter.se/pris/vad-kostar-elektriker",
    verification_date="2025-11",
    market_range_low=15000,
    market_range_high=35000,
    notes="Main electrical panel"
)

LIGHTING_FIXTURES = PriceReference(
    value=25000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=15000,
    market_range_high=50000,
    notes="Complete lighting package for villa"
)

# =============================================================================
# EXTERIOR FINISHING / UTVÄNDIGT
# =============================================================================

FACADE_CLADDING_PER_M2 = PriceReference(
    value=1200,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=800,
    market_range_high=1800,
    notes="Timber panel or render facade"
)

EXTERIOR_PAINT_PER_M2 = PriceReference(
    value=180,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=120,
    market_range_high=250,
    notes="Exterior paint, 2 coats"
)

GUTTERS_PER_M = PriceReference(
    value=650,
    unit="kr/m",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=400,
    market_range_high=900,
    notes="Gutters and downpipes"
)

SOFFIT_PER_M = PriceReference(
    value=450,
    unit="kr/m",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=300,
    market_range_high=600,
    notes="Soffit and fascia boards"
)

DRIVEWAY_PER_M2 = PriceReference(
    value=450,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=300,
    market_range_high=800,
    notes="Gravel or stone driveway"
)

TERRACE_PER_M2 = PriceReference(
    value=2500,
    unit="kr/m²",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=1500,
    market_range_high=4000,
    notes="Wooden deck/terrace"
)

ENTRY_STEPS = PriceReference(
    value=15000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=8000,
    market_range_high=25000,
    notes="Entry steps with railing"
)

# =============================================================================
# CONNECTIONS / ANSLUTNINGAR
# =============================================================================

VA_CONNECTION = PriceReference(
    value=120000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=80000,
    market_range_high=200000,
    notes="Municipal water and sewer connection"
)

EL_CONNECTION = PriceReference(
    value=35000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=20000,
    market_range_high=60000,
    notes="Electrical grid connection"
)

# =============================================================================
# FEES & PERMITS / AVGIFTER
# =============================================================================

BYGGLOV = PriceReference(
    value=40000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=25000,
    market_range_high=70000,
    notes="Building permit fee (varies by municipality)"
)

KA_FEE = PriceReference(
    value=35000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=25000,
    market_range_high=50000,
    notes="Kontrollansvarig (certified inspector)"
)

CLIMATE_DECLARATION = PriceReference(
    value=20000,
    unit="kr/st",
    source_name="Boverket.se",
    source_url="https://www.boverket.se/sv/byggande/hallbart-byggande-och-forvaltning/klimatdeklaration/",
    verification_date="2025-11",
    market_range_low=15000,
    market_range_high=30000,
    notes="Klimatdeklaration (mandatory from 2022)"
)

CONSTRUCTION_INSURANCE = PriceReference(
    value=25000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=15000,
    market_range_high=40000,
    notes="Byggförsäkring"
)

PROJECT_MANAGEMENT = PriceReference(
    value=60000,
    unit="kr/st",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=40000,
    market_range_high=100000,
    notes="Project management/coordination"
)

# =============================================================================
# PERCENTAGES / PROCENTSATSER
# =============================================================================

SITE_OVERHEAD_PCT = PriceReference(
    value=0.05,
    unit="% of total",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=0.03,
    market_range_high=0.08,
    notes="Scaffolding, containers, waste management (5%)"
)

CONTINGENCY_PCT = PriceReference(
    value=0.10,
    unit="% of total",
    source_name="Byggstart.se",
    source_url="https://www.byggstart.se/pris/bygga-hus",
    verification_date="2025-11",
    market_range_low=0.05,
    market_range_high=0.15,
    notes="Risk margin / contingency (10%)"
)

# =============================================================================
# HELPER FUNCTION
# =============================================================================

def get_price_with_source(price_ref: PriceReference) -> dict:
    """
    Returns a dictionary with price value and source information.
    Use this when generating cost items to include source references.
    """
    return {
        "value": price_ref.value,
        "unit": price_ref.unit,
        "source": {
            "name": price_ref.source_name,
            "url": price_ref.source_url,
            "verified": price_ref.verification_date,
            "range": f"{price_ref.market_range_low}-{price_ref.market_range_high}" if price_ref.market_range_low else None
        }
    }
