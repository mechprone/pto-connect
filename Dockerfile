# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies in the container (don't copy local node_modules)
RUN npm ci --only=production=false

# Copy source code (excluding node_modules via .dockerignore)
COPY . .

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

# Build the application
RUN npm run build

# Install serve for production
RUN npm install -g serve@14.2.0

# Expose port
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"] 