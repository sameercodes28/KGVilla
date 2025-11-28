#!/bin/bash
# KGVilla Backend Deployment Script
# This script ensures deployment ONLY to the kgvilla project
# ALWAYS use this script for deployments - never run gcloud run deploy directly!

set -e  # Exit on any error

# CRITICAL: Force the correct project
PROJECT="kgvilla"
REGION="europe-north1"
SERVICE="kgvilla-backend"
SERVICE_URL="https://$SERVICE-30314481610.$REGION.run.app"

# CRITICAL ENVIRONMENT VARIABLES - All required for the service to work
API_KEY="dev-key-12345"
DOCUMENTAI_PROCESSOR_ID="59c3cc9c5dd39784"
DOCUMENTAI_LOCATION="eu"

echo "=========================================="
echo "KGVilla Backend Deployment"
echo "=========================================="
echo "Target Project: $PROJECT"
echo "Target Region: $REGION"
echo "Service: $SERVICE"
echo ""

# Verify current project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT" ]; then
    echo "⚠️  WARNING: Current project is '$CURRENT_PROJECT', switching to '$PROJECT'"
    gcloud config set project $PROJECT
fi

# Double-check we're on the right project
VERIFY_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$VERIFY_PROJECT" != "$PROJECT" ]; then
    echo "❌ ERROR: Failed to set project to $PROJECT"
    exit 1
fi

echo "✅ Project verified: $PROJECT"
echo ""
echo "Environment variables to be set:"
echo "  - GOOGLE_CLOUD_PROJECT=$PROJECT"
echo "  - DOCUMENTAI_PROCESSOR_ID=$DOCUMENTAI_PROCESSOR_ID"
echo "  - DOCUMENTAI_LOCATION=$DOCUMENTAI_LOCATION"
echo "  - API_KEY=****** (hidden)"
echo ""
echo "Deploying..."
echo ""

# Deploy with explicit project flag (belt and suspenders)
# IMPORTANT: --set-env-vars REPLACES ALL env vars, so ALL required vars must be listed here
gcloud run deploy $SERVICE \
  --source . \
  --region $REGION \
  --project $PROJECT \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=$PROJECT,DOCUMENTAI_PROCESSOR_ID=$DOCUMENTAI_PROCESSOR_ID,DOCUMENTAI_LOCATION=$DOCUMENTAI_LOCATION,API_KEY=$API_KEY"

echo ""
echo "=========================================="
echo "Verifying deployment..."
echo "=========================================="

# Wait for service to be ready
sleep 5

# Health check - verify the service is responding
echo "Running health check..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response.txt "$SERVICE_URL/health" 2>/dev/null || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Health check passed!"
    cat /tmp/health_response.txt
    echo ""
else
    echo "⚠️  Health check returned status $HEALTH_RESPONSE"
    cat /tmp/health_response.txt 2>/dev/null || true
    echo ""
fi

# API Key check - verify authenticated endpoints work
echo "Testing authenticated endpoint..."
API_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/api_response.txt -H "X-API-Key: $API_KEY" "$SERVICE_URL/projects" 2>/dev/null || echo "000")

if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ API Key validation passed!"
else
    echo "❌ ERROR: API Key validation failed with status $API_RESPONSE"
    echo "Response:"
    cat /tmp/api_response.txt 2>/dev/null || true
    echo ""
    echo "⚠️  DEPLOYMENT MAY BE BROKEN - API_KEY might not be set correctly"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Deployment complete and verified!"
echo "Service URL: $SERVICE_URL"
echo ""
echo "⚠️  IMPORTANT: Manually test OCR by uploading a floor plan!"
echo "   Go to: https://sameercodes28.github.io/KGVilla/"
echo "   Create a new project and verify cost items are generated."
echo "=========================================="
