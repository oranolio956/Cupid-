# Testing Tools for Spark RAT

This directory contains comprehensive testing and debugging tools for the Spark RAT project.

## Tools Installed

- **curl** - HTTP client for API testing
- **jq** - JSON processor for parsing responses
- **httpie** - User-friendly HTTP client
- **websocat** - WebSocket client for testing WS connections
- **autocannon** - HTTP load testing tool
- **artillery** - Advanced load testing framework
- **sqlite3** - Database client

## Testing Scripts

### 1. Backend API Testing
```bash
./test-backend.sh
```
Tests all backend endpoints:
- Health check
- Info endpoint
- Authentication
- Metrics
- CORS headers

### 2. Continuous Monitoring
```bash
./monitor-backend.sh
```
Monitors backend health every 10 seconds. Shows:
- HTTP status
- Uptime
- Connected clients
- Service status

### 3. WebSocket Testing
```bash
./test-websocket.sh
```
Tests WebSocket connection with proper headers.

### 4. Load Testing
```bash
./load-test.sh
```
Performs load testing with configurable parameters:
- Default: 100 requests, 10 concurrent

### Environment Variables

```bash
export BACKEND_URL="https://spark-backend-wj4e.onrender.com"
export PASSWORD="ChangeMe2024!SecurePassword"
export BACKEND_WS="wss://spark-backend-wj4e.onrender.com/ws"
```

## Quick Start

```bash
# Test everything
cd /workspaces/Cupid-/test-tools
./test-backend.sh

# Monitor in background
./monitor-backend.sh &

# Load test
REQUESTS=50 CONCURRENCY=5 ./load-test.sh
```

## Manual Testing Examples

### Test Health Endpoint
```bash
http GET https://spark-backend-wj4e.onrender.com/api/health
```

### Test Authentication
```bash
http POST https://spark-backend-wj4e.onrender.com/api/device/list \
  --auth admin:ChangeMe2024!SecurePassword
```

### Test WebSocket
```bash
websocat wss://spark-backend-wj4e.onrender.com/ws \
  --origin "https://cupid-spark-frontend-asdsas-projects-7b4d3f47.vercel.app"
```

### Monitor Logs
```bash
# Watch backend health
watch -n 5 'curl -s https://spark-backend-wj4e.onrender.com/api/health | jq'
```

## Troubleshooting

### Backend Returns 502
- Backend is down or restarting
- Check Render dashboard for logs
- Wait 30-60 seconds for cold start

### Authentication Fails
- Verify password is correct
- Check Basic Auth header format
- Ensure bcrypt hash matches in config

### WebSocket Connection Fails
- Check origin header matches CORS config
- Verify UUID and Key headers are sent
- Ensure backend is running

### CORS Errors
- Check allowed origins in backend config
- Verify frontend URL is in whitelist
- Test with curl to see actual headers

## Advanced Testing

### Artillery Load Test
```bash
artillery quick --count 10 --num 50 https://spark-backend-wj4e.onrender.com/api/health
```

### Stress Test
```bash
autocannon -c 50 -d 30 https://spark-backend-wj4e.onrender.com/api/health
```

### WebSocket Stress Test
```bash
for i in {1..10}; do
  websocat wss://spark-backend-wj4e.onrender.com/ws &
done
```
