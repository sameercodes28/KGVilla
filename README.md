# KGVilla - AI Construction Estimator

KGVilla is an intelligent Quantity Take-Off (QTO) tool designed for the Swedish residential construction market. It uses **Google Vertex AI (Gemini 1.5 Pro)** to analyze architectural floor plans (PDF/Images) and generate detailed, compliant cost estimates.

## 🚀 Key Features

*   **AI Blueprint Analysis:** Upload a floor plan, and the AI identifies rooms, walls, and components, calculating quantities automatically.
*   **Swedish Compliance:** Built-in knowledge of **BBR 2025**, **Säker Vatten**, and **SS 436 40 00** standards. The AI flags non-compliant designs (e.g., accessibility issues).
*   **Interactive Split View:** A CAD-like interface connecting the visual plan with the data feed. Hover over a cost item to see it on the plan.
*   **Real-Time Chat:** Discuss the project with an AI consultant to optimize costs ("How can I save 500k SEK?").
*   **Bilingual:** Instant toggling between English and Swedish.

## 🛠 Technical Architecture

The project is built on a **Serverless Cloud Native** stack:

*   **Frontend:** Next.js 16 (React) hosted on GitHub Pages.
*   **Backend:** Python FastAPI hosted on Google Cloud Run.
*   **AI Engine:** Google Vertex AI (Gemini 1.5 Flash/Pro).

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
