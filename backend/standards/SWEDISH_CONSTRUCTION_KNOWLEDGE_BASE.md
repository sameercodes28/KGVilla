# SWEDISH RESIDENTIAL COST ESTIMATION KNOWLEDGE BASE (2025)

## STRATEGY: ASSEMBLY-BASED PRICING
Do not just count "walls". You must identify the **Assembly Type** (Recipe) and calculate the cost of that assembly per m² or unit.

---

## SECTION 1: ASSEMBLY RECIPES (Material + Labor)

### 1. EXTERIOR WALLS (Ytterväggar)
*   **Type:** Standard Prefab/Stick-built 260mm+ insulation.
*   **Components:**
    *   Facade (Panel/Plaster)
    *   Air Gap (Spikläkt)
    *   Wind Barrier (Vindduk/Skiva)
    *   Studs 195mm + Insulation (Mineral Wool)
    *   Vapor Barrier (Plastfolie)
    *   Installations Layer (45mm studs + insulation) - *Crucial for electrical*
    *   OSB/Plywood (11-15mm)
    *   Gypsum Board (13mm)
*   **Unit Price:** **3,800 kr/m²** (gross wall area).

### 2. INTERIOR WALLS - STANDARD (Innerväggar)
*   **Type:** 70mm Steel/Wood Studs (cc 450/600).
*   **Components:**
    *   Gypsum (13mm) x 2 sides
    *   OSB/Plywood (11mm) x 2 sides (Standard in quality villas for hanging items)
    *   Insulation (45-70mm) - *For sound dampening*
    *   Studs
*   **Unit Price:** **1,450 kr/m²**.

### 3. INTERIOR WALLS - WET ROOM (Våtrumsvägg)
*   **Type:** Rigid construction for tiles (Säker Vatten compliant).
*   **Components:**
    *   Studs (cc 300mm extra stability)
    *   15mm Plywood (specific for wet rooms)
    *   Humid Board (Våtrumsskiva)
    *   Waterproofing System (Foil + Corners + Collars)
    *   Ceramic Tiles + Grout
*   **Unit Price:** **4,200 kr/m²**.

### 4. FLOORS (Golvkonstruktion)
*   **Slab on Grade (Platta på mark):**
    *   Excavation, Geotextile, Macadam (drainage), 300mm EPS Foam, Rebar, Concrete, UFH Pipes.
    *   **Price:** **3,500 kr/m²** (Foundation only).
*   **Inter-floor Structure (Mellanbjälklag):**
    *   Wood joists (220mm), Insulation, Chipboard floor, Secondary spacing, Gypsum ceiling below.
    *   **Price:** **2,800 kr/m²**.

---

## SECTION 2: SURFACE FINISHES (Ytskikt)

### FLOORING (Material + Installation)
*   **Parquet (Ekparkett 3-stav):** 850 kr/m² (incl. foam underlay + skirtings).
*   **Tiles (Klinker - Hall/Laundry):** 1,500 kr/m² (incl. adhesive, joint).
*   **Bathroom Floor (Klinker + Slope):** 2,500 kr/m² (requires specialized labor for slope).

### WALL FINISH
*   **Painting/Wallpaper:** 350 kr/m² (Spackling + Primer + 2 coats).
*   **Bathroom Walls (Kakel):** 1,800 kr/m² (Tiles + Fixing).

### CEILING
*   **Gypsum + Paint:** 450 kr/m².

---

## SECTION 3: SYSTEM INFERENCE RULES (Hidden Costs)

Since architectural drawings often hide technical systems, you must **INFER** them based on room type.

### IF Room == "KÖK" (Kitchen)
1.  **Add Electrical:**
    *   1x Perimter/4m (General Sockets).
    *   **Dedicated Feeds (Heavy Load):** 1x Stove (400V), 1x Oven, 1x Dishwasher, 1x Micro. (~5,000 kr extra).
    *   **Lighting:** 1x Ceiling Point + Undercabinet lighting logic (approx 3m LED strip).
2.  **Add Plumbing:**
    *   **Leakage Tray (Läckageskydd):** MANDATORY for DW/Fridge/Freezer. Add 3x 400 kr.
    *   **Water:** Hot/Cold feeds + Ballofix valves.

### IF Room == "BAD" / "WC" (Bathroom)
1.  **Add Plumbing:**
    *   **Floor Drain (Golvbrunn):** 1x per Shower/Bathtub symbol. Cost: **6,500 kr** (install + waterproofing collar).
    *   **Commode:** Wall-hung is standard modern. Cost: **12,000 kr** (Module + Porcelain + Button).
2.  **Add Electrical:**
    *   **Spotlights:** Standard is 1 spot per 1.5m².
    *   **Floor Heating (Electric):** Often added even if water heating exists, for comfort in summer.

### IF Room == "TEK" / "GROV" (Utility/Technical)
1.  **Add The "Heart":**
    *   **Heat Pump (Frånluftsvärmepump):** Standard NIBE F730 or similar. **Cost: 125,000 kr**.
    *   **Distribution Cabinet (Vatten):** **5,000 kr**.
    *   **Fuse Box (Elcentral):** **25,000 kr**.

---

## SECTION 4: CALCULATION LOGIC

1.  **Scale:** Identify a door (standard 900mm or 1000mm) or a dimension text to set scale.
2.  **Wall Area:** `Perimeter * 2.5m (Ceiling Height) - Window/Door Areas`.
3.  **Waste Factor:**
    *   Gypsum/Wood: +15%
    *   Flooring: +10%
    *   Tiles: +10%
4.  **Client Costs (Soft Costs):** ALWAYS add these fixed costs for a new house:
    *   Connection Fees (El + VA): **350,000 kr**.
    *   Permits & QA (Bygglov + KA): **70,000 kr**.
    *   Insurance/Electricity during build: **25,000 kr**.
