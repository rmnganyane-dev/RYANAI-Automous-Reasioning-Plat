# Stage 1: Build the Vite frontend
FROM node:22-alpine AS builder
WORKDIR /app

# Copy lockfiles first to leverage Docker layer caching
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Copy source code and produce production build
COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine AS production

# Copy built assets to Nginx default document root
COPY --from=builder /app/dist /usr/share/nginx/html

# Override default virtual host configuration instead of replacing main nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Monitor Nginx process health
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]