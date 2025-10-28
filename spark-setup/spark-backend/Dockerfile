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

# Expose port (Render sets PORT env var, default 8000)
EXPOSE 8000

# Note: Removed Docker HEALTHCHECK - Render handles health checks via HTTP
# Render will check /api/health endpoint configured in service settings

# Run the application with explicit config path
CMD ["./spark-server", "-config", "config.json"]