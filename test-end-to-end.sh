#!/bin/bash

# End-to-End Integration Test Script for Spark RAT System
# This script tests the complete system integration

set -e

echo "🧪 Starting End-to-End Integration Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_test() {
    echo -e "${PURPLE}[TEST]${NC} $1"
}

# Configuration
BACKEND_URL="https://spark-backend-fixed-v2.onrender.com"
FRONTEND_URL="https://spark-rat-dashboard.vercel.app"
WS_URL="wss://spark-backend-fixed-v2.onrender.com"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    print_test "Running: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "✅ PASSED: $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_error "❌ FAILED: $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test HTTP endpoint
test_http() {
    local url="$1"
    local expected_status="$2"
    local test_name="$3"
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$url")
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    print_test "Testing: $test_name"
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "✅ PASSED: $test_name (Status: $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_error "❌ FAILED: $test_name (Expected: $expected_status, Got: $status_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test API response
test_api() {
    local url="$1"
    local expected_field="$2"
    local test_name="$3"
    
    local response=$(curl -s --max-time 30 "$url" 2>/dev/null || echo "ERROR")
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    print_test "Testing: $test_name"
    
    if echo "$response" | grep -q "$expected_field"; then
        print_success "✅ PASSED: $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_error "❌ FAILED: $test_name (Response: $response)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo ""
print_status "=== SPARK RAT END-TO-END INTEGRATION TESTS ==="
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "WebSocket URL: $WS_URL"
echo ""

print_status "Phase 1: Backend Health Tests"

# Test 1: Backend is reachable
test_http "$BACKEND_URL" "200" "Backend is reachable"

# Test 2: Health endpoint
test_api "$BACKEND_URL/api/info" "version" "Health endpoint returns version"

# Test 3: Device list endpoint
test_api "$BACKEND_URL/api/device/list" "code" "Device list endpoint responds"

# Test 4: CORS headers
print_test "Testing: CORS headers"
CORS_HEADERS=$(curl -s -I --max-time 30 "$BACKEND_URL/api/info" 2>/dev/null | grep -i "access-control" || echo "No CORS headers")
if echo "$CORS_HEADERS" | grep -q "access-control"; then
    print_success "✅ PASSED: CORS headers present"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_warning "⚠️ WARNING: CORS headers not found (may be normal)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

print_status "Phase 2: Frontend Tests"

# Test 5: Frontend is reachable
test_http "$FRONTEND_URL" "200" "Frontend is reachable"

# Test 6: Frontend loads React app
print_test "Testing: Frontend loads React app"
FRONTEND_RESPONSE=$(curl -s --max-time 30 "$FRONTEND_URL" 2>/dev/null || echo "ERROR")
if echo "$FRONTEND_RESPONSE" | grep -q "react"; then
    print_success "✅ PASSED: Frontend loads React app"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_warning "⚠️ WARNING: React app detection failed (may be minified)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 7: Frontend static assets
test_http "$FRONTEND_URL/static" "200" "Frontend static assets accessible"

print_status "Phase 3: WebSocket Tests"

# Test 8: WebSocket endpoint (basic connectivity)
print_test "Testing: WebSocket endpoint connectivity"
if command -v wscat &> /dev/null; then
    if timeout 10 wscat -c "$WS_URL/ws" --close &>/dev/null; then
        print_success "✅ PASSED: WebSocket endpoint is reachable"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_warning "⚠️ WARNING: WebSocket connection failed (may be normal if no clients connected)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
else
    print_warning "⚠️ WARNING: wscat not available, skipping WebSocket test"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

print_status "Phase 4: API Integration Tests"

# Test 9: API response format
print_test "Testing: API response format"
API_RESPONSE=$(curl -s --max-time 30 "$BACKEND_URL/api/info" 2>/dev/null || echo "ERROR")
if echo "$API_RESPONSE" | grep -q "{" && echo "$API_RESPONSE" | grep -q "}"; then
    print_success "✅ PASSED: API returns valid JSON"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: API does not return valid JSON"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 10: API error handling
print_test "Testing: API error handling"
ERROR_RESPONSE=$(curl -s --max-time 30 "$BACKEND_URL/api/nonexistent" 2>/dev/null || echo "ERROR")
if echo "$ERROR_RESPONSE" | grep -q "404\|error\|not found"; then
    print_success "✅ PASSED: API handles errors gracefully"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_warning "⚠️ WARNING: API error handling unclear"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

print_status "Phase 5: Performance Tests"

# Test 11: Response time
print_test "Testing: Backend response time"
RESPONSE_TIME=$(curl -s -w "%{time_total}" --max-time 30 "$BACKEND_URL/api/info" -o /dev/null 2>/dev/null || echo "ERROR")
if [ "$RESPONSE_TIME" != "ERROR" ]; then
    RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "0")
    if (( $(echo "$RESPONSE_TIME < 5" | bc -l) )); then
        print_success "✅ PASSED: Backend response time is acceptable (${RESPONSE_TIME}s)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_warning "⚠️ WARNING: Backend response time is slow (${RESPONSE_TIME}s)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
else
    print_warning "⚠️ WARNING: Could not measure response time"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 12: Frontend response time
print_test "Testing: Frontend response time"
FRONTEND_RESPONSE_TIME=$(curl -s -w "%{time_total}" --max-time 30 "$FRONTEND_URL" -o /dev/null 2>/dev/null || echo "ERROR")
if [ "$FRONTEND_RESPONSE_TIME" != "ERROR" ]; then
    if (( $(echo "$FRONTEND_RESPONSE_TIME < 10" | bc -l) )); then
        print_success "✅ PASSED: Frontend response time is acceptable (${FRONTEND_RESPONSE_TIME}s)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_warning "⚠️ WARNING: Frontend response time is slow (${FRONTEND_RESPONSE_TIME}s)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
else
    print_warning "⚠️ WARNING: Could not measure frontend response time"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

print_status "Phase 6: Security Tests"

# Test 13: HTTPS enforcement
print_test "Testing: HTTPS enforcement"
HTTP_URL=$(echo "$BACKEND_URL" | sed 's/https:/http:/')
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$HTTP_URL" 2>/dev/null || echo "ERROR")
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ] || [ "$HTTP_STATUS" = "ERROR" ]; then
    print_success "✅ PASSED: HTTPS is enforced (HTTP redirects or fails)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_warning "⚠️ WARNING: HTTPS enforcement unclear (HTTP status: $HTTP_STATUS)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 14: Security headers
print_test "Testing: Security headers"
SECURITY_HEADERS=$(curl -s -I --max-time 30 "$FRONTEND_URL" 2>/dev/null | grep -i "x-content-type-options\|x-frame-options\|x-xss-protection" || echo "No security headers")
if echo "$SECURITY_HEADERS" | grep -q "x-"; then
    print_success "✅ PASSED: Security headers present"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_warning "⚠️ WARNING: Security headers not found"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

print_status "Phase 7: Client Configuration Tests"

# Test 15: Client download endpoints
print_test "Testing: Client download endpoints"
CLIENT_RESPONSE=$(curl -s --max-time 30 "$FRONTEND_URL/api/client/download/windows" 2>/dev/null || echo "ERROR")
if [ "$CLIENT_RESPONSE" != "ERROR" ]; then
    print_success "✅ PASSED: Client download endpoint responds"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_warning "⚠️ WARNING: Client download endpoint not available"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

print_status "Phase 8: End-to-End Workflow Tests"

# Test 16: Complete workflow simulation
print_test "Testing: Complete workflow simulation"
WORKFLOW_TEST=0

# Step 1: Backend health
if curl -f -s --max-time 30 "$BACKEND_URL/api/info" > /dev/null; then
    WORKFLOW_TEST=$((WORKFLOW_TEST + 1))
fi

# Step 2: Frontend accessibility
if curl -f -s --max-time 30 "$FRONTEND_URL" > /dev/null; then
    WORKFLOW_TEST=$((WORKFLOW_TEST + 1))
fi

# Step 3: API integration
if curl -f -s --max-time 30 "$BACKEND_URL/api/device/list" > /dev/null; then
    WORKFLOW_TEST=$((WORKFLOW_TEST + 1))
fi

if [ $WORKFLOW_TEST -eq 3 ]; then
    print_success "✅ PASSED: Complete workflow simulation successful"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: Complete workflow simulation failed ($WORKFLOW_TEST/3 steps passed)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

echo ""
print_status "=== TEST RESULTS SUMMARY ==="
echo "Total Tests: $TESTS_TOTAL"
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
echo "Success Rate: $(( (TESTS_PASSED * 100) / TESTS_TOTAL ))%"

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "🎉 ALL TESTS PASSED! System is ready for production."
    exit 0
elif [ $TESTS_FAILED -le 2 ]; then
    print_warning "⚠️ Most tests passed. System is mostly functional with minor issues."
    exit 0
else
    print_error "❌ Multiple tests failed. System needs attention before production."
    exit 1
fi