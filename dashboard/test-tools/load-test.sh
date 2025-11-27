#!/bin/bash
# Load Testing Script

BACKEND_URL="${BACKEND_URL:-https://spark-backend-wj4e.onrender.com}"
REQUESTS="${REQUESTS:-100}"
CONCURRENCY="${CONCURRENCY:-10}"

echo "⚡ Load Testing Spark Backend"
echo "URL: $BACKEND_URL/api/health"
echo "Requests: $REQUESTS"
echo "Concurrency: $CONCURRENCY"
echo "================================================"

# Use autocannon for load testing
autocannon -c "$CONCURRENCY" -a "$REQUESTS" "$BACKEND_URL/api/health"

echo ""
echo "================================================"
echo "✅ Load test complete!"
