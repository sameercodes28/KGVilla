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

## 2. Data Flow (The "Optimistic Sync")

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

## 3. AI Analysis Pipeline

1.  **Upload:** User uploads PDF/Image.
2.  **Preprocessing:** Backend normalizes image.
3.  **Gemini 1.5 Analysis:**
    *   **Vision:** Identifies walls, windows, room labels.
    *   **Logic:** Applies "Swedish Knowledge Base" rules (BBR 2025).
4.  **Structuring:** Returns structured JSON `CostItem` list.
5.  **Merge:** Frontend merges new AI items with existing project data.

---

## 4. Directory Structure

*   `src/app`: Next.js routes.
*   `src/components/v5`: The core Application UI (Split View).
*   `src/hooks`: Business logic and State sync.
*   `src/lib`: Utilities (API Client, Logger).
*   `backend/`: Python service.
*   `scripts/`: CI/CD and verification tools (`verify-deployment.sh`).

