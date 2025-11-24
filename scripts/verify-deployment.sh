#!/bin/bash

# verify-deployment.sh
# A comprehensive health check for the KGVilla application.

echo "🏥 KGVilla Deployment Verification"
echo "================================"

# 1. Check Node Environment
echo "Checking Node.js environment..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm could not be found"
    exit 1
fi
echo "✅ npm found"

# 2. Verify Configuration & Environment
echo "Checking configuration..."
if [ -f "next.config.ts" ]; then
    echo "✅ next.config.ts exists"
else
    echo "❌ next.config.ts missing"
    exit 1
fi

# Check for Critical Env Vars (Warn if missing in dev, Fail in prod if needed)
# Note: In CI/CD, these are secrets. Locally, they might be in .env
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_API_URL is not set. Frontend might default to hardcoded fallback."
fi
if [ -z "$NEXT_PUBLIC_API_KEY" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_API_KEY is not set. Backend writes might fail."
fi
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "⚠️  Warning: GOOGLE_CLOUD_PROJECT is not set. Backend features might be limited."
fi

# 3. Backend Dependency Check
echo "Checking Backend Dependencies..."
if [ -f "backend/requirements.txt" ]; then
    echo "✅ backend/requirements.txt exists"
else
    echo "❌ backend/requirements.txt missing"
    exit 1
fi

# 4. Code Quality (Linting)
echo "Running Linter..."
if npm run lint; then
    echo "✅ Linting passed"
else
    echo "❌ Linting failed! Fix errors before deploying."
    exit 1
fi

# 5. Asset Integrity Check
echo "Verifying Assets..."
# Find all asset references in src/ and check if they exist in public/
# Matches patterns like: src="/foo.png" or url('/foo.png')
ASSET_ERRORS=0
# Grep for likely asset paths (simplified regex)
# We look for strings starting with / and ending with an image extension inside quotes
grep -r -o -E "['\"]/[^'\"]+\.(svg|png|jpg|jpeg|gif)['\"]" src/ | sort | uniq | while read -r match; do
    # Clean up the match: remove file path prefix and quotes
    # Input format: src/file.tsx:'/image.png'
    clean_path=$(echo "$match" | sed -E 's/^.*:['"'"'"]//' | sed -E 's/['"'"'"]$//')
    
    # Remove leading slash to check relative to public folder
    relative_path=".${clean_path}"
    
    if [ ! -f "public$clean_path" ]; then
        echo "❌ Missing asset: $clean_path (referenced in code)"
        ASSET_ERRORS=1
    else
        echo "   Asset found: $clean_path"
    fi
done

if [ -f "public/globe.svg" ]; then
    echo "✅ Base assets confirmed."
else 
    echo "⚠️  Warning: globe.svg missing."
fi

# 6. Build Frontend (Dry Run)
echo "Verifying Frontend Build..."
if npm run build; then
    echo "✅ Frontend Build Successful"
else
    echo "❌ Frontend Build Failed! Check console output above."
    exit 1
fi

echo "================================"
echo "🎉 READY FOR DEPLOYMENT"
echo "To deploy manually:"
echo "  Frontend: git push (triggers GitHub Pages action)"
echo "  Backend:  gcloud run deploy (if configured)"
exit 0
