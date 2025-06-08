FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install with explicit Rollup module for Alpine
RUN rm -rf node_modules package-lock.json || true && \
    npm cache clean --force && \
    npm install --no-optional && \
    npm install @rollup/rollup-linux-x64-musl --save-optional

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Expose port
EXPOSE 10000

# Start the application
CMD ["serve", "dist", "-s", "-l", "10000"]
