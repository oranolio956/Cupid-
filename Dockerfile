# Optimized Dockerfile for Render deployment - Updated for latest fixes
FROM golang:1.21-alpine AS go-builder

# Set working directory
WORKDIR /app

# Copy go mod files
COPY spark-setup/spark-backend/go.mod spark-setup/spark-backend/go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY spark-setup/spark-backend/ ./

# Debug: List files after copy
RUN ls -la /app/

# Build server
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o spark-server ./server

# Debug: List files to verify build
RUN ls -la /app/

# Final stage
FROM alpine:latest

# Install ca-certificates and wget for health checks
RUN apk --no-cache add ca-certificates wget

# Create non-root user
RUN adduser -D -s /bin/sh spark

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=go-builder /app/spark-server ./

# Copy startup script from host
COPY spark-setup/spark-backend/start.sh ./

# Debug: List files to verify copy
RUN ls -la /app/ && echo "Files in /app after copy:"
RUN echo "Checking startup script:" && ls -la /app/start.sh && head -5 /app/start.sh

# Make files executable
RUN chmod +x start.sh spark-server

# Verify files are executable and in correct location
RUN ls -la /app/ && echo "Final file check:" && file /app/start.sh && file /app/spark-server

# Debug: Verify files are executable
RUN ls -la /app/

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
ENTRYPOINT ["/app/start.sh"]

# Fallback CMD in case ENTRYPOINT doesn't work
CMD ["/app/start.sh"]