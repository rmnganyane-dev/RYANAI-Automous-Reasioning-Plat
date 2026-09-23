FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Render dynamic port substitution and startup command
ENV PORT=10000
EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]