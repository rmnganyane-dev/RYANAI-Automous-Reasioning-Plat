FROM node:22-alpine

# Set environment to production
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy dependency files first for better layer caching
COPY package*.json npm-shrinkwrap.json* ./

# Install production dependencies
RUN npm ci --only=production --silent

# Copy application code
COPY . .

# Set correct permissions for the non-root user
RUN chown -R node:node /usr/src/app

# Run as non-root user for security
USER node

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

CMD ["npm", "start"]
