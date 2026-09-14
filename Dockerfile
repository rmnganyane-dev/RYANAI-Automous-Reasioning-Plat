FROM node:22-alpine

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy lockfile and workspace configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ryanai-api/package.json ./ryanai-api/

# Install dependencies using pnpm frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
WORKDIR /app/ryanai-api
CMD ["pnpm", "run", "dev"]