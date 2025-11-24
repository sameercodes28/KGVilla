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

## 5. AI Analysis Pipeline

1.  **Upload:** User uploads PDF/Image to `/analyze`.
2.  **Prompting:** Backend constructs a "Quantity Surveyor" prompt with the attached image.
3.  **Context:** The prompt injects the **Swedish Knowledge Base** (Markdown).
4.  **Inference:** Gemini 1.5 analyzes the plan and returns JSON.
5.  **Validation:** Backend validates JSON against `CostItem` schema.
6.  **Merge:** Frontend receives items and merges them with existing project data.

---

## 6. Security & Compliance

*   **GDPR:** No personal data is stored in the AI prompts.
*   **CORS:** Strictly configured for the frontend domain.
*   **BBR 2025:** The AI's "Ground Truth" is updated via the `knowledge_base/` markdown files.

