#!/usr/bin/env bash
# ==========================================================
# LearnSphere LMS — Google Cloud Run Automated Deployment
# Target Project: learnsphere-511709
# ==========================================================
set -euo pipefail

PROJECT_ID="${1:-learnsphere-511709}"
REGION="${2:-us-central1}"
SERVICE_NAME="learnsphere-backend"
REPO_NAME="${3:-app-repo}"
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest"

echo "=========================================================="
echo "🚀 Deploying LearnSphere LMS to Google Cloud Platform"
echo "Project ID: ${PROJECT_ID}"
echo "Region:     ${REGION}"
echo "Service:    ${SERVICE_NAME}"
echo "=========================================================="

# 1. Ensure gcloud is configured to target project
echo "Step 1: Setting active GCP project to ${PROJECT_ID}..."
gcloud config set project "${PROJECT_ID}"

# 2. Enable necessary APIs
echo "Step 2: Ensuring required Google Cloud APIs are enabled..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

# 2b. Ensure Artifact Registry Docker repository exists
echo "Step 2b: Ensuring Artifact Registry repository '${REPO_NAME}' exists..."
gcloud artifacts repositories describe "${REPO_NAME}" --location="${REGION}" >/dev/null 2>&1 || \
gcloud artifacts repositories create "${REPO_NAME}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Application Docker repository" \
  --quiet

# 3. Build container using Google Cloud Build (cloud-native build)
echo "Step 3: Submitting container build to Google Cloud Build..."
gcloud builds submit \
  --tag "${IMAGE_TAG}" \
  backend/

# 4. Deploy container to Google Cloud Run
echo "Step 4: Deploying container to Serverless Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_TAG}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars="NODE_ENV=production,CORS_ORIGIN=*"

# 5. Retrieve deployed service URL and run verification probe
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --platform managed --region "${REGION}" --format 'value(status.url)')

echo ""
echo "=========================================================="
echo "✅ Backend Deployment Successful!"
echo "Backend URL: ${SERVICE_URL}"
echo "=========================================================="
echo "Testing backend health probes:"
curl -s -i "${SERVICE_URL}/health/live" | head -n 1
curl -s -i "${SERVICE_URL}/health/ready" | head -n 1

# 6. Build and Deploy Frontend to Google Cloud Run
echo ""
echo "=========================================================="
echo "🚀 Deploying Frontend Web UI to Google Cloud Run"
echo "=========================================================="
FRONTEND_SERVICE_NAME="learnsphere-frontend"
FRONTEND_IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${FRONTEND_SERVICE_NAME}:latest"

echo "Submitting frontend container build to Google Cloud Build..."
gcloud builds submit \
  --tag "${FRONTEND_IMAGE_TAG}" \
  frontend/

echo "Deploying frontend container to Serverless Cloud Run..."
gcloud run deploy "${FRONTEND_SERVICE_NAME}" \
  --image "${FRONTEND_IMAGE_TAG}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 80 \
  --memory 256Mi \
  --cpu 1

FRONTEND_URL=$(gcloud run services describe "${FRONTEND_SERVICE_NAME}" --platform managed --region "${REGION}" --format 'value(status.url)')

echo ""
echo "=========================================================="
echo "🎉 FULL STACK DEPLOYMENT COMPLETE!"
echo "Backend API URL:  ${SERVICE_URL}"
echo "Frontend Web URL: ${FRONTEND_URL}"
echo "=========================================================="
