# Simple Dockerfile for Render deployment
FROM golang:1.21-alpine

# Install build dependencies
RUN apk add --no-cache git wget ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum first
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o spark-server ./main.go

# Create logs directory
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Expose port (Render sets PORT env var, default 10000)
EXPOSE 10000

# Health check for Render - use PORT env var or default to 10000
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-10000}/api/health || exit 1

# Run the application with explicit config path
CMD ["./spark-server", "-config", "config.json"]