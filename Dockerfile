# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy all source code first to ensure proper context
COPY . .

# Debug: List files to see what was copied
RUN ls -la /app && echo "=== Checking for package.json ===" && ls -la /app/package.json || echo "package.json NOT FOUND"

# Clear npm cache and remove lock file to fix rollup issue
RUN rm -f package-lock.json && npm cache clean --force

# Install dependencies with legacy peer deps to avoid rollup conflicts
RUN npm install --legacy-peer-deps

# Declare build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_BACKEND_URL
ARG VITE_CLIENT_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY

# Set environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_CLIENT_URL=$VITE_CLIENT_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

# Build the application with environment variables
RUN npm run build

# Install serve globally
RUN npm install -g serve@14.2.0

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start the application using Railway's PORT environment variable
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
