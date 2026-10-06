FROM node:22-alpine AS builder

WORKDIR /app

# Dependency lifecycle scripts remain enabled; the root addon is opt-in.
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --include=dev --legacy-peer-deps

COPY tsconfig*.json ./
COPY src ./src
COPY scripts/copy-server-assets.mjs ./scripts/copy-server-assets.mjs
COPY models/catalog.json ./models/catalog.json
COPY app/routes.json ./app/routes.json
COPY prisma ./prisma

RUN npm run db:generate \
    && npm run build:server \
    && npm prune --omit=dev --legacy-peer-deps

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

RUN apk add --no-cache dumb-init libstdc++ libc6-compat wget \
    && mkdir -p /app/logs \
    && chown -R node:node /app

COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist/server ./dist/server
COPY --from=builder --chown=node:node /app/dist/app ./dist/app
COPY --from=builder --chown=node:node /app/dist/models ./dist/models

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health',{signal:AbortSignal.timeout(4000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server/server/launcher.js"]
