#!/bin/bash
# Continuous Backend Monitoring Script

BACKEND_URL="${BACKEND_URL:-https://spark-backend-wj4e.onrender.com}"
INTERVAL="${INTERVAL:-10}"

echo "📊 Monitoring Spark Backend: $BACKEND_URL"
echo "Checking every $INTERVAL seconds. Press Ctrl+C to stop."
echo "================================================"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Check health
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/health" 2>&1)
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        UPTIME=$(echo "$BODY" | jq -r '.uptime // "N/A"' 2>/dev/null || echo "N/A")
        CLIENTS=$(echo "$BODY" | jq -r '.clients // "N/A"' 2>/dev/null || echo "N/A")
        STATUS=$(echo "$BODY" | jq -r '.status // "N/A"' 2>/dev/null || echo "N/A")
        echo "[$TIMESTAMP] ✅ Status: $STATUS | Uptime: $UPTIME | Clients: $CLIENTS"
    else
        echo "[$TIMESTAMP] ❌ HTTP $HTTP_CODE - Backend down or unhealthy"
    fi
    
    sleep "$INTERVAL"
done
