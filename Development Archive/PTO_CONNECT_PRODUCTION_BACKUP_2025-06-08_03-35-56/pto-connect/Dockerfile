# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./

# Clear npm cache and remove lock file to fix rollup issue
RUN rm -f package-lock.json && npm cache clean --force

# Install dependencies with legacy peer deps to avoid rollup conflicts
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve globally
RUN npm install -g serve@14.2.0

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start the application using Railway's PORT environment variable
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
