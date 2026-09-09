# Build the Vite frontend with the lockfile for reproducible images.
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Serve the compiled SPA with Nginx.
FROM nginx:alpine AS production
ENV PORT=80

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
	CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/health || exit 1