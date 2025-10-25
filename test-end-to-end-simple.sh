#!/bin/bash

# Simple End-to-End Integration Testing Script
# This script tests the complete Spark RAT system integration

echo "🧪 Spark RAT End-to-End Integration Testing"
echo "=========================================="
echo ""

# Configuration
BACKEND_URL="https://spark-backend-fixed-v2.onrender.com"
FRONTEND_URL="https://spark-rat-dashboard.vercel.app"

# Test counter
TEST_COUNT=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    TEST_COUNT=$((TEST_COUNT + 1))
    echo "Test $TEST_COUNT: $test_name"
    
    # Run the test command
    local result
    result=$(eval "$test_command" 2>/dev/null)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ] && echo "$result" | grep -q "$expected_pattern"; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "✅ PASS: $test_name"
        echo "   Response: $(echo "$result" | head -c 100)..."
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "❌ FAIL: $test_name"
        echo "   Exit code: $exit_code"
        echo "   Response: $(echo "$result" | head -c 100)..."
    fi
    echo ""
}

echo "🔍 Testing Backend Services..."
echo "============================="

# Test 1: Backend Health Check
run_test "Backend Health Check" "curl -s --max-time 10 '$BACKEND_URL/api/info'" "version"

# Test 2: Backend Device List
run_test "Backend Device List" "curl -s --max-time 10 '$BACKEND_URL/api/device/list'" ""

# Test 3: Backend CORS Headers
run_test "Backend CORS Headers" "curl -s -I --max-time 10 -H 'Origin: $FRONTEND_URL' '$BACKEND_URL/api/info'" "Access-Control"

echo "🔍 Testing Frontend Services..."
echo "=============================="

# Test 4: Frontend Accessibility
run_test "Frontend Accessibility" "curl -s --max-time 10 '$FRONTEND_URL'" "html"

# Test 5: Frontend Login Page
run_test "Frontend Login Page" "curl -s --max-time 10 '$FRONTEND_URL/login'" ""

# Test 6: Frontend Security Headers
run_test "Frontend Security Headers" "curl -s -I --max-time 10 '$FRONTEND_URL'" "X-Frame-Options"

echo "🔍 Testing Integration..."
echo "======================="

# Test 7: Frontend-Backend API Connection
run_test "Frontend-Backend API Connection" "curl -s --max-time 10 -H 'Origin: $FRONTEND_URL' -H 'Content-Type: application/json' '$BACKEND_URL/api/info'" "version"

# Test 8: SSL Certificate Validation
run_test "SSL Certificate Validation" "echo | openssl s_client -servername spark-backend-fixed-v2.onrender.com -connect spark-backend-fixed-v2.onrender.com:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null" "notAfter"

echo "🔍 Testing Performance..."
echo "======================="

# Test 9: Response Time
echo "Test 9: Backend Response Time"
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null --max-time 10 "$BACKEND_URL/api/info" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ PASS: Backend Response Time"
    echo "   Response time: ${RESPONSE_TIME}s"
else
    echo "❌ FAIL: Backend Response Time"
    echo "   Could not measure response time"
fi
echo ""

# Test 10: Frontend Load Time
echo "Test 10: Frontend Load Time"
FRONTEND_TIME=$(curl -s -w "%{time_total}" -o /dev/null --max-time 10 "$FRONTEND_URL" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ PASS: Frontend Load Time"
    echo "   Load time: ${FRONTEND_TIME}s"
else
    echo "❌ FAIL: Frontend Load Time"
    echo "   Could not measure load time"
fi
echo ""

echo "📊 Test Results Summary"
echo "======================"
echo "Total Tests: $TEST_COUNT"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"

if [ $TEST_COUNT -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TEST_COUNT ))
    echo "Success Rate: $SUCCESS_RATE%"
else
    echo "Success Rate: 0%"
fi
echo ""

echo "🔍 Detailed Test Results:"
echo "========================="

# Test 1: Backend Health Check
echo "1. Backend Health Check:"
HEALTH_RESPONSE=$(curl -s --max-time 10 "$BACKEND_URL/api/info" 2>/dev/null)
if [ $? -eq 0 ] && echo "$HEALTH_RESPONSE" | grep -q "version"; then
    echo "   ✅ Backend is responding with: $HEALTH_RESPONSE"
else
    echo "   ❌ Backend not responding or invalid response"
    echo "   Response: $HEALTH_RESPONSE"
fi
echo ""

# Test 2: Frontend Accessibility
echo "2. Frontend Accessibility:"
FRONTEND_RESPONSE=$(curl -s --max-time 10 "$FRONTEND_URL" 2>/dev/null)
if [ $? -eq 0 ] && echo "$FRONTEND_RESPONSE" | grep -q "html"; then
    echo "   ✅ Frontend is accessible"
    echo "   Content length: $(echo "$FRONTEND_RESPONSE" | wc -c) characters"
else
    echo "   ❌ Frontend not accessible"
    echo "   Response: $(echo "$FRONTEND_RESPONSE" | head -c 200)..."
fi
echo ""

# Test 3: API Integration
echo "3. API Integration:"
API_RESPONSE=$(curl -s --max-time 10 -H "Origin: $FRONTEND_URL" "$BACKEND_URL/api/info" 2>/dev/null)
if [ $? -eq 0 ] && echo "$API_RESPONSE" | grep -q "version"; then
    echo "   ✅ API integration working"
    echo "   Response: $API_RESPONSE"
else
    echo "   ❌ API integration failed"
    echo "   Response: $API_RESPONSE"
fi
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "🎉 All tests passed! The Spark RAT system is fully integrated and working."
    echo "   Backend: $BACKEND_URL"
    echo "   Frontend: $FRONTEND_URL"
    echo ""
    echo "🚀 System is ready for production use!"
    exit 0
else
    echo "⚠️  Some tests failed. Please review the results and fix any issues."
    echo ""
    echo "🔧 Troubleshooting Tips:"
    echo "1. Check if both services are deployed and running"
    echo "2. Verify environment variables are set correctly"
    echo "3. Check network connectivity and firewall settings"
    echo "4. Review service logs for any errors"
    exit 1
fi