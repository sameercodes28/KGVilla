# KGVilla - Smart Construction Intelligence

> **Version 1.5.1** | AI-powered cost estimation for Swedish residential construction

KGVilla is an AI-powered Quantity Take-Off (QTO) and cost estimation platform tailored for the Swedish residential market ("Småhus"). Built specifically for **JB Villan** prefab house customers, it analyzes floor plans against **BBR 2025** regulations and generates precise, compliant Bills of Quantities with accurate prefab pricing.

## What is JB Villan?

JB Villan is a Swedish prefab house manufacturer based in Kalix. They build wall panels, roof trusses, and components in a factory, delivering them ready to assemble on-site. This factory model is **~12% cheaper** than traditional general contractors due to optimized material cuts, weather-independent production, and faster assembly.

KGVilla reflects these savings accurately — when you upload a JB Villan floor plan, you see real JB Villan pricing, not inflated general contractor estimates.

## Features

### Deterministic OCR Analysis
*   **Document AI OCR:** Upload PDF/Image floor plans. Google Document AI extracts room names and areas directly from the architect's annotations.
*   **Consistent Pricing:** Same floor plan always produces the same quote — no AI variability.
*   **Regulatory Compliance:** Automatically applies BBR 2025 (Accessibility, Energy) and Säker Vatten requirements.
*   **Smart Inference:** Infers "hidden" costs (e.g., waterproofing in bathrooms, electrical feeds for stoves) based on room type.

### JB Villan Prefab Pricing
*   **Accurate Prefab Costs:** Pricing reflects JB Villan's factory efficiencies, not general contractor rates.
*   **Savings Breakdown:** See exactly where prefab saves money (26% on exterior walls, 18% on roof, 17% on interior walls).
*   **Side-by-Side Comparison:** Every quote shows JB Villan price vs what a general contractor would charge.
*   **Green "Prefab" Badges:** Visual indicators on items that benefit from factory manufacturing.

### Professional Quoting
*   **ABT 06 Compliance:** Generates professional quotes with risk analysis, payment schedules, and contract scope.
*   **Client Cost Separation:** Clearly separates contractor costs from client-paid fees (permits, connections, insurance).
*   **Assembly-Based Pricing:** Costs are built from atomic assemblies (materials + labor + waste) rather than simple square meter estimates.

### Modern & Resilient Interface
*   **Interactive Split View:** A CAD-like interface connecting the visual plan with the data feed. Hover over a cost item to see it highlighted on the plan.
*   **Cost Inspector:** Deep-dive into any item to see calculation formulas, regulatory references, and quantity breakdowns by room.
*   **AI Chat Consultant:** Discuss the project with an AI to refine specs or ask regulatory questions.
*   **Bilingual:** Instant toggling between English and Swedish.
*   **Offline Resilience:** A **LocalStorage-First** architecture ensures the app loads instantly and works even if the backend is offline. Data syncs quietly in the background.
*   **Multi-Project Support:** Create, switch between, and manage multiple projects seamlessly.

## Tech Stack

*   **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4
*   **Backend:** Python 3.11, FastAPI, Google Cloud Firestore, Google Document AI (OCR), Vertex AI (Gemini 2.0 Flash)
*   **Infrastructure:** Docker, Google Cloud Run, GitHub Pages (static frontend)

## Getting Started

1.  **Prerequisites:** Node.js 18+ and Python 3.11+

2.  **Google Cloud Setup (One-time):**
    ```bash
    # Enable required APIs
    gcloud services enable firestore.googleapis.com aiplatform.googleapis.com documentai.googleapis.com

    # Create Firestore Database (Native Mode)
    gcloud firestore databases create --location=europe-north1

    # Create Document AI OCR processor (EU region)
    # Then note the Processor ID for environment variables

    # Grant permissions to Cloud Run Service Account
    gcloud projects add-iam-policy-binding kgvilla \
        --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \
        --role="roles/datastore.user"

    gcloud projects add-iam-policy-binding kgvilla \
        --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \
        --role="roles/aiplatform.user"

    gcloud projects add-iam-policy-binding kgvilla \
        --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \
        --role="roles/documentai.apiUser"
    ```

3.  **Environment Variables:**
    ```bash
    GOOGLE_CLOUD_PROJECT=kgvilla
    DOCUMENTAI_PROCESSOR_ID=<your-processor-id>
    API_KEY=<your-api-key>
    ```

4.  **Install Dependencies:**
    ```bash
    npm install
    cd backend && pip install -r requirements.txt
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    # Backend (in separate terminal):
    cd backend && uvicorn main:app --reload
    ```

## Architecture Highlights

*   **Deterministic OCR Pipeline:** Document AI extracts room names and areas from floor plans, then applies fixed pricing rates from the Swedish Construction Knowledge Base. Same input always produces the same output.
*   **JB Villan Prefab Pricing:** `backend/ocr_service.py` contains prefab-specific rates that reflect factory manufacturing efficiencies, with savings percentages tracked per component.
*   **LocalStorage-First:** Frontend loads instantly from localStorage, then syncs with backend in the background. Works offline.
*   **Context-Based State:** `ProjectDataContext` manages the complex state of the Cost Inspector and Split View, avoiding prop drilling.
*   **Hardened Backend:** The Python service includes startup probes to gracefully report status even if Cloud credentials are missing.

## Key Files

| File | Purpose |
|------|---------|
| `backend/ocr_service.py` | OCR extraction, room classification, prefab pricing logic |
| `backend/standards/SWEDISH_CONSTRUCTION_KNOWLEDGE_BASE.md` | Pricing rates, BBR 2025 rules |
| `docs/domain_knowledge/JB_VILLAN_PREFAB_PRICING.md` | Prefab pricing analysis and research |
| `src/contexts/ProjectDataContext.tsx` | Frontend state management |
| `src/components/qto/CostInspector.tsx` | Cost breakdown detail panel |

## License

Private. All rights reserved.
