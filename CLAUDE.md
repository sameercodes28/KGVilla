# Claude Code Instructions for KGVilla

## Project Overview
KGVilla is a construction cost estimation tool for Swedish housing. It uses:
- **Frontend**: Next.js 16 + React 19, deployed to GitHub Pages
- **Backend**: Python FastAPI, deployed to Google Cloud Run

---

## CRITICAL: NEVER DO THESE THINGS

### 1. NEVER trust values from a broken deployment
When debugging a broken production system:
- **DO NOT** copy values from the currently deployed (broken) Cloud Run config
- **DO** use `backend/deploy.sh` as the SINGLE SOURCE OF TRUTH for all env vars
- The broken deployment is broken BECAUSE its values are wrong

### 2. NEVER change environment variable values without verification
Before changing ANY value in `deploy.sh`:
- Ask: "Why am I changing this?"
- Check git history: `git log -p backend/deploy.sh`
- If unsure, ASK THE USER before changing

### 3. NEVER run gcloud commands directly for deployment
- **WRONG**: `gcloud run deploy ...`
- **WRONG**: `gcloud run services update --set-env-vars ...`
- **RIGHT**: `cd backend && ./deploy.sh`

### 4. NEVER skip post-deployment verification
After ANY backend deployment, VERIFY IT YOURSELF - don't ask the user to test:
1. Test health endpoint: `curl https://kgvilla-backend-30314481610.europe-north1.run.app/health`
2. Test OCR with curl:
   ```bash
   curl -s -X POST "https://kgvilla-backend-30314481610.europe-north1.run.app/analyze" \
     -H "X-API-Key: dev-key-12345" \
     -F "file=@/Users/sameerm4/Desktop/KGVilla/1328.jpg" | head -200
   ```
3. Verify the response contains items (not empty `{"items":[]}`)

### 5. ALWAYS verify changes yourself before telling user it's done
- Don't ask the user to test things you can test yourself
- Run curl commands, check logs, verify endpoints
- Only tell the user "it's working" after YOU have verified it

---

## Source of Truth for Environment Variables

**The `backend/deploy.sh` file contains the CANONICAL values. Never get values from elsewhere.**

```
GOOGLE_CLOUD_PROJECT=kgvilla
DOCUMENTAI_PROCESSOR_ID=59c3cc9c5dd39784  <-- NEVER CHANGE WITHOUT USER APPROVAL
DOCUMENTAI_LOCATION=eu
API_KEY=dev-key-12345
```

If Cloud Run shows different values, Cloud Run is WRONG - deploy.sh is RIGHT.

---

## Backend Deployment Checklist

Before deploying backend:
- [ ] Changes tested locally with `uvicorn main:app --reload`
- [ ] No values in deploy.sh were changed (or user approved changes)
- [ ] Understand what the deployment will change

After deploying backend:
- [ ] Health check passes
- [ ] API key validation passes (deploy.sh does this automatically)
- [ ] **TEST OCR**: Upload a floor plan and verify items are generated
- [ ] Check for errors in Cloud Run logs

```bash
# Always deploy using:
cd backend && ./deploy.sh

# After deployment, verify OCR works:
# 1. Go to https://sameercodes28.github.io/KGVilla/
# 2. Create a new project with a floor plan
# 3. Verify cost items appear (not 0 kr)
```

---

## Frontend Deployment

Frontend deploys automatically via GitHub Actions when pushing to `main`.

After pushing:
1. Wait for GitHub Actions to complete
2. Verify at https://sameercodes28.github.io/KGVilla/

---

## Key Files
- `backend/deploy.sh` - Backend deployment script (ALWAYS use this)
- `backend/ocr_service.py` - OCR extraction and pricing logic
- `backend/ai_service.py` - Gemini AI integration
- `src/contexts/ProjectDataContext.tsx` - Frontend state management
- `docs/technical_architecture.md` - System architecture documentation

---

## Version Bumping
When making significant changes, update version in `package.json`. This helps with cache busting and tracking releases.

---

## Incident History (Learn from Mistakes)

### 2024-11-28: API_KEY Missing
- **Cause**: Ran `gcloud run deploy` directly instead of `./deploy.sh`
- **Fix**: Added API_KEY to Cloud Run
- **Prevention**: Always use `./deploy.sh`

### 2024-11-28: Wrong DOCUMENTAI_PROCESSOR_ID
- **Cause**: Copied processor ID from broken Cloud Run config instead of deploy.sh
- **Fix**: Reverted to correct ID from deploy.sh
- **Prevention**: NEVER trust broken deployment state. deploy.sh is source of truth.
