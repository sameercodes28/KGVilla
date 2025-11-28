# JB Villan Efficiency Pricing

## Overview

JB Villan is a Swedish prefab house manufacturer based in Kalix. Their business model differs significantly from traditional general contractors, resulting in approximately **12% lower construction costs**.

## JB Villan Business Model

### Factory Manufacturing Advantages

1. **Pre-manufactured Wall Panels**
   - Walls built in factory with optimized material cuts
   - Reduces on-site labor and waste
   - Weather-independent production

2. **Pre-assembled Roof Trusses**
   - Factory-produced trusses delivered ready to install
   - Faster installation time
   - Consistent quality control

3. **Standardized Designs**
   - Repeatable designs allow volume purchasing
   - Optimized material lists
   - Reduced engineering costs per house

4. **Efficient Logistics**
   - Just-in-time delivery to site
   - Reduced site storage requirements
   - Coordinated installation schedules

## Efficiency Types

KGVilla categorizes JB Villan's cost advantages into three types:

### PREFAB (Green Badge)
True factory manufacturing where components are built off-site.

| Component | General Contractor | JB Villan | Savings |
|-----------|-------------------|-----------|---------|
| Exterior Walls | 3,800 kr/m² | 2,800 kr/m² | 26% |
| Roof | 2,200 kr/m² | 1,800 kr/m² | 18% |
| Interior Walls | 1,450 kr/m² | 1,200 kr/m² | 17% |

**Why:** Factory manufacturing enables optimized material cuts, weather-independent production, pre-installed insulation/vapor barriers, and reduced on-site skilled labor requirements.

### STREAMLINED (Blue Badge)
Benefits from faster build time (downstream effect of prefab).

| Component | General Contractor | JB Villan | Savings |
|-----------|-------------------|-----------|---------|
| Site Overhead | 5% of project | 3% of project | 40% |

**Why:** Prefab walls and roof go up in days instead of weeks. This means fewer weeks of scaffolding rental, site container rental, temporary power, waste removal, and site management costs.

### STANDARDIZED (Purple Badge)
Benefits from proven, standardized designs (lower risk).

| Component | General Contractor | JB Villan | Savings |
|-----------|-------------------|-----------|---------|
| Contingency | 10% of project | 6% of project | 40% |

**Why:** JB Villan uses standardized, proven designs that have been built many times. This predictability means fewer change orders, less rework, and fewer unexpected issues.

## Foundation - NOT Prefab

Foundation (slab on grade) uses standard market pricing because concrete is poured on-site:
- **Price:** ~3,500 kr/m²
- **Reason:** Cannot be prefabricated - requires on-site excavation, formwork, and concrete pouring

## Client Costs (Byggherrekostnader)

These fees are paid directly by the homeowner to government agencies and service providers. They are NOT part of JB Villan's turnkey contract price:

| Item | Typical Cost (SEK) | Description |
|------|-------------------|-------------|
| Lagfart | 63,000 | Property registration (1.5% of purchase price) |
| Pantbrev | 42,000 | Mortgage deed (2% of mortgage amount) |
| Bygglov | 35,000 | Building permit |
| Nybyggnadskarta | 12,000 | Site survey map |
| Utstakning | 8,000 | Plot staking |
| Kontrollansvarig | 25,000 | Control supervisor |
| El-anslutning | 45,000 | Electrical connection |
| Fiber | 15,000 | Fiber internet connection |
| Byggström | 8,000 | Construction power |
| Försäkring | 15,000 | Builder's insurance |
| **Total** | **~268,000** | |

## Implementation

### Backend Configuration (ocr_service.py)

```python
JB_EFFICIENCY = {
    "exterior_wall_per_m2": {
        "type": "PREFAB",
        "general_contractor": 3800,
        "jb_villan": 2800,
        "savings_pct": 26,
        "reason": "Factory-manufactured wall panels",
        "explanation": "JB Villan manufactures complete wall panels in their factory with insulation, vapor barriers, and sheathing pre-installed. This eliminates weather delays, reduces material waste from optimized cutting, and requires less skilled on-site labor for assembly."
    },
    "roof_per_m2": {
        "type": "PREFAB",
        "general_contractor": 2200,
        "jb_villan": 1800,
        "savings_pct": 18,
        "reason": "Pre-assembled roof trusses from factory",
        "explanation": "Roof trusses are engineered and assembled in JB Villan's factory using precision jigs. Factory assembly ensures consistent quality, faster installation (crane sets in hours vs days of stick-framing), and eliminates on-site cutting waste."
    },
    "interior_wall_per_m2": {
        "type": "PREFAB",
        "general_contractor": 1450,
        "jb_villan": 1200,
        "savings_pct": 17,
        "reason": "Pre-cut framing and panels",
        "explanation": "Interior wall studs and gypsum panels are pre-cut to exact dimensions in JB Villan's factory. This eliminates on-site measuring errors, reduces drywall waste, and speeds up installation since carpenters spend less time cutting."
    },
    "site_overhead_pct": {
        "type": "STREAMLINED",
        "general_contractor": 0.05,
        "jb_villan": 0.03,
        "savings_pct": 40,
        "reason": "Faster build = lower site costs",
        "explanation": "Because prefab walls and roof go up in days instead of weeks, JB Villan projects spend less time on site. This means fewer weeks of scaffolding rental, site container rental, temporary power, waste removal, and site management costs."
    },
    "contingency_pct": {
        "type": "STANDARDIZED",
        "general_contractor": 0.10,
        "jb_villan": 0.06,
        "savings_pct": 40,
        "reason": "Proven designs = fewer surprises",
        "explanation": "JB Villan uses standardized, proven designs that have been built many times. This predictability means fewer change orders, less rework, and fewer unexpected issues. General contractors typically budget 10% contingency; JB Villan's track record allows for 6%."
    },
}
```

### Data Model

```typescript
type EfficiencyType = 'PREFAB' | 'STREAMLINED' | 'STANDARDIZED';

interface PrefabDiscount {
  efficiencyType: EfficiencyType;
  generalContractorPrice: number;
  jbVillanPrice: number;
  savingsAmount: number;
  savingsPercent: number;
  reason: string;
  explanation?: string;
}
```

### UI Indicators

| Badge | Color | Icon | Shown For |
|-------|-------|------|-----------|
| PREFAB | Green | Factory | Factory-manufactured items |
| STREAMLINED | Blue | Lightning | Faster build benefits |
| STANDARDIZED | Purple | Target | Proven design benefits |

The CostInspector shows detailed explanations of why each efficiency type applies to the specific item.

## Data Sources

- JB Villan website (jbvillan.se)
- Swedish construction industry pricing 2025
- BBR 2025 building regulations
- AMA (Allmän Material- och Arbetsbeskrivning)
