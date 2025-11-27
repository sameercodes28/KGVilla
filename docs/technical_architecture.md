# KGVilla Technical Architecture

> **Version 1.5.1** | Last updated: November 2024

## 1. System Overview (Hybrid Offline/Cloud)

KGVilla uses a **Resilient Hybrid Architecture**. The frontend is designed to be "LocalStorage-First," ensuring immediate interactivity and offline capability, while the backend provides deterministic OCR-based cost estimation and centralized persistence.

### 1.1 Frontend (Next.js 16)
*   **Framework:** Next.js 16 App Router with React 19 (Server Components + Client Components).
*   **State Management:**
    *   **Local Persistence:** `useProjects` and `useProjectData` hooks automatically load from `localStorage` on mount.
    *   **Context API:** `ProjectDataContext` eliminates prop drilling, sharing state between the `VisualViewer` and `ProjectDataFeed`.
*   **API Abstraction:** `src/lib/apiClient.ts` creates a unified interface for all HTTP requests, handling authentication headers and error logging.
*   **UI Library:** Tailwind CSS 4 with a custom "Split Layout" for maximum data density.

### 1.2 Backend (Python FastAPI)
*   **Service:** FastAPI application running in Docker (Google Cloud Run).
*   **OCR Engine:** Google Document AI for deterministic text extraction from floor plans.
*   **AI Engine:** Google Vertex AI (Gemini 2.0 Flash) for AI chat consultant and fallback analysis.
*   **Database:** Google Cloud Firestore (NoSQL) for project and cost item storage.
*   **Resilience:** Includes startup probes (`/` endpoint) to report the status of dependent services without crashing.

---

## 2. Core Data Models & Standards

### 2.1 Project Entity
The root entity managing the lifecycle.
*   `id`: UUID
*   `bbrStandard`: "BBR 29" (Tracks compliance version).
*   `status`: Draft -> Final (ABT 06 stage tracking).
*   `levels`: Array of floor levels (Plan 1, Plan 2).

### 2.2 CostItem (The Atom)
The fundamental unit of the application, representing a specific construction element.
*   `elementName`: "Yttervägg Typ A"
*   `quantity`: 150
*   `unit`: "m2"
*   `breakdown`: { material: 500, labor: 200, formula: "..." }
*   `quantityBreakdown`: Array of room contributions (e.g., "Sovrum 1: 11.9 m²")
*   `confidenceScore`: 0.0 - 1.0 (AI Confidence)
*   `guidelineReference`: "BBR 6:62" (Traceability to regulations)
*   `prefabDiscount`: JB Villan vs General Contractor pricing comparison (see Section 6)

### 2.3 Swedish Knowledge Base
The AI is grounded in a set of Markdown documents in `backend/standards/` that define the ground truth:
*   **BBR 2025:** Building regulations (Accessibility, Energy).
*   **Säker Vatten:** Industry rules for plumbing (preventing water damage).
*   **ABT 06:** General Conditions of Contract for Design and Construct Contracts (Risk management).

---

## 3. Key Components

### 3.1 VisualViewer (Interactive Split View)
The interactive canvas for floor plans.
*   **Overlays:** Renders SVG layers for electrical points and plumbing zones over the raster floor plan.
*   **Interactivity:** Hovering an item in the list highlights it on the plan.

### 3.2 CostInspector (The "Why")
The side panel for deep-diving into pricing logic.
*   **Transparency:** Shows the exact calculation formula used by the AI.
*   **Evidence:** Links to the specific BBR paragraph driving the requirement (e.g., "Door width 0.8m required by BBR 3:142").

---

## 4. Data Flow (The "Optimistic Sync")

1.  **Read:**
    *   User opens a project.
    *   App *immediately* renders data from `localStorage`.
    *   Background process fetches latest data from API.
    *   If API returns new data, UI updates silently and `localStorage` is refreshed.
    
2.  **Write (Optimistic):**
    *   User adds an item.
    *   UI updates *instantly*.
    *   Data is saved to `localStorage`.
    *   Request is sent to Backend API (Fire-and-Forget).
    *   If Backend fails, data remains safe locally.

---

## 4. Analysis Pipeline (Deterministic OCR)

KGVilla uses a **deterministic analysis pipeline** based on Document AI OCR, not AI-generated estimates. This ensures consistent, accurate pricing.

### 4.1 Pipeline Architecture

```
Floor Plan Image (PNG/PDF)
         ↓
[1. Document AI OCR] - Extract all text from image
         ↓
[2. Room Parser] - Regex: "SOVRUM 1\n11.9 m²" → {room: "SOVRUM 1", area: 11.9}
         ↓
[3. Room Classifier] - Swedish name → category (bedroom, bathroom, kitchen)
         ↓
[4. Pricing Engine] - Apply fixed rates from knowledge base
         ↓
Deterministic Quote (same input = same output)
```

### 4.2 Why Deterministic?

- **Consistency:** Same floor plan always produces same price
- **Accuracy:** Uses architect's own calculated areas (not AI estimates)
- **Auditability:** Every cost traces to a specific m² rate and regulation

### 4.3 Data Extraction

The OCR extracts printed annotations from JB Villan drawings:

| Extracted | Example | Used For |
|-----------|---------|----------|
| Room names | "SOVRUM 1", "KÖK" | Room classification |
| Room areas | "11.9 m²", "18.1 m²" | Flooring, painting costs |
| Summary areas | "BOYTA: 130.7m²" | Total living area |
| Building footprint | "BYGGYTA: 187.3m²" | Foundation, roof costs |

### 4.4 Pricing Calculation

Costs are calculated using fixed rates from `SWEDISH_CONSTRUCTION_KNOWLEDGE_BASE.md`:

```python
# Example calculation
foundation_cost = BYGGYTA * 3500 kr/m²  # 187.3 × 3500 = 655,550 kr
flooring_cost = room_area * rate        # Based on room type
wet_room_cost = area * 4200 kr/m²       # Säker Vatten compliant
```

### 4.5 Fallback Mode

If Document AI is unavailable, the system falls back to Gemini AI analysis (non-deterministic).

### 4.6 Setup Requirements

**Environment Variables (Cloud Run):**
```bash
GOOGLE_CLOUD_PROJECT=kgvilla
DOCUMENTAI_PROCESSOR_ID=<your-processor-id>
API_KEY=<your-api-key>
```

**Document AI Setup:**
1. Enable Document AI API: `gcloud services enable documentai.googleapis.com`
2. Create OCR processor in Google Cloud Console (US region)
3. Note the Processor ID and add to environment variables

**Files:**
- `backend/ocr_service.py` - OCR extraction and pricing logic
- `backend/standards/SWEDISH_CONSTRUCTION_KNOWLEDGE_BASE.md` - Pricing rates

---

## 5. Legacy: AI Analysis (Fallback)

*Only used if Document AI is unavailable.*

1.  **Upload:** User uploads PDF/Image to `/analyze`.
2.  **Prompting:** Backend constructs a "Quantity Surveyor" prompt with the attached image.
3.  **Context:** The prompt injects the **Swedish Knowledge Base** (Markdown).
4.  **Inference:** Gemini 1.5 analyzes the plan and returns JSON.
5.  **Validation:** Backend validates JSON against `CostItem` schema.
6.  **Merge:** Frontend receives items and merges them with existing project data.

---

## 8. Security & Compliance

*   **GDPR:** No personal data is stored in the AI prompts.
*   **CORS:** Strictly configured for the frontend domain.
*   **Rate Limiting:** API endpoints are rate-limited (20 req/min for analyze, 30 req/min for explain).
*   **BBR 2025:** The pricing "Ground Truth" is maintained in `backend/standards/SWEDISH_CONSTRUCTION_KNOWLEDGE_BASE.md`.



---

## 6. JB Villan Prefab Pricing

KGVilla is specifically optimized for JB Villan prefab houses. The pricing engine accounts for factory manufacturing efficiencies that make prefab construction ~12% cheaper than traditional general contractors.

### 6.1 Why Prefab is Cheaper

| Component | General Contractor | JB Villan | Savings |
|-----------|-------------------|-----------|---------|
| Exterior Walls | 3,800 kr/m² | 2,800 kr/m² | 26% |
| Roof | 2,200 kr/m² | 1,800 kr/m² | 18% |
| Interior Walls | 1,200 kr/m² | 1,000 kr/m² | 17% |
| Foundation | 2,400 kr/m² | 2,200 kr/m² | 9% |
| Site Overhead | 10% | 5% | 50% |
| Contingency | 8% | 5% | 37.5% |

**Reasons for savings:**
- Factory-manufactured wall panels with optimized material cuts
- Pre-assembled roof trusses delivered ready to install
- Weather-independent production
- Standardized designs allow volume purchasing
- Efficient just-in-time logistics

### 6.2 PrefabDiscount Data Model

```typescript
interface PrefabDiscount {
  generalContractorPrice: number;   // What a general contractor would charge
  jbVillanPrice: number;            // JB Villan's prefab-efficient price
  savingsAmount: number;            // generalContractorPrice - jbVillanPrice
  savingsPercent: number;           // Percentage saved
  reason: string;                   // Why prefab is cheaper
}
```

### 6.3 UI Indicators

- **Green "Prefab" badge:** Shown on cost items with factory efficiency
- **Cost Inspector:** Detailed breakdown showing GC price vs JB price
- **Bottom summary:** Total savings comparison vs general contractor

### 6.4 Client Costs (Byggherrekostnader)

These fees are paid directly by the homeowner and are NOT part of JB Villan's contract price:

| Item | Typical Cost |
|------|--------------|
| Lagfart (property registration) | ~63,000 kr |
| Pantbrev (mortgage deed) | ~42,000 kr |
| Bygglov (building permit) | ~35,000 kr |
| El-anslutning (electrical connection) | ~45,000 kr |
| Kontrollansvarig (control supervisor) | ~25,000 kr |
| **Total** | **~268,000 kr** |

The UI clearly separates these client costs from the contractor price.

---

## 7. Future Improvements

### 7.1 Computer Vision (Wall/Window Detection)
- Use TensorFlow or Google Vision AI to detect wall lines, windows, and doors
- Calculate actual wall lengths instead of estimating from room area
- Count windows and doors accurately

### 7.2 CAD/BIM Import
- Accept DWG/IFC files directly from JB Villan
- Extract precise geometry: wall lengths, opening sizes, fixture counts
- Eliminate estimation entirely

### 7.3 User Validation Interface
- Present extracted values for user confirmation
- Allow manual correction of room counts, areas, fixture quantities

---

