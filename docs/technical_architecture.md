# KGVilla Technical Architecture

## 1. System Overview (Hybrid Offline/Cloud)

KGVilla uses a **Resilient Hybrid Architecture**. The frontend is designed to be "LocalStorage-First," ensuring immediate interactivity and offline capability, while the backend provides heavy AI computation and centralized persistence when available.

### 1.1 Frontend (Next.js 15)
*   **Framework:** Next.js App Router (React Server Components + Client Components).
*   **State Management:**
    *   **Local Persistence:** `useProjects` and `useProjectData` hooks automatically load from `localStorage` on mount.
    *   **Context API:** `ProjectDataContext` eliminates prop drilling, sharing state between the `VisualViewer` and `ProjectDataFeed`.
*   **API Abstraction:** `src/lib/apiClient.ts` creates a unified interface for all HTTP requests, handling authentication headers and error logging.
*   **UI Library:** Tailwind CSS with a custom "Split Layout" for maximum data density.

### 1.2 Backend (Python FastAPI)
*   **Service:** FastAPI application running in Docker (Google Cloud Run).
*   **Resilience:** Includes startup probes (`/` endpoint) to report the status of dependent services (Firestore, Vertex AI) without crashing the container.
*   **AI Engine:** Google Vertex AI (Gemini 1.5 Pro) for multimodal analysis of floor plans.
*   **Database:** Google Cloud Firestore (NoSQL) for project and cost item storage.

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
*   `confidenceScore`: 0.0 - 1.0 (AI Confidence)
*   `guidelineReference`: "BBR 6:62" (Traceability to regulations)

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

## 5. Analysis Pipeline (Deterministic OCR)

KGVilla uses a **deterministic analysis pipeline** based on Document AI OCR, not AI-generated estimates. This ensures consistent, accurate pricing.

### 5.1 Pipeline Architecture

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

### 5.2 Why Deterministic?

- **Consistency:** Same floor plan always produces same price
- **Accuracy:** Uses architect's own calculated areas (not AI estimates)
- **Auditability:** Every cost traces to a specific m² rate and regulation

### 5.3 Data Extraction

The OCR extracts printed annotations from JB Villan drawings:

| Extracted | Example | Used For |
|-----------|---------|----------|
| Room names | "SOVRUM 1", "KÖK" | Room classification |
| Room areas | "11.9 m²", "18.1 m²" | Flooring, painting costs |
| Summary areas | "BOYTA: 130.7m²" | Total living area |
| Building footprint | "BYGGYTA: 187.3m²" | Foundation, roof costs |

### 5.4 Pricing Calculation

Costs are calculated using fixed rates from `SWEDISH_CONSTRUCTION_KNOWLEDGE_BASE.md`:

```python
# Example calculation
foundation_cost = BYGGYTA * 3500 kr/m²  # 187.3 × 3500 = 655,550 kr
flooring_cost = room_area * rate        # Based on room type
wet_room_cost = area * 4200 kr/m²       # Säker Vatten compliant
```

### 5.5 Fallback Mode

If Document AI is unavailable, the system falls back to Gemini AI analysis (non-deterministic).

### 5.6 Setup Requirements

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

## 6. Legacy: AI Analysis (Fallback)

*Only used if Document AI is unavailable.*

1.  **Upload:** User uploads PDF/Image to `/analyze`.
2.  **Prompting:** Backend constructs a "Quantity Surveyor" prompt with the attached image.
3.  **Context:** The prompt injects the **Swedish Knowledge Base** (Markdown).
4.  **Inference:** Gemini 1.5 analyzes the plan and returns JSON.
5.  **Validation:** Backend validates JSON against `CostItem` schema.
6.  **Merge:** Frontend receives items and merges them with existing project data.

---

## 7. Security & Compliance

*   **GDPR:** No personal data is stored in the AI prompts.
*   **CORS:** Strictly configured for the frontend domain.
*   **BBR 2025:** The AI's "Ground Truth" is updated via the `knowledge_base/` markdown files.

