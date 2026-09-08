# Stage 1: Build the Vite frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production nginx server
FROM nginx:alpine AS production

# Copy built assets to Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Place the template in Nginx's automatic template directory
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Render injects $PORT dynamically; default documentation port
EXPOSE 10000