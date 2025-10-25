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

# Copy configuration file
COPY config.json ./

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o spark-server ./main.go

# Expose port
EXPOSE 8000

# Health check for Render
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/health || exit 1

# Run the application
CMD ["./spark-server"]