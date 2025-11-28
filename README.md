# KGVilla - Smart Construction Intelligence

> **Version 1.14.0** | AI-powered cost estimation for Swedish residential construction

KGVilla is an AI-powered Quantity Take-Off (QTO) and cost estimation platform tailored for the Swedish residential market ("Småhus"). Built specifically for **JB Villan** prefab house customers, it analyzes floor plans against **BBR 2025** regulations and generates precise, compliant Bills of Quantities with accurate prefab pricing.

## What is JB Villan?

JB Villan is a Swedish prefab house manufacturer based in Kalix. They build wall panels, roof trusses, and components in a factory, delivering them ready to assemble on-site. This factory model is **~12% cheaper** than traditional general contractors due to optimized material cuts, weather-independent production, and faster assembly.

KGVilla reflects these savings accurately — when you upload a JB Villan floor plan, you see real JB Villan pricing, not inflated general contractor estimates.

## Features

### Deterministic OCR Analysis
- **Document AI OCR:** Upload PDF/Image floor plans. Google Document AI extracts room names and areas directly from the architect's annotations.
- **Consistent Pricing:** Same floor plan always produces the same quote — no AI variability.
- **Regulatory Compliance:** Automatically applies BBR 2025 (Accessibility, Energy) and Säker Vatten requirements.
- **Smart Inference:** Infers "hidden" costs (e.g., waterproofing in bathrooms, electrical feeds for stoves) based on room type.

### JB Villan Efficiency Pricing

KGVilla recognizes three types of JB Villan cost efficiencies:

| Type | Color | Icon | Description |
|------|-------|------|-------------|
| **PREFAB** | Green | Factory | True factory manufacturing (walls, roof, interior walls) |
| **STREAMLINED** | Blue | Lightning | Benefits from faster build time (site overhead) |
| **STANDARDIZED** | Purple | Target | Benefits from proven designs (contingency) |

**Note:** Foundation (slab on grade) is NOT prefab — concrete is poured on-site. It uses standard market pricing.

**Savings by component:**
- Exterior Walls: 26% (PREFAB - factory-manufactured panels)
- Roof: 18% (PREFAB - pre-assembled trusses)
- Interior Walls: 17% (PREFAB - pre-cut framing)
- Site Overhead: 40% (STREAMLINED - faster build = less rental time)
- Contingency: 40% (STANDARDIZED - proven designs = fewer surprises)

### Cost Inspector (Step-by-Step Analysis)

The Cost Inspector provides a logical narrative flow for understanding each cost item:

1. **Why This Is Required** (Regulations) - Swedish building codes that mandate this element
2. **How It Should Be Built** (Specification) - Construction standards and materials
3. **Quantity Calculation** (Math) - Step-by-step calculation from floor plan data
4. **Pricing** (Cost Breakdown) - Market rate, JB Villan rate, and final cost

### Professional Quoting
- **ABT 06 Compliance:** Generates professional quotes with risk analysis, payment schedules, and contract scope.
- **Client Cost Separation:** Clearly separates contractor costs from client-paid fees (permits, connections, insurance).
- **Assembly-Based Pricing:** Costs are built from atomic assemblies (materials + labor + waste) rather than simple square meter estimates.

### Modern & Resilient Interface
- **Interactive Split View:** A CAD-like interface connecting the visual plan with the data feed.
- **Bilingual:** Instant toggling between English and Swedish.
- **Offline Resilience:** LocalStorage-First architecture ensures the app loads instantly and works offline.
- **Multi-Project Support:** Create, switch between, and manage multiple projects seamlessly.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Backend:** Python 3.11, FastAPI, Google Cloud Firestore, Google Document AI (OCR), Vertex AI (Gemini 2.0 Flash)
- **Infrastructure:** Docker, Google Cloud Run

## Getting Started

1. **Prerequisites:** Node.js 18+ and Python 3.11+

2. **Google Cloud Setup:**
   ```bash
   # Enable required APIs
   gcloud services enable firestore.googleapis.com aiplatform.googleapis.com documentai.googleapis.com

   # Create Firestore Database (Native Mode)
   gcloud firestore databases create --location=europe-north1

   # Create Document AI OCR processor in Google Cloud Console
   # Note the Processor ID for environment variables
   ```

3. **Environment Variables:**
   ```bash
   GOOGLE_CLOUD_PROJECT=kgvilla
   DOCUMENTAI_PROCESSOR_ID=<your-processor-id>
   API_KEY=<your-api-key>
   ```

4. **Install Dependencies:**
   ```bash
   npm install
   cd backend && pip install -r requirements.txt
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   # Backend (in separate terminal):
   cd backend && uvicorn main:app --reload
   ```

## Project Structure

```
KGVilla/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/qto/         # QTO components (CostCard, CostInspector, etc.)
│   ├── contexts/               # React contexts (ProjectData, Language)
│   ├── data/                   # Static data (catalog, regulations)
│   ├── lib/                    # Utilities (apiClient, logger)
│   └── types/                  # TypeScript type definitions
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── ocr_service.py          # OCR extraction and pricing logic
│   ├── models.py               # Pydantic data models
│   └── standards/              # Swedish construction knowledge base
└── docs/                       # Documentation
```

## Key Files

| File | Purpose |
|------|---------|
| `backend/ocr_service.py` | OCR extraction, room classification, efficiency pricing logic |
| `backend/models.py` | Data models (CostItem, PrefabDiscount, EfficiencyType) |
| `src/types/index.ts` | Frontend TypeScript type definitions |
| `src/components/qto/CostInspector.tsx` | Step-by-step cost analysis panel |
| `src/components/qto/CostCard.tsx` | Individual cost item card with efficiency badges |
| `src/contexts/ProjectDataContext.tsx` | Frontend state management |

## Architecture

- **Deterministic OCR Pipeline:** Document AI extracts room names and areas, then applies fixed pricing rates. Same input always produces same output.
- **JB Villan Efficiency Pricing:** `backend/ocr_service.py` contains efficiency-specific rates that reflect factory manufacturing, faster build times, and proven designs.
- **LocalStorage-First:** Frontend loads instantly from localStorage, then syncs with backend in background.
- **Context-Based State:** `ProjectDataContext` manages complex state without prop drilling.

## License

Private. All rights reserved.
