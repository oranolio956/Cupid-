#!/bin/bash
# Comprehensive Endpoint Testing Script

BACKEND_URL="${BACKEND_URL:-https://spark-backend-wj4e.onrender.com}"
PASSWORD="${PASSWORD:-ChangeMe2024!SecurePassword}"

PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧪 COMPREHENSIVE ENDPOINT TESTING"
echo "Backend: $BACKEND_URL"
echo "================================================"
echo ""

test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local auth="$4"
    local expected_code="$5"
    
    echo -n "Testing $name... "
    
    if [ "$auth" = "yes" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$BACKEND_URL$endpoint" -u "admin:$PASSWORD" 2>&1)
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$BACKEND_URL$endpoint" 2>&1)
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    
    if [ "$HTTP_CODE" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $HTTP_CODE)"
        ((FAILED++))
    fi
}

# Public Endpoints (No Auth)
echo -e "${YELLOW}PUBLIC ENDPOINTS${NC}"
test_endpoint "Health Check" "GET" "/api/health" "no" "200"
test_endpoint "Info Endpoint" "GET" "/api/info" "no" "200"
echo ""

# Protected Endpoints (Require Auth)
echo -e "${YELLOW}PROTECTED ENDPOINTS${NC}"
test_endpoint "Device List" "POST" "/api/device/list" "yes" "200"
test_endpoint "Metrics" "GET" "/api/metrics" "yes" "200"
echo ""

# Auth Tests
echo -e "${YELLOW}AUTHENTICATION TESTS${NC}"
echo -n "Testing invalid auth... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/device/list" -u "admin:wrongpassword" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Correctly rejected)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Expected 401, got $HTTP_CODE)"
    ((FAILED++))
fi

echo -n "Testing no auth... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/device/list" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Correctly rejected)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Expected 401, got $HTTP_CODE)"
    ((FAILED++))
fi
echo ""

# CORS Tests
echo -e "${YELLOW}CORS TESTS${NC}"
echo -n "Testing CORS headers... "
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/health" \
  -H "Origin: https://cupid-spark-frontend-asdsas-projects-7b4d3f47.vercel.app" \
  -H "Access-Control-Request-Method: POST" 2>&1)

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin"; then
    echo -e "${GREEN}✓ PASS${NC} (CORS headers present)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (CORS headers missing)"
    ((FAILED++))
fi
echo ""

# Summary
echo "================================================"
echo -e "RESULTS: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "Total tests: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
