# KGVilla - AI Construction Estimator

KGVilla is an intelligent Quantity Take-Off (QTO) tool designed for the Swedish residential construction market. It uses **Google Vertex AI (Gemini 1.5 Pro)** to analyze architectural floor plans (PDF/Images) and generate detailed, compliant cost estimates.

## 🚀 Key Features

*   **AI Blueprint Analysis:** Upload a floor plan, and the AI identifies rooms, walls, and components, calculating quantities automatically.
*   **World-Class Quoting:** Generates professional quotes with **ABT 06 Risk Analysis**, **Payment Schedules**, and **Contract Scope** visualization.
*   **Scenario Mode:** Visualizes "What If" changes (e.g., "Downgrade Kitchen") with instant budget impact.
*   **Regional Intelligence:** Prices adjusted for 2025 fees in Stockholm vs Västra Götaland.
*   **Assembly-Based Pricing:** Uses advanced logic to infer hidden costs (e.g., waterproofing in bathrooms, electrical feeds in kitchens).
*   **Interactive Split View:** A CAD-like interface connecting the visual plan with the data feed. Hover over a cost item to see it on the plan. Includes **fullscreen mode** and toggleable system overlays (Electrical/Plumbing).
*   **Real-Time Chat:** Discuss the project with an AI consultant.
*   **Bilingual:** Instant toggling between English and Swedish.

## 🛡 Quality Assurance

We use a "Shift Left" strategy to catch errors before they reach the cloud.

*   **Husky & Lint-Staged:** Every commit automatically runs a type check (`tsc`) and linter. If your code has errors, you cannot commit it.
*   **Error Boundaries:** If the app crashes in production, users see a friendly "Blueprint Blew Away" screen with a one-click debug report generator.
*   **Telemetry:** We log key actions to `logger.ts`, which helps LLMs (like Gemini/Claude) debug issues by providing a recent history of events.

## 🛠 Technical Architecture

The project is built on a **Serverless Cloud Native** stack:

*   **Frontend:** Next.js 16 (React) hosted on GitHub Pages.
*   **Backend:** Python FastAPI hosted on Google Cloud Run.
*   **AI Engine:** Google Vertex AI (Gemini 1.5 Flash/Pro).
*   **Data Model:** We use the term **`CostItem`** (formerly BoQ) to represent line items in the estimate.

For a deep dive into the stack and design decisions, see [Technical Architecture](docs/technical_architecture.md).

## 🏁 Getting Started

### Prerequisites
*   Node.js 20+
*   Python 3.11+
*   Google Cloud CLI (`gcloud`)

### Local Development

1.  **Frontend:**
    ```bash
    npm install
    npm run dev
    # Visit http://localhost:3000
    ```

2.  **Backend:**
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload
    # Visit http://localhost:8000/docs
    ```

## 📦 Deployment

*   **Frontend:** Automatically deployed to GitHub Pages via GitHub Actions on push to `main`.
*   **Backend:** Deployed to Cloud Run via CLI:
    ```bash
    cd backend
    gcloud run deploy kgvilla-api --source . --platform managed --region europe-north1 --allow-unauthenticated
    ```

## 📄 Documentation
*   [Technical Architecture](docs/technical_architecture.md)
*   [Swedish Building Standards](docs/swedish_standards/)
