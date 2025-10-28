#!/bin/bash

echo "=== Backend Testing ==="
echo ""

BACKEND="https://spark-backend-wj4e.onrender.com"
AUTH="admin:ChangeMe2024!SecurePassword"

# Test 1: Health Check
echo "Test 1: Health Check"
curl -s "$BACKEND/api/health" | jq '{status, version, uptime, clients}'
echo ""

# Test 2: Info Endpoint
echo "Test 2: Info Endpoint"
curl -s "$BACKEND/api/info" | jq '{version, build_time}'
echo ""

# Test 3: Authentication - Invalid
echo "Test 3: Authentication - Invalid Credentials"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -u "admin:wrong" "$BACKEND/api/device/list")
echo "HTTP Code: $HTTP_CODE (expected 401)"
echo ""

# Test 4: Authentication - Valid
echo "Test 4: Authentication - Valid Credentials"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -u "$AUTH" "$BACKEND/api/device/list")
echo "HTTP Code: $HTTP_CODE (expected 200)"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Authentication working"
else
    echo "✗ Authentication failed"
fi
echo ""

# Test 5: Device List
echo "Test 5: Device List"
curl -s -u "$AUTH" "$BACKEND/api/device/list" | jq '{devices: .devices | length}'
echo ""

# Test 6: Metrics
echo "Test 6: Metrics Endpoint"
curl -s -u "$AUTH" "$BACKEND/api/metrics" | jq '{total_requests, success_rate, active_connections}'
echo ""

# Test 7: CORS Headers
echo "Test 7: CORS Headers"
curl -s -I "$BACKEND/api/health" | grep -i "access-control"
echo ""

echo "=== All Tests Complete ==="
