# ==========================================================
# LearnSphere Backend Dockerfile (Node.js 22 Alpine)
# Multi-stage container build with native compilation support
# ==========================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Install native dependencies required for better-sqlite3 compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN apk add --no-cache sqlite

# Copy compiled node_modules and application code
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/
COPY migrations/ ./migrations/

# Create persistent data and backup directories
RUN mkdir -p /app/data /app/backups && chown -R node:node /app

# ponytail: native Docker volume declaration persists SQLite across container restarts. Upgrade path: Cloud SQL / mounted PVC.
VOLUME ["/app/data", "/app/backups"]

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health/live || exit 1

CMD ["node", "src/server.js"]
