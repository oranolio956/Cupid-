#!/bin/bash
# Backend Testing Script
set -e

BACKEND_URL="${BACKEND_URL:-https://spark-backend-wj4e.onrender.com}"
PASSWORD="${PASSWORD:-ChangeMe2024!SecurePassword}"

echo "🧪 Testing Spark Backend: $BACKEND_URL"
echo "================================================"

# Test 1: Health Check
echo ""
echo "1️⃣ Testing Health Endpoint..."
http GET "$BACKEND_URL/api/health" --timeout=10 --check-status || echo "❌ Health check failed"

# Test 2: Info Endpoint
echo ""
echo "2️⃣ Testing Info Endpoint..."
http GET "$BACKEND_URL/api/info" --timeout=10 --check-status || echo "❌ Info endpoint failed"

# Test 3: Authentication
echo ""
echo "3️⃣ Testing Authentication..."
http POST "$BACKEND_URL/api/device/list" --auth admin:"$PASSWORD" --timeout=10 --check-status || echo "❌ Auth failed"

# Test 4: Metrics
echo ""
echo "4️⃣ Testing Metrics Endpoint..."
http GET "$BACKEND_URL/api/metrics" --auth admin:"$PASSWORD" --timeout=10 --check-status || echo "❌ Metrics failed"

# Test 5: CORS Headers
echo ""
echo "5️⃣ Testing CORS Headers..."
curl -I -X OPTIONS "$BACKEND_URL/api/health" \
  -H "Origin: https://cupid-spark-frontend-asdsas-projects-7b4d3f47.vercel.app" \
  -H "Access-Control-Request-Method: POST" 2>&1 | grep -i "access-control" || echo "❌ CORS not configured"

echo ""
echo "================================================"
echo "✅ Backend tests complete!"
