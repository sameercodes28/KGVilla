# Understanding Area Measurements in KGVilla

This guide explains how KGVilla measures and reports floor plan areas, and why our numbers match what builders specify.

---

## The Two Types of Area

When you upload a floor plan, KGVilla separates the space into two categories:

### BOA (Boarea) - Living Area
This is your actual living space - the rooms where you spend your time.

**Includes:**
- Bedrooms (SOVRUM, SOV)
- Living room (VARDAGSRUM)
- Kitchen (KÖK)
- Bathrooms (WC, BAD)
- Entry/hallway (ENTRÉ)
- Laundry (TVÄTT)
- Walk-in closets (KLK)

**Why it matters:** This is the number you compare when shopping for houses. A 140m² BOA house has 140m² of actual living space.

### Biarea - Secondary Area
These are useful spaces, but not counted as "living area" in Swedish standards.

**Includes:**
- Garage (GARAGE)
- Storage rooms (FÖRRÅD)
- Technical rooms (TEKNIKRUM)
- Carport (CARPORT)

**Why it matters:** Garage and storage are built differently (simpler finishes, may not be heated) so they cost less per square meter to build.

---

## How We Calculate Areas

### Step 1: Read Room Labels
The floor plan shows each room with its area, like:
- SOVRUM 1: 13.7 m²
- KÖK: 12.5 m²
- GARAGE: 33.7 m²

### Step 2: Classify Each Room
We automatically determine if each room is BOA or Biarea based on its Swedish name.

### Step 3: Add Wall Thickness
Here's a key insight: **floor plan labels show the space inside the walls** (called "Net Area" or NTA).

But builders report **Gross Area** which includes the wall thickness.

We add **3.5%** to account for walls. This is based on typical Swedish construction with 100-120mm inner walls.

---

## Example: JB Villan Hus 1405

| What we read | BOA | Biarea | Total |
|--------------|-----|--------|-------|
| Room labels (net) | 134.6 m² | 48.4 m² | 183.0 m² |
| + Wall adjustment (+3.5%) | 139.3 m² | 50.1 m² | 189.4 m² |

| Builder specification | BOA | Biarea | Total |
|----------------------|-----|--------|-------|
| JB Villan website | 140.2 m² | 49.3 m² | 189.5 m² |

**Difference: Less than 0.5 m²!** Our calculation matches the builder almost exactly.

---

## Why This Matters for Pricing

### Cost per m² is Based on BOA
When comparing house prices, always use BOA (living area).

Example:
- Total cost: 4,676,000 kr
- BOA: 140 m²
- **Cost per m² = 33,400 kr/m²**

This is the industry standard for comparing building costs.

### Different Areas Have Different Costs
| Area Type | Typical Cost |
|-----------|--------------|
| BOA (Living space) | 25,000 - 35,000 kr/m² |
| Biarea (Garage) | 8,000 - 12,000 kr/m² |
| Biarea (Storage) | 10,000 - 15,000 kr/m² |

This is why we separate them - a 50m² garage doesn't cost the same as 50m² of bedrooms!

---

## What You See in KGVilla

### Project Cards
Shows: `139 BOA + 50 Bi m²`
- 139 = Living area
- 50 = Garage/storage

### Summary Section
Shows the full breakdown:
- BOA: 139.3 m²
- Biarea: 50.1 m²
- Total: 189.4 m²
- Cost per m² (based on BOA): 33,400 kr/m²

---

## Swedish Terms Quick Reference

| Swedish | English | Category |
|---------|---------|----------|
| BOA / Boarea | Living area | - |
| Biarea | Secondary area | - |
| SOVRUM / SOV | Bedroom | BOA |
| VARDAGSRUM | Living room | BOA |
| KÖK | Kitchen | BOA |
| WC / BAD | Bathroom | BOA |
| ENTRÉ | Entry | BOA |
| TVÄTT | Laundry | BOA |
| GARAGE | Garage | Biarea |
| FÖRRÅD | Storage | Biarea |

---

## Questions?

**Q: Why doesn't my total area match exactly?**
A: Small differences (< 1-2 m²) are normal due to rounding and measurement methods. Our wall thickness factor (3.5%) is an industry average.

**Q: Why do you separate BOA and Biarea?**
A: Swedish building standards (SS 21054:2009) require this separation. It's how builders, banks, and insurance companies measure houses.

**Q: Can I compare prices between different houses?**
A: Yes! Always compare using BOA (living area) per m². This is the standard metric.
