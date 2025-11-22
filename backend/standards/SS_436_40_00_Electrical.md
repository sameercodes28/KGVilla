# SS 436 40 00 - Electrical Installation Standards (Edition 4)

## Overview
This is the "Bible" for Swedish electricians. Compliance is mandatory for insurance coverage and legal safety (Elsäkerhetslagen).

## Critical Rules for Residential (Villas)

### 1. Grounding & Bonding (Jordning)
**Rule:** All conductive parts (pipes, boiler frames) must be equipotentially bonded.
**Cost:** Requires specific copper bonding wires (PUS-skena) and clamps.

### 2. Residual Current Devices (Jordfelsbrytare)
**Rule:** **Mandatory** for all socket outlets up to 32A and lighting circuits in homes.
**Impact:** The distribution board (elcentral) is more expensive as it requires RCDs (JFB).

### 3. Socket Placement
**Rule:** 
- **Kitchen:** Outlets must be placed safely away from sinks (zoning).
- **Outdoors:** Must be IP44 rated.
**AI Task:** The AI should identify if a socket on the plan is too close to a water source and flag it.

### 4. Cables in Walls
**Rule:** Cables must be routed either horizontally or vertically (not diagonal) or be protected.
**Cost:** Affects the quantity of flex pipe (flexslang) needed. A diagonal run is shorter but illegal; our calculator must sum the **manhattan distance** (X + Y), not the direct line.

## Relevance to KGVilla
- **Estimation Logic:** When calculating cable length, use `(Length + Width + Height)` logic to simulate running cables along walls/ceilings, never straight lines.
- **Component Selection:** If a room is a "Bathroom", force IP44 components in the cost breakdown.
