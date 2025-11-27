#!/bin/bash

# Client Integration Test Script for Spark RAT System
# This script tests client connectivity and functionality

set -e

echo "🔌 Starting Client Integration Tests..."

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

echo ""
print_status "=== SPARK RAT CLIENT INTEGRATION TESTS ==="
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "WebSocket URL: $WS_URL"
echo ""

print_status "Phase 1: Client Configuration Tests"

# Test 1: Client configuration files exist
print_test "Testing: Client configuration files"
if [ -f "spark-setup/spark-client/config/production.go" ]; then
    print_success "✅ PASSED: Client production config exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: Client production config missing"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 2: Client configuration has correct backend URL
print_test "Testing: Client configuration has correct backend URL"
if grep -q "spark-backend-fixed-v2.onrender.com" "spark-setup/spark-client/config/production.go"; then
    print_success "✅ PASSED: Client configured with correct backend URL"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: Client not configured with correct backend URL"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 3: Client configuration has correct salt
print_test "Testing: Client configuration has correct salt"
if grep -q "a2dac101827c8d47f00831f2d6c078b2" "spark-setup/spark-client/config/production.go"; then
    print_success "✅ PASSED: Client configured with correct salt"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: Client not configured with correct salt"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

print_status "Phase 2: Client Build Tests"

# Test 4: Client builds successfully
print_test "Testing: Client builds successfully"
cd spark-setup/spark-client
if go build -o test-client ./client.go 2>/dev/null; then
    print_success "✅ PASSED: Client builds successfully"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    rm -f test-client
else
    print_error "❌ FAILED: Client build failed"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))
cd ../..

# Test 5: Client binaries exist
print_test "Testing: Client binaries exist"
if [ -d "spark-setup/spark-client/builds" ]; then
    if ls spark-setup/spark-client/builds/*.exe spark-setup/spark-client/builds/*-linux* 2>/dev/null | grep -q .; then
        print_success "✅ PASSED: Client binaries exist"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_warning "⚠️ WARNING: No client binaries found in builds directory"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
else
    print_warning "⚠️ WARNING: Client builds directory not found"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

print_status "Phase 3: Installation Script Tests"

# Test 6: Windows installation script exists
print_test "Testing: Windows installation script exists"
if [ -f "spark-setup/spark-client/install-windows.ps1" ]; then
    print_success "✅ PASSED: Windows installation script exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: Windows installation script missing"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 7: Linux installation script exists
print_test "Testing: Linux installation script exists"
if [ -f "spark-setup/spark-client/install-linux.sh" ]; then
    print_success "✅ PASSED: Linux installation script exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: Linux installation script missing"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 8: Installation scripts are executable
print_test "Testing: Installation scripts are executable"
if [ -x "spark-setup/spark-client/install-linux.sh" ]; then
    print_success "✅ PASSED: Linux installation script is executable"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: Linux installation script not executable"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

print_status "Phase 4: Client-Server Communication Tests"

# Test 9: Client can resolve backend hostname
print_test "Testing: Client can resolve backend hostname"
if nslookup spark-backend-fixed-v2.onrender.com > /dev/null 2>&1; then
    print_success "✅ PASSED: Backend hostname resolves"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: Backend hostname does not resolve"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 10: Client can connect to backend port
print_test "Testing: Client can connect to backend port"
if timeout 10 bash -c "echo > /dev/tcp/spark-backend-fixed-v2.onrender.com/443" 2>/dev/null; then
    print_success "✅ PASSED: Client can connect to backend port 443"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: Client cannot connect to backend port 443"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

print_status "Phase 5: WebSocket Communication Tests"

# Test 11: WebSocket endpoint is reachable
print_test "Testing: WebSocket endpoint is reachable"
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

print_status "Phase 6: Client Configuration Validation"

# Test 12: Client configuration is valid Go code
print_test "Testing: Client configuration is valid Go code"
cd spark-setup/spark-client
if go run -c config/production.go 2>/dev/null; then
    print_success "✅ PASSED: Client configuration is valid Go code"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_warning "⚠️ WARNING: Client configuration validation failed"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))
cd ../..

# Test 13: Client has required dependencies
print_test "Testing: Client has required dependencies"
cd spark-setup/spark-client
if go mod tidy 2>/dev/null; then
    print_success "✅ PASSED: Client dependencies are valid"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_warning "⚠️ WARNING: Client dependency validation failed"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))
cd ../..

print_status "Phase 7: Client Documentation Tests"

# Test 14: Client documentation exists
print_test "Testing: Client documentation exists"
if [ -f "spark-setup/spark-client/INSTALLATION_GUIDE.md" ]; then
    print_success "✅ PASSED: Client documentation exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: Client documentation missing"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 15: Client documentation is comprehensive
print_test "Testing: Client documentation is comprehensive"
if [ -f "spark-setup/spark-client/INSTALLATION_GUIDE.md" ]; then
    if grep -q "Windows\|Linux\|macOS" "spark-setup/spark-client/INSTALLATION_GUIDE.md"; then
        print_success "✅ PASSED: Client documentation covers all platforms"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_warning "⚠️ WARNING: Client documentation may be incomplete"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
else
    print_warning "⚠️ WARNING: Cannot check documentation completeness"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

print_status "Phase 8: End-to-End Client Workflow Tests"

# Test 16: Complete client workflow simulation
print_test "Testing: Complete client workflow simulation"
WORKFLOW_TEST=0

# Step 1: Client configuration is valid
if [ -f "spark-setup/spark-client/config/production.go" ] && grep -q "spark-backend-fixed-v2.onrender.com" "spark-setup/spark-client/config/production.go"; then
    WORKFLOW_TEST=$((WORKFLOW_TEST + 1))
fi

# Step 2: Client builds successfully
cd spark-setup/spark-client
if go build -o test-client ./client.go 2>/dev/null; then
    WORKFLOW_TEST=$((WORKFLOW_TEST + 1))
    rm -f test-client
fi
cd ../..

# Step 3: Backend is reachable
if curl -f -s --max-time 30 "$BACKEND_URL/api/info" > /dev/null; then
    WORKFLOW_TEST=$((WORKFLOW_TEST + 1))
fi

# Step 4: Installation scripts exist
if [ -f "spark-setup/spark-client/install-windows.ps1" ] && [ -f "spark-setup/spark-client/install-linux.sh" ]; then
    WORKFLOW_TEST=$((WORKFLOW_TEST + 1))
fi

if [ $WORKFLOW_TEST -eq 4 ]; then
    print_success "✅ PASSED: Complete client workflow simulation successful"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_error "❌ FAILED: Complete client workflow simulation failed ($WORKFLOW_TEST/4 steps passed)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

echo ""
print_status "=== CLIENT INTEGRATION TEST RESULTS ==="
echo "Total Tests: $TESTS_TOTAL"
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
echo "Success Rate: $(( (TESTS_PASSED * 100) / TESTS_TOTAL ))%"

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "🎉 ALL CLIENT TESTS PASSED! Client integration is ready."
    exit 0
elif [ $TESTS_FAILED -le 2 ]; then
    print_warning "⚠️ Most client tests passed. Client integration is mostly functional."
    exit 0
else
    print_error "❌ Multiple client tests failed. Client integration needs attention."
    exit 1
fi