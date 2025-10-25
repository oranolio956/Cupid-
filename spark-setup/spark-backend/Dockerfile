# Stage 1: Build the Go binary
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make gcc musl-dev

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum first (for dependency caching)
COPY go.mod go.sum ./

# Download dependencies (cached if go.mod/go.sum unchanged)
RUN go mod download

# Copy entire source code
COPY . .

# Build static binary
# CGO_ENABLED=0: No C dependencies (fully static)
# -a: Rebuild all packages
# -installsuffix cgo: Add suffix to prevent conflicts
# -ldflags="-s -w": Strip debug symbols (smaller binary)
RUN CGO_ENABLED=0 GOOS=linux go build \
    -a -installsuffix cgo \
    -ldflags="-s -w" \
    -o spark-server \
    ./main.go

# Stage 2: Create minimal runtime image
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

# Set working directory
WORKDIR /root/

# Copy binary from builder stage
COPY --from=builder /app/spark-server .

# Copy configuration
COPY config.json .

# Create necessary directories
RUN mkdir -p logs data

# Expose port (Render will map to external port)
EXPOSE 8000

# Health check for Render
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/health || exit 1

# Run server
CMD ["./spark-server"]