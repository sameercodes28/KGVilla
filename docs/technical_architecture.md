# KGVilla Technical Architecture

> **Version 1.16.0**

## System Overview

KGVilla uses a **Resilient Hybrid Architecture**. The frontend is LocalStorage-First for immediate interactivity and offline capability, while the backend provides deterministic OCR-based cost estimation.

### Frontend (Next.js 16)
- **Framework:** Next.js 16 App Router with React 19 (Server Components + Client Components)
- **State Management:**
  - **Local Persistence:** `useProjects` and `useProjectData` hooks load from `localStorage` on mount
  - **Context API:** `ProjectDataContext` eliminates prop drilling
- **API Abstraction:** `src/lib/apiClient.ts` provides unified HTTP interface
- **UI:** Tailwind CSS 4 with custom Split Layout

### Backend (Python FastAPI)
- **Service:** FastAPI application running in Docker (Google Cloud Run)
- **OCR Engine:** Google Document AI for deterministic text extraction
- **AI Engine:** Google Vertex AI (Gemini 2.0 Flash) for chat and fallback analysis
- **Database:** Google Cloud Firestore (NoSQL)

---

## Data Models

### Project Entity
```typescript
interface Project {
  id: string;
  name: string;
  location: string;
  bbrStandard: string;        // "BBR 29"
  levels: Level[];
  totalArea?: number;
  boa?: number;               // Living area (BOA)
  biarea?: number;            // Secondary area (garage, storage)
  estimatedCost?: number;
}
```

### CostItem (The Atom)
The fundamental unit representing a specific construction element.
```typescript
interface CostItem {
  id: string;
  projectId: string;
  phase: ConstructionPhase;   // 'ground' | 'structure' | 'electrical' | 'plumbing' | 'interior' | 'completion' | 'admin'
  elementName: string;        // "Exterior Walls (260mm Energy)"
  description: string;
  quantity: number;
  unit: Unit;                 // 'm' | 'm2' | 'm3' | 'kg' | 'st' | 'lpm' | 'parti' | 'pkt'
  unitPrice: number;
  totalCost: number;
  confidenceScore: number;    // 0.0 - 1.0

  // Explainability
  calculationLogic?: string;
  guidelineReference?: string;   // "BBR 9:4, AMA Hus"
  breakdown?: CostBreakdown;
  quantityBreakdown?: QuantityBreakdown;

  // JB Villan Efficiency
  prefabDiscount?: PrefabDiscount;

  // User Customization
  customUnitPrice?: number;
  customQuantity?: number;
  disabled?: boolean;
}
```

### Efficiency Types
JB Villan provides three types of cost efficiencies:

```typescript
type EfficiencyType = 'PREFAB' | 'STREAMLINED' | 'STANDARDIZED';

interface PrefabDiscount {
  efficiencyType: EfficiencyType;
  generalContractorPrice: number;   // What a general contractor would charge
  jbVillanPrice: number;            // JB Villan's price
  savingsAmount: number;            // generalContractorPrice - jbVillanPrice
  savingsPercent: number;           // Percentage saved
  reason: string;                   // Short reason
  explanation?: string;             // Detailed explanation
}
```

| Type | Items | Description |
|------|-------|-------------|
| PREFAB | Exterior walls, Roof, Interior walls | Factory-manufactured components |
| STREAMLINED | Site Overhead | Benefits from faster build time |
| STANDARDIZED | Contingency | Benefits from proven, predictable designs |

**Note:** Foundation is NOT prefab — concrete is poured on-site.

---

## Analysis Pipeline (Deterministic OCR)

KGVilla uses a deterministic pipeline based on Document AI OCR, ensuring consistent pricing.

```
Floor Plan Image (PNG/PDF)
         ↓
[1. Document AI OCR] - Extract all text with bounding boxes
         ↓
[2. Spatial Matching] - Match room names to nearby area values
         ↓
[3. Room Classifier] - Swedish name → category (bedroom, bathroom, kitchen)
         ↓
[4. Area Calculator] - BOA vs Biarea, wall thickness adjustment
         ↓
[5. Pricing Engine] - Apply fixed rates from JB_EFFICIENCY config
         ↓
Deterministic Quote (same input = same output)
```

### Data Extraction
The OCR extracts printed annotations from JB Villan drawings:

| Extracted | Example | Used For |
|-----------|---------|----------|
| Room names | "SOVRUM 1", "KÖK" | Room classification |
| Room areas | "11.9 m²", "18.1 m²" | Flooring, painting costs |
| Summary areas | "BOYTA: 130.7m²" | Total living area |
| Building footprint | "BYGGYTA: 187.3m²" | Foundation, roof costs |

### Pricing Calculation
Costs use fixed rates from `JB_EFFICIENCY` in `ocr_service.py`:

```python
JB_EFFICIENCY = {
    "exterior_wall_per_m2": {
        "type": "PREFAB",
        "general_contractor": 3800,
        "jb_villan": 2800,
        "savings_pct": 26,
        "reason": "Factory-manufactured wall panels",
        "explanation": "JB Villan manufactures complete wall panels..."
    },
    "site_overhead_pct": {
        "type": "STREAMLINED",
        "general_contractor": 0.05,
        "jb_villan": 0.03,
        "savings_pct": 40,
        "reason": "Faster build = lower site costs",
        "explanation": "Because prefab walls and roof go up in days..."
    },
    # ... etc
}
```

---

## Key Components

### CostInspector (Step-by-Step Analysis)
The side panel provides a logical narrative flow:

1. **Step 1: Why This Is Required** (Green) - Regulatory basis from BBR 2025, Säker Vatten, etc.
2. **Step 2: How It Should Be Built** (Amber) - Construction specification and materials
3. **Step 3: Quantity Calculation** (Blue) - Step-by-step math from floor plan
4. **Step 4: Pricing** (Varies) - Market rate vs JB rate, savings breakdown

### CostCard (Item Display)
Individual cost item cards show:
- Element name and description
- Quantity and unit price
- Efficiency badge (PREFAB/STREAMLINED/STANDARDIZED) with appropriate color
- Expandable section with detailed breakdown

### VisualViewer (Split View)
Interactive canvas for floor plans with overlays for electrical points and plumbing zones.

---

## Data Flow (Optimistic Sync)

**Read:**
1. User opens a project
2. App immediately renders data from `localStorage`
3. Background fetch retrieves latest from API
4. If new data, UI updates silently and localStorage refreshes

**Write (Optimistic):**
1. User adds/modifies an item
2. UI updates instantly
3. Data saved to `localStorage`
4. Request sent to Backend API
5. If backend fails, data remains safe locally

---

## Client Costs (Byggherrekostnader)

These fees are paid directly by the homeowner and are NOT part of JB Villan's contract:

| Item | Typical Cost |
|------|--------------|
| Lagfart (property registration) | ~63,000 kr |
| Pantbrev (mortgage deed) | ~42,000 kr |
| Bygglov (building permit) | ~35,000 kr |
| El-anslutning (electrical connection) | ~45,000 kr |
| Kontrollansvarig (control supervisor) | ~25,000 kr |
| **Total** | **~268,000 kr** |

The UI clearly separates these from the contractor price.

---

## Security & Compliance

- **GDPR:** No personal data stored in AI prompts
- **CORS:** Strictly configured for frontend domain
- **Rate Limiting:** API endpoints rate-limited (20 req/min for analyze)
- **BBR 2025:** Pricing ground truth maintained in `backend/standards/`

---

## Environment Setup

**Required Environment Variables:**
```bash
GOOGLE_CLOUD_PROJECT=kgvilla
DOCUMENTAI_PROCESSOR_ID=<your-processor-id>
API_KEY=<your-api-key>
```

**Google Cloud APIs:**
- Firestore
- Document AI
- Vertex AI (aiplatform)

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/ocr_service.py` | OCR extraction, room classification, efficiency pricing |
| `backend/models.py` | Pydantic data models (CostItem, PrefabDiscount) |
| `src/types/index.ts` | Frontend TypeScript definitions |
| `src/components/qto/CostInspector.tsx` | Step-by-step cost analysis panel |
| `src/components/qto/CostCard.tsx` | Cost item card with efficiency badges |
| `src/contexts/ProjectDataContext.tsx` | Frontend state management |
| `src/data/regulationMapping.ts` | Maps cost items to applicable regulations |
