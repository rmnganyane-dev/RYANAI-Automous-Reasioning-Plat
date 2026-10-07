FROM node:22-alpine AS builder

WORKDIR /app

# Build-time only: Vite bakes this into the JS bundle.
# Leave empty to call the API on the same origin (nginx proxies /api, /ws, /health).
# Set it to the API's HTTPS origin when the API is hosted elsewhere.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ARG VITE_SUPABASE_URL=
ARG VITE_SUPABASE_PUBLISHABLE_KEY=
ARG VITE_SUPABASE_ANON_KEY=
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY package.json package-lock.json ./
RUN npm ci --include=dev --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runner

# The official nginx image renders /etc/nginx/templates/*.template with envsubst
# at startup, so no custom entrypoint script is needed.
ENV PORT=80 \
    API_UPSTREAM=http://api:3000

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:${PORT}/healthz || exit 1
