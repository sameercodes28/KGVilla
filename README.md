# KGVilla - Smart Construction Intelligence

KGVilla is an AI-powered Quantity Take-Off (QTO) and cost estimation platform tailored for the Swedish residential market ("Småhus"). It analyzes floor plans against **BBR 2025** regulations and generates precise, compliant Bills of Quantities (Cost Breakdowns).

## 🚀 Features

### 🧠 AI-Powered Analysis
*   **Blueprint Scan:** Upload PDF/Image floor plans. The backend (Gemini 1.5 Pro) identifies rooms, walls, and systems.
*   **Regulatory Compliance:** Automatically checks against BBR 2025 (Accessibility, Energy) and Säker Vatten rules.
*   **Smart Inference:** Infers "hidden" costs (e.g., waterproofing in bathrooms, electrical feeds for stoves) based on room type.

### ⚡ Modern & Resilient Frontend
*   **Offline Resilience:** A **LocalStorage-First** architecture ensures the app loads instantly and works even if the backend is offline. Data syncs quietly in the background.
*   **Multi-Project Support:** Create, switch between, and manage multiple projects seamlessly.
*   **Interactive Split View:** A CAD-like interface connecting the visual plan with the cost data. Hover over an item to see it on the plan.
*   **Mobile-First Autocomplete:** Quickly add custom items with a smart catalog search.

### 💰 Accurate Pricing (2025)
*   **Assembly-Based Pricing:** Costs are built from atomic assemblies (materials + labor + waste).
*   **Dynamic Scenarios:** Ask the AI "What if I switch to a heat pump?" to get instant cost comparisons.

## 🛠 Tech Stack

*   **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS.
*   **Backend:** Python 3.11, FastAPI, Google Cloud Firestore (Data), Vertex AI (Intelligence).
*   **Infrastructure:** Docker, Google Cloud Run.

## 🚦 Getting Started

1.  **Prerequisites:** Node.js 18+ and Python 3.11+.
2.  **Install Dependencies:**
    ```bash
    npm install
    cd backend && pip install -r requirements.txt
    ```
3.  **Verify Environment:**
    Run the automated health check to ensure everything is set up correctly.
    ```bash
    ./scripts/verify-deployment.sh
    ```
4.  **Run Development Server:**
    ```bash
    npm run dev
    # Backend (Optional for UI dev):
    # cd backend && uvicorn main:app --reload
    ```

## 📐 Architecture Highlights

*   **API Client:** All data fetching is centralized in `src/lib/apiClient.ts` for consistent error handling and type safety.
*   **Context-Based State:** `ProjectDataContext` manages the complex state of the Cost Inspector and Split View, avoiding prop drilling.
*   **Hardened Backend:** The Python service includes startup probes to gracefully report status even if Cloud credentials are missing.

## 📝 License
Private. All rights reserved.
