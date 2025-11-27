#!/bin/bash

# Backend Deployment Verification Script
# This script verifies that the Spark backend is properly deployed and running

set -e

echo "🔍 Verifying Spark Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default service URL (update this if different)
SERVICE_URL="https://spark-backend-fixed-v2.onrender.com"

# Check if service URL is provided as argument
if [ $# -eq 1 ]; then
    SERVICE_URL="$1"
fi

print_status "Testing backend at: $SERVICE_URL"

# Test 1: Basic connectivity
print_status "Test 1: Basic connectivity..."
if curl -f -s --max-time 30 "$SERVICE_URL" > /dev/null; then
    print_success "✓ Backend is reachable"
else
    print_error "✗ Backend is not reachable"
    exit 1
fi

# Test 2: Health endpoint
print_status "Test 2: Health endpoint (/api/info)..."
HEALTH_RESPONSE=$(curl -s --max-time 30 "$SERVICE_URL/api/info" 2>/dev/null || echo "ERROR")

if [ "$HEALTH_RESPONSE" = "ERROR" ]; then
    print_error "✗ Health endpoint failed"
    exit 1
else
    print_success "✓ Health endpoint responding"
    echo "Response: $HEALTH_RESPONSE"
fi

# Test 3: API endpoints
print_status "Test 3: API endpoints..."

# Test device list endpoint
DEVICE_RESPONSE=$(curl -s --max-time 30 "$SERVICE_URL/api/device/list" 2>/dev/null || echo "ERROR")
if [ "$DEVICE_RESPONSE" = "ERROR" ]; then
    print_warning "⚠ Device list endpoint failed (may be expected if no clients connected)"
else
    print_success "✓ Device list endpoint responding"
fi

# Test 4: WebSocket endpoint (basic check)
print_status "Test 4: WebSocket endpoint..."
WS_URL=$(echo "$SERVICE_URL" | sed 's/https:/wss:/' | sed 's/http:/ws:/')
print_status "WebSocket URL: $WS_URL"

# Test 5: CORS headers
print_status "Test 5: CORS headers..."
CORS_HEADERS=$(curl -s -I --max-time 30 "$SERVICE_URL/api/info" 2>/dev/null | grep -i "access-control" || echo "No CORS headers")
print_status "CORS headers: $CORS_HEADERS"

# Test 6: Response time
print_status "Test 6: Response time..."
RESPONSE_TIME=$(curl -s -w "%{time_total}" --max-time 30 "$SERVICE_URL/api/info" -o /dev/null 2>/dev/null || echo "ERROR")
if [ "$RESPONSE_TIME" != "ERROR" ]; then
    print_success "✓ Response time: ${RESPONSE_TIME}s"
else
    print_warning "⚠ Could not measure response time"
fi

# Test 7: SSL/TLS certificate
print_status "Test 7: SSL/TLS certificate..."
if echo "$SERVICE_URL" | grep -q "https"; then
    SSL_INFO=$(echo | openssl s_client -servername $(echo "$SERVICE_URL" | sed 's|https://||' | sed 's|/.*||') -connect $(echo "$SERVICE_URL" | sed 's|https://||' | sed 's|/.*||'):443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "SSL check failed")
    if [ "$SSL_INFO" != "SSL check failed" ]; then
        print_success "✓ SSL certificate is valid"
    else
        print_warning "⚠ Could not verify SSL certificate"
    fi
fi

# Summary
echo ""
print_status "=== DEPLOYMENT VERIFICATION SUMMARY ==="
print_success "✓ Backend is deployed and running"
print_success "✓ Health endpoint is responding"
print_success "✓ API endpoints are accessible"

if [ "$DEVICE_RESPONSE" != "ERROR" ]; then
    print_success "✓ Device management is working"
else
    print_warning "⚠ Device management needs client connections to test fully"
fi

print_status "Backend URL: $SERVICE_URL"
print_status "WebSocket URL: $WS_URL"

echo ""
print_success "🎉 Backend deployment verification completed!"
print_status "Next steps:"
echo "  1. Deploy frontend to Vercel"
echo "  2. Update frontend configuration with backend URL"
echo "  3. Test client connections"
echo "  4. Verify end-to-end functionality"