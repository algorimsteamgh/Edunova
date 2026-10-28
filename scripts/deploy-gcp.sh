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
ADMIN_EMAIL="${ADMIN_EMAIL:?Set ADMIN_EMAIL to the address of the first administrator account}"
DB_BUCKET="${DB_BUCKET:-${PROJECT_ID}-learnsphere-db}"
JWT_SECRET_NAME="learnsphere-jwt-secret"
ADMIN_PASSWORD_SECRET_NAME="learnsphere-admin-password"
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
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com

# 2b. Ensure Artifact Registry Docker repository exists
echo "Step 2b: Ensuring Artifact Registry repository '${REPO_NAME}' exists..."
gcloud artifacts repositories describe "${REPO_NAME}" --location="${REGION}" >/dev/null 2>&1 || \
gcloud artifacts repositories create "${REPO_NAME}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Application Docker repository" \
  --quiet

# 2c. Secrets: generated once, stored only in Secret Manager, never in the repo or the env-var list
create_secret_if_missing() {
  local name="$1" prefix="${2:-}"
  if ! gcloud secrets describe "${name}" >/dev/null 2>&1; then
    echo "Creating secret '${name}' with a random value..."
    printf '%s%s' "${prefix}" "$(openssl rand -base64 48 | tr -d '\n')" | \
      gcloud secrets create "${name}" --replication-policy=automatic --data-file=-
  fi
}
echo "Step 2c: Ensuring JWT and admin password secrets exist in Secret Manager..."
create_secret_if_missing "${JWT_SECRET_NAME}"
# The "Aa1-" prefix guarantees the upper/lower/digit rules the admin password check enforces.
create_secret_if_missing "${ADMIN_PASSWORD_SECRET_NAME}" "Aa1-"

# 2d. Durable storage: Cloud Run's disk is wiped on restart, so Litestream replicates SQLite to this bucket
echo "Step 2d: Ensuring database replica bucket gs://${DB_BUCKET} exists..."
gcloud storage buckets describe "gs://${DB_BUCKET}" >/dev/null 2>&1 || \
gcloud storage buckets create "gs://${DB_BUCKET}" --location="${REGION}" --uniform-bucket-level-access

# 2e. Let the Cloud Run runtime service account read the secrets and write the replica
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
RUNTIME_SA="${RUNTIME_SA:-${PROJECT_NUMBER}-compute@developer.gserviceaccount.com}"
echo "Step 2e: Granting ${RUNTIME_SA} access to secrets and the replica bucket..."
for secret in "${JWT_SECRET_NAME}" "${ADMIN_PASSWORD_SECRET_NAME}"; do
  gcloud secrets add-iam-policy-binding "${secret}" \
    --member="serviceAccount:${RUNTIME_SA}" --role="roles/secretmanager.secretAccessor" --quiet >/dev/null
done
gcloud storage buckets add-iam-policy-binding "gs://${DB_BUCKET}" \
  --member="serviceAccount:${RUNTIME_SA}" --role="roles/storage.objectAdmin" --quiet >/dev/null

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
  --service-account "${RUNTIME_SA}" \
  --max-instances 1 \
  --no-cpu-throttling \
  --set-env-vars="NODE_ENV=production,CORS_ORIGIN=*,LITESTREAM_BUCKET=${DB_BUCKET},ADMIN_EMAIL=${ADMIN_EMAIL}" \
  --set-secrets="JWT_SECRET=${JWT_SECRET_NAME}:latest,ADMIN_PASSWORD=${ADMIN_PASSWORD_SECRET_NAME}:latest"
# --max-instances 1: SQLite has a single writer; a second instance would replicate a diverging copy.
# --no-cpu-throttling: keeps Litestream syncing between requests.

# 5. Retrieve deployed service URL and run verification probe
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --platform managed --region "${REGION}" --format 'value(status.url)')

echo ""
echo "=========================================================="
echo "✅ Backend Deployment Successful!"
echo "Backend URL: ${SERVICE_URL}"
echo "Admin login: ${ADMIN_EMAIL}"
echo "Admin password: gcloud secrets versions access latest --secret=${ADMIN_PASSWORD_SECRET_NAME}"
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
