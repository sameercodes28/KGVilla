# How KGVilla Analyzes Your Floor Plan

This guide explains what happens when you upload a floor plan and how the pricing is calculated.

---

## The Analysis Process

### 1. Upload Your Floor Plan
Supported formats: JPG, PNG, PDF
Best results: Clear, high-resolution architectural drawings with room labels.

### 2. OCR Text Extraction
We use Google Document AI to read all text from your floor plan:
- Room names (SOVRUM, KÖK, VARDAGSRUM...)
- Room areas (12.5 m², 33.7 m²...)
- Equipment labels (VP, TM, TT...)
- Dimension lines (7290, 8460...)

### 3. Room Detection
We identify each room by matching Swedish naming patterns:

| If we see... | We identify it as... |
|--------------|---------------------|
| SOVRUM 1, SOV 2 | Bedroom |
| KÖK, KÖK/MATPLATS | Kitchen |
| VARDAGSRUM, ALLRUM | Living room |
| WC, WC/BAD, BADRUM | Bathroom |
| TVÄTT, GROVENTRÉ | Laundry/Utility |
| GARAGE | Garage |
| FÖRRÅD | Storage |

### 4. Equipment Detection
We scan for equipment labels that indicate features:

| Label | What it means | What we add |
|-------|---------------|-------------|
| VP | Heat pump present | Heat pump already included |
| TM/TT | Washer/dryer | Laundry appliances |
| BRASKAMIN | Fireplace | Fireplace noted (special feature) |

### 5. Area Calculation
- Sum up all room areas
- Classify as BOA (living) or Biarea (secondary)
- Add 3.5% for wall thickness
- Compare with any BOYTA/BIYTA totals on the plan

### 6. Cost Calculation
Based on detected rooms and areas, we calculate:
- Foundation and ground works
- Structure and roof
- Electrical systems
- Plumbing and HVAC
- Interior finishes
- Mandatory fees and permits

---

## What We ONLY Price If Detected

**Important:** We never assume features exist. We only include items we actually see in your floor plan.

### Items Added Only When Detected:
| Feature | Added when we see... |
|---------|---------------------|
| Terrace/Deck | ALTAN, UTEPLATS, TERRASS |
| Patio Door | Terrace room detected |
| Appliances | Kitchen or laundry room |
| Fireplace | BRASKAMIN, KAMIN |

### Items We Never Assume:
- Entry steps (varies by site)
- Driveway (site-specific)
- Landscaping (not shown on floor plans)
- Outdoor lighting (not standard)

---

## Understanding Combined Rooms

Swedish floor plans often show open-plan areas with "/" between names:

| What you see | What it means |
|--------------|---------------|
| KÖK/MATPLATS | Kitchen with dining area |
| KÖK/VARDAGSRUM | Open kitchen/living |
| GROVENTRÉ/TVÄTT | Utility entrance with laundry |
| WC/BAD | Toilet and bathroom combined |
| WC/D | Toilet with shower |

We handle these as single rooms with appropriate pricing.

---

## The Cost Breakdown

After analysis, you see costs organized by construction phase:

### Ground Works
- Excavation and site preparation
- Foundation (Platta på mark)
- Drainage systems

### Structure & Roof
- Exterior walls
- Roof structure and covering
- Windows and exterior doors
- Insulation

### Electrical
- Distribution panel
- Sockets and switches
- Lighting

### Plumbing & HVAC
- Water supply and drainage
- Heat pump
- Ventilation (FTX)
- Bathroom fixtures

### Interior
- Flooring by room type
- Walls (standard and wet room)
- Kitchen installation
- Interior doors

### Admin/Permits
- Building permit (Bygglov)
- Certified inspector (KA)
- Climate declaration
- Insurance

---

## Why Prices Vary by Room Type

Different rooms need different finishes:

### Bedrooms & Living Rooms
- Parquet flooring: 850 kr/m²
- Standard walls: 1,450 kr/m²
- Basic electrical: ~6 points/room

### Bathrooms & Wet Rooms
- Tile flooring: 1,600 kr/m²
- Waterproofed walls: 4,200 kr/m² (Säker Vatten compliant)
- Underfloor heating
- Full plumbing fixtures

### Kitchen
- Tile flooring: 1,600 kr/m²
- Cabinet installation: 85,000 kr
- Heavy electrical (stove, oven)
- Plumbing (sink, dishwasher)

### Garage
- Concrete/epoxy floor: 350 kr/m²
- Basic walls: 800 kr/m²
- Fire-rated door to house (EI30)
- Minimal electrical

---

## Tips for Best Results

1. **Use clear floor plans** - Architectural drawings with room labels work best
2. **Include area annotations** - Plans showing m² for each room are ideal
3. **Swedish language works best** - Our OCR is optimized for Swedish room names
4. **Higher resolution = better accuracy** - At least 150 DPI recommended

---

## Compliance & Standards

All pricing follows Swedish building standards:

- **BBR 2025** - Building regulations
- **Säker Vatten 2021:2** - Wet room requirements
- **SS 21054:2009** - Area measurement standards
- **ABT 06** - Contract standards (12% risk premium included)
- **AMA Hus** - Construction specifications

---

## Common Questions

**Q: Why is my bathroom so expensive?**
A: Swedish regulations (Säker Vatten) require extensive waterproofing. Wet room walls cost ~3x standard walls to ensure no water damage.

**Q: What if a room isn't detected?**
A: You can manually add items using the "Add Item" form at the bottom of the cost list.

**Q: How accurate is the estimate?**
A: Our estimates are within ±10-15% of actual costs for typical Swedish villas. Complex or unique designs may vary more.

**Q: Can I adjust prices?**
A: Yes! Click any item to edit quantities or unit prices. Your changes are saved and marked as "Edited".
