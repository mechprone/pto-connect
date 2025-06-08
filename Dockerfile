FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Clean up devDependencies after build
RUN npm prune --production

# Install serve
RUN npm install -g serve

# Expose port
EXPOSE 10000

# Start
CMD ["serve", "dist", "-s", "-l", "10000"]
