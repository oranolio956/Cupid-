#!/bin/bash
# WebSocket Connection Testing Script

BACKEND_WS="${BACKEND_WS:-wss://spark-backend-wj4e.onrender.com/ws}"

echo "🔌 Testing WebSocket Connection: $BACKEND_WS"
echo "================================================"

# Test WebSocket connection
echo ""
echo "Attempting WebSocket connection..."
echo "This will timeout after 5 seconds if connection fails."
echo ""

timeout 5 websocat -v "$BACKEND_WS" \
  --origin "https://cupid-spark-frontend-asdsas-projects-7b4d3f47.vercel.app" \
  --header "UUID: test-client-uuid" \
  --header "Key: test-key" \
  2>&1 || echo "❌ WebSocket connection failed or timed out"

echo ""
echo "================================================"
echo "Note: Connection may fail due to authentication requirements"
