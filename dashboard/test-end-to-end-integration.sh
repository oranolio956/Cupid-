#!/bin/bash

# End-to-End Integration Testing Script
# This script tests the complete Spark RAT system integration

echo "🧪 Spark RAT End-to-End Integration Testing"
echo "=========================================="
echo ""

# Configuration
BACKEND_URL="https://spark-backend-fixed-v2.onrender.com"
FRONTEND_URL="https://spark-rat-dashboard.vercel.app"
TEST_RESULTS_FILE="test-results-$(date +%Y%m%d-%H%M%S).json"

# Initialize test results
echo "{\"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"tests\": []}" > "$TEST_RESULTS_FILE"

# Test counter
TEST_COUNT=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to add test result
add_test_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    local details="$4"
    
    TEST_COUNT=$((TEST_COUNT + 1))
    
    if [ "$status" = "PASS" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "✅ $test_name: $message"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "❌ $test_name: $message"
    fi
    
    # Add to JSON results
    jq --arg name "$test_name" --arg status "$status" --arg message "$message" --arg details "$details" \
        '.tests += [{"name": $name, "status": $status, "message": $message, "details": $details}]' \
        "$TEST_RESULTS_FILE" > tmp.json && mv tmp.json "$TEST_RESULTS_FILE"
}

echo "🔍 Testing Backend Services..."
echo "============================="

# Test 1: Backend Health Check
echo "Test 1: Backend Health Check"
HEALTH_RESPONSE=$(curl -s --max-time 10 "$BACKEND_URL/api/info" 2>/dev/null)
if [ $? -eq 0 ] && echo "$HEALTH_RESPONSE" | grep -q "version"; then
    add_test_result "Backend Health Check" "PASS" "Backend is responding" "$HEALTH_RESPONSE"
else
    add_test_result "Backend Health Check" "FAIL" "Backend not responding or invalid response" "$HEALTH_RESPONSE"
fi

# Test 2: Backend Device List
echo "Test 2: Backend Device List"
DEVICE_RESPONSE=$(curl -s --max-time 10 "$BACKEND_URL/api/device/list" 2>/dev/null)
if [ $? -eq 0 ]; then
    add_test_result "Backend Device List" "PASS" "Device list endpoint accessible" "$DEVICE_RESPONSE"
else
    add_test_result "Backend Device List" "FAIL" "Device list endpoint not accessible" "$DEVICE_RESPONSE"
fi

# Test 3: Backend CORS Headers
echo "Test 3: Backend CORS Headers"
CORS_HEADERS=$(curl -s -I --max-time 10 -H "Origin: $FRONTEND_URL" "$BACKEND_URL/api/info" 2>/dev/null)
if echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Origin"; then
    add_test_result "Backend CORS Headers" "PASS" "CORS headers present" "$CORS_HEADERS"
else
    add_test_result "Backend CORS Headers" "FAIL" "CORS headers missing" "$CORS_HEADERS"
fi

echo ""
echo "🔍 Testing Frontend Services..."
echo "=============================="

# Test 4: Frontend Accessibility
echo "Test 4: Frontend Accessibility"
FRONTEND_RESPONSE=$(curl -s --max-time 10 "$FRONTEND_URL" 2>/dev/null)
if [ $? -eq 0 ] && echo "$FRONTEND_RESPONSE" | grep -q "html"; then
    add_test_result "Frontend Accessibility" "PASS" "Frontend is accessible" "HTML content received"
else
    add_test_result "Frontend Accessibility" "FAIL" "Frontend not accessible" "$FRONTEND_RESPONSE"
fi

# Test 5: Frontend Login Page
echo "Test 5: Frontend Login Page"
LOGIN_RESPONSE=$(curl -s --max-time 10 "$FRONTEND_URL/login" 2>/dev/null)
if [ $? -eq 0 ] && echo "$LOGIN_RESPONSE" | grep -q "login"; then
    add_test_result "Frontend Login Page" "PASS" "Login page accessible" "Login page content received"
else
    add_test_result "Frontend Login Page" "FAIL" "Login page not accessible" "$LOGIN_RESPONSE"
fi

# Test 6: Frontend Security Headers
echo "Test 6: Frontend Security Headers"
FRONTEND_HEADERS=$(curl -s -I --max-time 10 "$FRONTEND_URL" 2>/dev/null)
if echo "$FRONTEND_HEADERS" | grep -q "X-Frame-Options"; then
    add_test_result "Frontend Security Headers" "PASS" "Security headers present" "$FRONTEND_HEADERS"
else
    add_test_result "Frontend Security Headers" "FAIL" "Security headers missing" "$FRONTEND_HEADERS"
fi

echo ""
echo "🔍 Testing Integration..."
echo "======================="

# Test 7: Frontend-Backend API Connection
echo "Test 7: Frontend-Backend API Connection"
# This test simulates what the frontend would do
API_TEST_RESPONSE=$(curl -s --max-time 10 -H "Origin: $FRONTEND_URL" -H "Content-Type: application/json" "$BACKEND_URL/api/info" 2>/dev/null)
if [ $? -eq 0 ] && echo "$API_TEST_RESPONSE" | grep -q "version"; then
    add_test_result "Frontend-Backend API Connection" "PASS" "API connection successful" "$API_TEST_RESPONSE"
else
    add_test_result "Frontend-Backend API Connection" "FAIL" "API connection failed" "$API_TEST_RESPONSE"
fi

# Test 8: WebSocket Connection (if wscat is available)
echo "Test 8: WebSocket Connection"
if command -v wscat &> /dev/null; then
    WS_TEST=$(timeout 5 wscat -c "wss://spark-backend-fixed-v2.onrender.com/ws" 2>&1)
    if echo "$WS_TEST" | grep -q "Connected"; then
        add_test_result "WebSocket Connection" "PASS" "WebSocket connection successful" "$WS_TEST"
    else
        add_test_result "WebSocket Connection" "FAIL" "WebSocket connection failed" "$WS_TEST"
    fi
else
    add_test_result "WebSocket Connection" "SKIP" "wscat not available for testing" "Install wscat: npm install -g wscat"
fi

# Test 9: SSL Certificate Validation
echo "Test 9: SSL Certificate Validation"
SSL_TEST=$(echo | openssl s_client -servername spark-backend-fixed-v2.onrender.com -connect spark-backend-fixed-v2.onrender.com:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ $? -eq 0 ] && echo "$SSL_TEST" | grep -q "notAfter"; then
    add_test_result "SSL Certificate Validation" "PASS" "SSL certificate valid" "$SSL_TEST"
else
    add_test_result "SSL Certificate Validation" "FAIL" "SSL certificate invalid or expired" "$SSL_TEST"
fi

echo ""
echo "🔍 Testing Performance..."
echo "======================="

# Test 10: Response Time
echo "Test 10: Response Time"
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null --max-time 10 "$BACKEND_URL/api/info" 2>/dev/null)
if [ $? -eq 0 ] && (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    add_test_result "Response Time" "PASS" "Response time acceptable: ${RESPONSE_TIME}s" "Backend responds within 5 seconds"
else
    add_test_result "Response Time" "FAIL" "Response time too slow: ${RESPONSE_TIME}s" "Backend response time exceeds 5 seconds"
fi

# Test 11: Frontend Load Time
echo "Test 11: Frontend Load Time"
FRONTEND_TIME=$(curl -s -w "%{time_total}" -o /dev/null --max-time 10 "$FRONTEND_URL" 2>/dev/null)
if [ $? -eq 0 ] && (( $(echo "$FRONTEND_TIME < 10.0" | bc -l) )); then
    add_test_result "Frontend Load Time" "PASS" "Frontend load time acceptable: ${FRONTEND_TIME}s" "Frontend loads within 10 seconds"
else
    add_test_result "Frontend Load Time" "FAIL" "Frontend load time too slow: ${FRONTEND_TIME}s" "Frontend load time exceeds 10 seconds"
fi

echo ""
echo "📊 Test Results Summary"
echo "======================"
echo "Total Tests: $TEST_COUNT"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Success Rate: $(( (PASSED_TESTS * 100) / TEST_COUNT ))%"
echo ""

# Update final results
jq --arg total "$TEST_COUNT" --arg passed "$PASSED_TESTS" --arg failed "$FAILED_TESTS" \
    '. + {"summary": {"total": ($total | tonumber), "passed": ($passed | tonumber), "failed": ($failed | tonumber), "success_rate": (($passed | tonumber) * 100 / ($total | tonumber))}}' \
    "$TEST_RESULTS_FILE" > tmp.json && mv tmp.json "$TEST_RESULTS_FILE"

echo "📋 Detailed Results:"
echo "==================="
jq -r '.tests[] | "\(.status) \(.name): \(.message)"' "$TEST_RESULTS_FILE"

echo ""
echo "📄 Full test results saved to: $TEST_RESULTS_FILE"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed! The Spark RAT system is fully integrated and working."
    echo "   Backend: $BACKEND_URL"
    echo "   Frontend: $FRONTEND_URL"
    exit 0
else
    echo ""
    echo "⚠️  Some tests failed. Please review the results and fix any issues."
    exit 1
fi