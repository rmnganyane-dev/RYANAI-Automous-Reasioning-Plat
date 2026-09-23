FROM node:22-alpine

# Install build dependencies required by node-gyp for native C++ addons
RUN apk add --no-cache python3 make g++ build-base

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install dependencies matching your local workflow
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run development server
CMD ["npm", "run", "dev"]