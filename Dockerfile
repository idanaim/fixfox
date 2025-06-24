# FixFox API Dockerfile - Standalone Version
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for the standalone server
COPY server/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY server/ ./

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files and install production dependencies
COPY server/package*.json ./
RUN npm ci --production && npm cache clean --force

# Copy the built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy any additional files that might be needed (optional)
# COPY server/.env* ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fixfox -u 1001

# Change ownership of the app directory
RUN chown -R fixfox:nodejs /app
USER fixfox

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "dist/main.js"] 