# Swedish Area Measurement Terms

A guide to Swedish area terminology used in floor plans and real estate.

---

## Primary Area Terms

| Term | Swedish Full | English | Description |
|------|--------------|---------|-------------|
| **BOA** | Boarea | Living Area | Heated, habitable floor space. Includes bedrooms, kitchen, living room, bathrooms, hallways. This is the main "living area" number. |
| **BOYTA** | Boarea yta | Living Area | Same as BOA - alternative spelling used in floor plan summaries. |
| **BIAREA** | Biarea | Secondary Area | Unheated or non-habitable space. Includes garage, unheated storage, unheated basement, carport. |
| **BIYTA** | Biarea yta | Secondary Area | Same as BIAREA - alternative spelling used in floor plan summaries. |

---

## Gross Area Terms

| Term | Swedish Full | English | Description |
|------|--------------|---------|-------------|
| **BTA** | Bruttoarea | Gross Area | Total floor area INCLUDING wall thickness. BTA ≈ BOA × 1.035 (walls add ~3.5%). |
| **BRA** | Bruksarea | Usable Area | Similar to BTA - the total usable floor area including walls. |
| **NTA** | Nettoarea | Net Area | Interior floor area EXCLUDING walls. This is what OCR reads from room labels. |

---

## Building Terms

| Term | Swedish Full | English | Description |
|------|--------------|---------|-------------|
| **BYGGYTA** | Byggyta | Building Footprint | The building's ground footprint area. Used for plot coverage calculations. |
| **VÅNINGSYTA** | Våningsyta | Floor Area | Area of a single floor/story. |
| **TOMTYTA** | Tomtyta | Plot Area | Total land/plot area. |

---

## Key Relationships

```
NTA (Net) → BOA (Living) → BTA (Gross)
         +3.5% walls    +exterior walls
```

### Conversion Formulas

1. **NTA to BOA**: `BOA ≈ NTA × 1.035` (add 3.5% for interior walls)
2. **Room areas to BOA**: Sum of labeled room areas × 1.035
3. **BOA + BIAREA = Total Area**: Living area + secondary area

### What's Included in Each

**BOA (Living Area) includes:**
- Bedrooms (SOVRUM, SOV)
- Living room (VARDAGSRUM)
- Kitchen (KÖK)
- Bathrooms (WC, BAD)
- Laundry (TVÄTT)
- Entry/hallways (ENTRÉ, HALL)
- Walk-in closets (KLK, KLÄDKAMMARE)
- Utility rooms if heated (GROVKÖK)

**BIAREA (Secondary Area) includes:**
- Garage (GARAGE)
- Storage rooms if unheated (FÖRRÅD, KALLFÖRRÅD)
- Carport (CARPORT)
- Unheated basement (KÄLLARE)
- Attic storage (VIND)

---

## Floor Plan Summary Block

Swedish floor plans typically include a summary block showing:

```
ENTRÉPLAN          (Entry floor / Ground floor)
BOYTA: 130.7m²     (Living area)
BTA: 184.9m²       (Gross area)
BIYTA: 34.0m²      (Secondary area)
BYGGYTA: 187.3m²   (Building footprint)
```

---

## Common Measurement Notes

1. **Unlabeled corridors**: Hallways connecting rooms are often not labeled separately but ARE included in BOYTA totals.

2. **Wall thickness**: Swedish standard SS 21054:2009 defines how areas are measured. Interior walls typically add 3-4% to net room areas.

3. **Garage in BIAREA**: Garages are always BIAREA (secondary), never BOA, because they're unheated/non-habitable.

4. **Open floor plans**: Combined rooms like "KÖK/VARDAGSRUM" show the total area of the open space.

---

## Standards Reference

- **SS 21054:2009**: Swedish standard for area measurement in buildings
- **Svensk Mäklarsamfund**: Swedish real estate association guidelines
- **Säker Vatten**: Plumbing/wet room standards (not area-related but often referenced)

---

## Example Calculation

For a house with labeled rooms totaling 120 m² NTA:

```
Room areas (NTA):     120.0 m²
+ Wall thickness:     ×1.035
= BOA:                124.2 m²
+ Garage (30 m²):     + 30.0 m² BIAREA
= Total Area:         154.2 m²
```
