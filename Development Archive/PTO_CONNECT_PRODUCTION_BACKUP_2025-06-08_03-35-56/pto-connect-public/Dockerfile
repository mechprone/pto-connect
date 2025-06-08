# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve
RUN npm install -g serve@14.2.0

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start the application using Railway's PORT environment variable
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
