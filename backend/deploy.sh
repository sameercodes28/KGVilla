#!/bin/bash
# KGVilla Backend Deployment Script
# This script ensures deployment ONLY to the kgvilla project

set -e  # Exit on any error

# CRITICAL: Force the correct project
PROJECT="kgvilla"
REGION="europe-north1"
SERVICE="kgvilla-backend"

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
echo "Deploying..."
echo ""

# Deploy with explicit project flag (belt and suspenders)
gcloud run deploy $SERVICE \
  --source . \
  --region $REGION \
  --project $PROJECT \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=$PROJECT,DOCUMENTAI_PROCESSOR_ID=59c3cc9c5dd39784,DOCUMENTAI_LOCATION=eu,API_KEY=dev-key-12345"

echo ""
echo "=========================================="
echo "✅ Deployment complete!"
echo "Service URL: https://$SERVICE-30314481610.$REGION.run.app"
echo "=========================================="
