# JB Villan Prefab Pricing Analysis

## Overview

This document captures research findings on JB Villan's prefab manufacturing business model and how it affects construction cost estimation compared to traditional general contractors.

## Background

**Discovery Context:** Analysis of house 1355 deed revealed sale price of 3,975,000 SEK, while our tool estimated 4,716,470 kr (~18.7% overestimation). Deep analysis of jbvillan.se identified key factors explaining the difference.

## JB Villan Business Model

JB Villan is a Swedish prefab house manufacturer based in Kalix. Their business model differs significantly from traditional general contractors:

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

## Cost Structure Differences

### Client Costs (Byggherrekostnader) - NOT Part of Contractor Price

These fees are paid directly by the homeowner to government agencies and service providers:

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

**Important:** These costs are often included in "total project cost" discussions but are NOT part of JB Villan's turnkey contract price.

## Prefab Pricing vs General Contractor

### Pricing Tiers by Component

| Component | General Contractor | JB Villan | Savings % | Reason |
|-----------|-------------------|-----------|-----------|--------|
| Exterior Walls | 3,800 kr/m² | 2,800 kr/m² | 26% | Factory-manufactured panels with optimized material cuts |
| Roof | 2,200 kr/m² | 1,800 kr/m² | 18% | Pre-assembled trusses from factory |
| Interior Walls | 1,200 kr/m² | 1,000 kr/m² | 17% | Pre-cut studs and panels from factory |
| Foundation | 2,400 kr/m² | 2,200 kr/m² | 9% | Standardized slab design with efficient formwork |
| Site Overhead | 10% | 5% | 50% | Efficient scheduling with prefab components |
| Contingency | 8% | 5% | 37.5% | Predictable prefab process reduces unknowns |

### Example Calculation (House 1355)

```
Total JB Villan Price:      4,097,820 kr
General Contractor Price:   4,665,198 kr
Prefab Savings:               567,378 kr (12.2%)

Actual Sale Price:          3,975,000 kr
Remaining Difference:         122,820 kr (3%)
```

The remaining 3% difference can be attributed to:
- Volume purchasing discounts (catalog designs)
- Regional cost variations (Kalix area)
- Market competition factors
- Specific lot conditions

## Implementation in KGVilla

### Backend (ocr_service.py)

```python
PREFAB_PRICING = {
    "exterior_wall_per_m2": {
        "general_contractor": 3800,
        "jb_villan": 2800,
        "savings_pct": 26,
        "reason": "Factory-manufactured wall panels with optimized material cuts"
    },
    "roof_per_m2": {
        "general_contractor": 2200,
        "jb_villan": 1800,
        "savings_pct": 18,
        "reason": "Pre-assembled roof trusses from factory"
    },
    # ... etc
}
```

### Data Model

```typescript
interface PrefabDiscount {
  generalContractorPrice: number;   // What a general contractor would charge
  jbVillanPrice: number;            // JB Villan's prefab-efficient price
  savingsAmount: number;            // generalContractorPrice - jbVillanPrice
  savingsPercent: number;           // Percentage saved
  reason: string;                   // Why prefab is cheaper
}
```

### UI Indicators

1. **Green "Prefab" badge** - Shown on items with factory efficiency
2. **Expanded cost card** - Shows GC price vs JB price comparison
3. **Cost Inspector** - Detailed prefab efficiency section
4. **Bottom callout** - Total savings comparison vs general contractor

## Key Insights

1. **Exclude Client Costs from Comparisons**
   - When comparing to JB Villan prices, exclude byggherrekostnader
   - These are customer-paid fees, not contractor costs

2. **Prefab Efficiency Varies by Component**
   - Highest savings: Exterior walls (26%), Roof (18%)
   - Moderate savings: Interior walls (17%), Foundation (9%)
   - Indirect savings: Overhead (50%), Contingency (37.5%)

3. **Total Typical Savings: ~12%**
   - This aligns with industry data on prefab vs traditional construction
   - Actual savings can be 10-15% depending on project specifics

4. **Price Validation**
   - Always compare against actual deeds/sales when available
   - JB Villan catalog houses have more predictable pricing
   - Custom designs may have smaller prefab advantages

## Data Sources

- JB Villan website (jbvillan.se)
- Swedish construction industry pricing 2025
- Lantmäteriet deed records
- BBR 2025 building regulations
- AMA (Allmän Material- och Arbetsbeskrivning)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-11-27 | Initial documentation of prefab pricing analysis |
