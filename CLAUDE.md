# Claude Code Instructions for KGVilla

## Project Overview
KGVilla is a construction cost estimation tool for Swedish housing. It uses:
- **Frontend**: Next.js 16 + React 19, deployed to GitHub Pages
- **Backend**: Python FastAPI, deployed to Google Cloud Run

## Critical Deployment Rules

### Backend Deployment (Cloud Run)
**ALWAYS use the deploy script. NEVER run `gcloud run deploy` directly.**

```bash
cd backend && ./deploy.sh
```

Why: The deploy script:
1. Sets ALL required environment variables (API_KEY, DOCUMENTAI_PROCESSOR_ID, etc.)
2. Runs post-deployment health checks
3. Validates API authentication works
4. Fails deployment if anything is broken

Direct `gcloud run deploy` commands have caused production outages by missing critical env vars.

### Frontend Deployment (GitHub Pages)
Frontend deploys automatically via GitHub Actions when pushing to `main`.

After pushing frontend changes:
1. Wait for GitHub Actions to complete
2. Verify at https://sameercodes28.github.io/KGVilla/

## Environment Variables

### Backend (Cloud Run) - Required
- `GOOGLE_CLOUD_PROJECT=kgvilla`
- `DOCUMENTAI_PROCESSOR_ID=4e83090fc2c18b12`
- `DOCUMENTAI_LOCATION=eu`
- `API_KEY=dev-key-12345`

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_API_KEY` - Must match backend's API_KEY

## Key Files
- `backend/deploy.sh` - Backend deployment script (always use this)
- `backend/ocr_service.py` - OCR extraction and pricing logic
- `backend/ai_service.py` - Gemini AI integration
- `src/contexts/ProjectDataContext.tsx` - Frontend state management
- `docs/technical_architecture.md` - System architecture documentation

## Testing Before Deployment
Before deploying backend changes:
1. Run backend locally: `cd backend && uvicorn main:app --reload`
2. Test the endpoint you changed with curl or the frontend
3. Only then deploy using `./deploy.sh`

## Version Bumping
When making significant changes, update version in `package.json`. This helps with cache busting and tracking releases.
