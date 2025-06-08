# Use Node.js 20 Alpine for latest features
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies and clear npm cache
RUN rm -rf node_modules package-lock.json && \
    npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve to serve static files
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
