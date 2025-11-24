# KGVilla - Smart Construction Intelligence

KGVilla is an AI-powered Quantity Take-Off (QTO) and cost estimation platform tailored for the Swedish residential market ("Småhus"). It analyzes floor plans against **BBR 2025** regulations and generates precise, compliant Bills of Quantities (Cost Breakdowns).

## 🚀 Features

### 🧠 AI-Powered Analysis
*   **AI Blueprint Analysis:** Upload PDF/Image floor plans. The backend (Gemini 1.5 Pro) identifies rooms, walls, and components, calculating quantities automatically.
*   **Regulatory Compliance:** Automatically checks against BBR 2025 (Accessibility, Energy) and Säker Vatten rules.
*   **Smart Inference:** Infers "hidden" costs (e.g., waterproofing in bathrooms, electrical feeds for stoves) based on room type.

### 💰 World-Class Quoting & Pricing
*   **World-Class Quoting:** Generates professional quotes with **ABT 06 Risk Analysis**, **Payment Schedules**, and **Contract Scope** visualization.
*   **Scenario Mode:** Visualizes "What If" changes (e.g., "Downgrade Kitchen" or "Switch to Heat Pump") with instant budget impact.
*   **Regional Intelligence:** Prices adjusted for 2025 fees in Stockholm vs Västra Götaland.
*   **Assembly-Based Pricing:** Costs are built from atomic assemblies (materials + labor + waste) rather than simple square meter estimates.

### ⚡ Modern & Resilient Interface
*   **Interactive Split View:** A CAD-like interface connecting the visual plan with the data feed. Hover over a cost item to see it on the plan. Includes **fullscreen mode** and toggleable system overlays (Electrical/Plumbing).
*   **Real-Time Chat:** Discuss the project with an AI consultant to refine specs or ask regulatory questions.
*   **Bilingual:** Instant toggling between English and Swedish.
*   **Mobile-First Autocomplete:** Quickly add custom items with a smart catalog search.
*   **Offline Resilience:** A **LocalStorage-First** architecture ensures the app loads instantly and works even if the backend is offline. Data syncs quietly in the background.
*   **Multi-Project Support:** Create, switch between, and manage multiple projects seamlessly.

## 🛠 Tech Stack

*   **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS.
*   **Backend:** Python 3.11, FastAPI, Google Cloud Firestore (Data), Vertex AI (Intelligence).
*   **Infrastructure:** Docker, Google Cloud Run.

## 🚦 Getting Started

1.  **Prerequisites:** Node.js 18+ and Python 3.11+.
2.  **Google Cloud Setup (One-time):**
    ```bash
    # Enable required APIs
    gcloud services enable firestore.googleapis.com aiplatform.googleapis.com

    # Create Firestore Database (Native Mode)
    gcloud firestore databases create --location=europe-north1

    # Grant permissions to Cloud Run Service Account
    # Replace [PROJECT_NUMBER] with your GCP Project Number
    gcloud projects add-iam-policy-binding kgvilla \
        --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \
        --role="roles/datastore.user"
    
    gcloud projects add-iam-policy-binding kgvilla \
        --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \
        --role="roles/aiplatform.user"
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    cd backend && pip install -r requirements.txt
    ```
4.  **Verify Environment:**
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
