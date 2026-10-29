# ==========================================================
# LearnSphere Frontend Dockerfile (Multi-stage NGINX)
# ==========================================================

# Stage 1: Build React SPA
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# Stage 2: Serve with lightweight NGINX
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
# The nginx image renders templates/*.template into conf.d at startup, substituting env vars
COPY templates/ /etc/nginx/templates/
ENV BACKEND_URL=http://backend:8080
# Only substitute BACKEND_URL, so nginx's own $variables are left alone
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
