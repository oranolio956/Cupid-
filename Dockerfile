# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /build

# Copy go mod files from the correct location
COPY spark-setup/spark-backend/go.mod spark-setup/spark-backend/go.sum ./
RUN go mod download

# Copy all backend source code
COPY spark-setup/spark-backend/ ./

# Verify web/dist exists (critical for embed)
RUN ls -la web/dist || (echo "ERROR: web/dist not found!" && exit 1)

# Build the server
RUN CGO_ENABLED=0 GOOS=linux go build -o spark-server .

# Runtime stage
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates wget

# Create app user
RUN adduser -D -s /bin/sh appuser
WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/spark-server ./
COPY spark-setup/spark-backend/config.json ./

# Set permissions
RUN chown -R appuser:appuser /app && chmod +x spark-server
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8000}/api/health || exit 1

# Run directly - no startup script needed
CMD ["./spark-server"]
