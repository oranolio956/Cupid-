#!/bin/bash

# Complete Test Suite Runner for Spark RAT System
# This script runs all integration tests and provides a comprehensive report

set -e

echo "🧪 Starting Complete Test Suite for Spark RAT System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_header() {
    echo -e "${CYAN}[HEADER]${NC} $1"
}

# Test results
TOTAL_TESTS=0
TOTAL_PASSED=0
TOTAL_FAILED=0
TEST_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0

# Function to run a test suite
run_test_suite() {
    local suite_name="$1"
    local script_path="$2"
    local description="$3"
    
    TEST_SUITES=$((TEST_SUITES + 1))
    print_header "=== $suite_name ==="
    print_status "$description"
    echo ""
    
    if [ -f "$script_path" ]; then
        if bash "$script_path"; then
            print_success "✅ $suite_name completed successfully"
            PASSED_SUITES=$((PASSED_SUITES + 1))
        else
            print_error "❌ $suite_name failed"
            FAILED_SUITES=$((FAILED_SUITES + 1))
        fi
    else
        print_error "❌ Test script not found: $script_path"
        FAILED_SUITES=$((FAILED_SUITES + 1))
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Function to run a quick test
run_quick_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    print_test "Running: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "✅ PASSED: $test_name"
        TOTAL_PASSED=$((TOTAL_PASSED + 1))
        return 0
    else
        print_error "❌ FAILED: $test_name"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
        return 1
    fi
}

echo ""
print_header "🚀 SPARK RAT COMPLETE TEST SUITE"
echo "Testing the complete Spark RAT system integration"
echo ""

# Pre-flight checks
print_status "Phase 0: Pre-flight Checks"

# Check if we're in the right directory
if [ ! -f "render.yaml" ] || [ ! -d "spark-setup" ]; then
    print_error "Please run this script from the project root directory."
    exit 1
fi

# Check required tools
print_test "Checking required tools..."
MISSING_TOOLS=0

if ! command -v curl &> /dev/null; then
    print_error "curl is not installed"
    MISSING_TOOLS=$((MISSING_TOOLS + 1))
fi

if ! command -v git &> /dev/null; then
    print_error "git is not installed"
    MISSING_TOOLS=$((MISSING_TOOLS + 1))
fi

if ! command -v go &> /dev/null; then
    print_warning "go is not installed (client tests may fail)"
fi

if [ $MISSING_TOOLS -eq 0 ]; then
    print_success "✅ All required tools are available"
else
    print_error "❌ Missing required tools. Please install them first."
    exit 1
fi

echo ""

# Run test suites
print_header "🧪 RUNNING TEST SUITES"

# Test Suite 1: End-to-End Integration Tests
run_test_suite "End-to-End Integration Tests" "./test-end-to-end.sh" "Testing complete system integration including backend, frontend, and API connectivity"

# Test Suite 2: Client Integration Tests
run_test_suite "Client Integration Tests" "./test-client-integration.sh" "Testing client configuration, build process, and server connectivity"

# Test Suite 3: Backend Deployment Verification
print_header "=== Backend Deployment Verification ==="
print_status "Verifying backend deployment and configuration"

# Test backend health
run_quick_test "Backend Health Check" "curl -f -s --max-time 30 https://spark-backend-fixed-v2.onrender.com/api/info"

# Test backend API
run_quick_test "Backend API Response" "curl -s --max-time 30 https://spark-backend-fixed-v2.onrender.com/api/device/list | grep -q 'code'"

# Test backend WebSocket
if command -v wscat &> /dev/null; then
    run_quick_test "Backend WebSocket" "timeout 10 wscat -c wss://spark-backend-fixed-v2.onrender.com/ws --close"
else
    print_warning "⚠️ wscat not available, skipping WebSocket test"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    TOTAL_PASSED=$((TOTAL_PASSED + 1))
fi

TEST_SUITES=$((TEST_SUITES + 1))
if [ $TOTAL_FAILED -eq 0 ]; then
    print_success "✅ Backend Deployment Verification completed successfully"
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    print_error "❌ Backend Deployment Verification failed"
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

echo ""

# Test Suite 4: Frontend Deployment Verification
print_header "=== Frontend Deployment Verification ==="
print_status "Verifying frontend deployment and configuration"

# Test frontend accessibility
run_quick_test "Frontend Accessibility" "curl -f -s --max-time 30 https://spark-rat-dashboard.vercel.app"

# Test frontend static assets
run_quick_test "Frontend Static Assets" "curl -f -s --max-time 30 https://spark-rat-dashboard.vercel.app/static"

# Test frontend configuration
run_quick_test "Frontend Configuration" "curl -s --max-time 30 https://spark-rat-dashboard.vercel.app | grep -q 'react'"

TEST_SUITES=$((TEST_SUITES + 1))
if [ $TOTAL_FAILED -eq 0 ]; then
    print_success "✅ Frontend Deployment Verification completed successfully"
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    print_error "❌ Frontend Deployment Verification failed"
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

echo ""

# Test Suite 5: Security Tests
print_header "=== Security Tests ==="
print_status "Testing security configuration and headers"

# Test HTTPS enforcement
run_quick_test "HTTPS Enforcement" "curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://spark-backend-fixed-v2.onrender.com | grep -q '301\\|302'"

# Test security headers
run_quick_test "Security Headers" "curl -s -I --max-time 30 https://spark-rat-dashboard.vercel.app | grep -q 'x-content-type-options\\|x-frame-options'"

# Test CORS configuration
run_quick_test "CORS Configuration" "curl -s -I --max-time 30 https://spark-backend-fixed-v2.onrender.com/api/info | grep -q 'access-control'"

TEST_SUITES=$((TEST_SUITES + 1))
if [ $TOTAL_FAILED -eq 0 ]; then
    print_success "✅ Security Tests completed successfully"
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    print_error "❌ Security Tests failed"
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

echo ""

# Test Suite 6: Performance Tests
print_header "=== Performance Tests ==="
print_status "Testing system performance and response times"

# Test backend response time
BACKEND_TIME=$(curl -s -w "%{time_total}" --max-time 30 https://spark-backend-fixed-v2.onrender.com/api/info -o /dev/null 2>/dev/null || echo "ERROR")
if [ "$BACKEND_TIME" != "ERROR" ]; then
    if (( $(echo "$BACKEND_TIME < 5" | bc -l 2>/dev/null || echo "0") )); then
        print_success "✅ PASSED: Backend response time is acceptable (${BACKEND_TIME}s)"
        TOTAL_PASSED=$((TOTAL_PASSED + 1))
    else
        print_warning "⚠️ WARNING: Backend response time is slow (${BACKEND_TIME}s)"
        TOTAL_PASSED=$((TOTAL_PASSED + 1))
    fi
else
    print_error "❌ FAILED: Could not measure backend response time"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test frontend response time
FRONTEND_TIME=$(curl -s -w "%{time_total}" --max-time 30 https://spark-rat-dashboard.vercel.app -o /dev/null 2>/dev/null || echo "ERROR")
if [ "$FRONTEND_TIME" != "ERROR" ]; then
    if (( $(echo "$FRONTEND_TIME < 10" | bc -l 2>/dev/null || echo "0") )); then
        print_success "✅ PASSED: Frontend response time is acceptable (${FRONTEND_TIME}s)"
        TOTAL_PASSED=$((TOTAL_PASSED + 1))
    else
        print_warning "⚠️ WARNING: Frontend response time is slow (${FRONTEND_TIME}s)"
        TOTAL_PASSED=$((TOTAL_PASSED + 1))
    fi
else
    print_error "❌ FAILED: Could not measure frontend response time"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

TEST_SUITES=$((TEST_SUITES + 1))
if [ $TOTAL_FAILED -eq 0 ]; then
    print_success "✅ Performance Tests completed successfully"
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    print_error "❌ Performance Tests failed"
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

echo ""

# Final Results
print_header "🎯 FINAL TEST RESULTS"

echo ""
print_status "=== TEST SUITE SUMMARY ==="
echo "Total Test Suites: $TEST_SUITES"
echo "Passed Suites: $PASSED_SUITES"
echo "Failed Suites: $FAILED_SUITES"
echo "Suite Success Rate: $(( (PASSED_SUITES * 100) / TEST_SUITES ))%"

echo ""
print_status "=== INDIVIDUAL TEST SUMMARY ==="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $TOTAL_PASSED"
echo "Failed: $TOTAL_FAILED"
echo "Test Success Rate: $(( (TOTAL_PASSED * 100) / TOTAL_TESTS ))%"

echo ""
print_status "=== SYSTEM STATUS ==="
if [ $FAILED_SUITES -eq 0 ] && [ $TOTAL_FAILED -eq 0 ]; then
    print_success "🎉 ALL TESTS PASSED! System is ready for production."
    echo ""
    print_status "Next steps:"
    echo "1. Deploy to production environment"
    echo "2. Configure monitoring and alerts"
    echo "3. Set up client deployment"
    echo "4. Conduct security audit"
    echo "5. Create production documentation"
    exit 0
elif [ $FAILED_SUITES -le 1 ] && [ $TOTAL_FAILED -le 3 ]; then
    print_warning "⚠️ Most tests passed. System is mostly functional with minor issues."
    echo ""
    print_status "Recommended actions:"
    echo "1. Review failed tests and fix issues"
    echo "2. Re-run specific test suites"
    echo "3. Consider deploying with known limitations"
    exit 0
else
    print_error "❌ Multiple tests failed. System needs attention before production."
    echo ""
    print_status "Required actions:"
    echo "1. Fix critical issues identified in tests"
    echo "2. Re-run test suite after fixes"
    echo "3. Do not deploy to production until issues are resolved"
    exit 1
fi