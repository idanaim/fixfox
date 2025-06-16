# FixFox API Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/rest-man-server/package*.json ./apps/rest-man-server/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application using NX
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy the complete build output from NX (includes generated package.json with dependencies)
COPY --from=builder /app/dist/apps/rest-man-server ./

# Install production dependencies (using the generated package.json)
RUN npm ci --production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application (main.js is in the current directory, not dist/main.js)
CMD ["node", "main.js"] 