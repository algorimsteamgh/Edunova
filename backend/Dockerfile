# ==========================================================
# Edunova Backend Dockerfile (Node.js 22 Alpine)
# Database: PostgreSQL (Amazon RDS in production)
# ==========================================================

FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Amazon RDS certificate bundle, so PGSSLMODE=verify-full can check the database's certificate
ADD --chmod=644 https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /app/certs/rds-global-bundle.pem
ENV PGSSLROOTCERT=/app/certs/rds-global-bundle.pem

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/
COPY migrations/ ./migrations/

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health/live || exit 1

CMD ["node", "src/server.js"]
