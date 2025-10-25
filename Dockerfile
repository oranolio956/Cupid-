# Optimized Dockerfile for Render deployment
FROM golang:1.21-alpine AS go-builder

# Set working directory
WORKDIR /app

# Copy go mod files
COPY spark-setup/spark-backend/go.mod spark-setup/spark-backend/go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY spark-setup/spark-backend/ ./

# Build server
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o spark-server ./server

# Final stage
FROM alpine:latest

# Install ca-certificates and wget for health checks
RUN apk --no-cache add ca-certificates wget

# Create non-root user
RUN adduser -D -s /bin/sh spark

# Set working directory
WORKDIR /app

# Copy binary and startup script from builder
COPY --from=go-builder /app/spark-server ./
COPY spark-setup/spark-backend/start.sh ./

# Make startup script executable
RUN chmod +x start.sh

# Create logs directory
RUN mkdir -p logs && chown -R spark:spark /app

# Switch to non-root user
USER spark

# Expose port (Render will set PORT env var)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8000}/api/health || exit 1

# Run the server with startup script
CMD ["./start.sh"]