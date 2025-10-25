# Spark RAT API Testing Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Testing Environment Setup](#testing-environment-setup)
3. [Authentication Testing](#authentication-testing)
4. [Endpoint Testing](#endpoint-testing)
5. [Error Handling Testing](#error-handling-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [WebSocket Testing](#websocket-testing)
9. [Automated Testing](#automated-testing)
10. [Testing Tools](#testing-tools)

## Introduction

This guide provides comprehensive instructions for testing the Spark RAT API. It covers manual testing, automated testing, and various testing scenarios to ensure API reliability and functionality.

### Testing Objectives
- Verify API functionality and reliability
- Test authentication and authorization
- Validate error handling and responses
- Ensure performance and scalability
- Test security measures and rate limiting
- Verify WebSocket functionality

### Prerequisites
- API access credentials
- Testing tools (curl, Postman, etc.)
- Network access to API endpoints
- Basic understanding of REST APIs

## Testing Environment Setup

### Base Configuration
```bash
# Set base URL
export API_BASE_URL="https://spark-backend-fixed-v2.onrender.com/api"

# Set WebSocket URL
export WS_URL="wss://spark-backend-fixed-v2.onrender.com/ws"

# Set test credentials
export TEST_USERNAME="testuser"
export TEST_PASSWORD="testpass"
```

### Authentication Setup
```bash
# Get authentication token
TOKEN=$(curl -s -X POST $API_BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\"}" \
  | jq -r '.token')

# Verify token
echo "Token: $TOKEN"
```

### Test Data Setup
```bash
# Create test device
DEVICE_ID=$(curl -s -X POST $API_BASE_URL/devices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Device","ip":"192.168.1.100"}' \
  | jq -r '.data.id')

echo "Test Device ID: $DEVICE_ID"
```

## Authentication Testing

### Test 1: Valid Login
```bash
# Test valid login
curl -X POST $API_BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 200 OK with token

### Test 2: Invalid Login
```bash
# Test invalid credentials
curl -X POST $API_BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"invalid","password":"invalid"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 401 Unauthorized

### Test 3: Token Validation
```bash
# Test token validation
curl -X GET $API_BASE_URL/auth/verify \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 200 OK with user info

### Test 4: Token Refresh
```bash
# Test token refresh
curl -X POST $API_BASE_URL/auth/refresh \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 200 OK with new token

## Endpoint Testing

### System Endpoints

#### Health Check
```bash
# Test health endpoint
curl -X GET $API_BASE_URL/health \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 200 OK with health status

#### System Information
```bash
# Test info endpoint
curl -X GET $API_BASE_URL/info \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 200 OK with system info

#### Metrics
```bash
# Test metrics endpoint
curl -X GET $API_BASE_URL/metrics \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 200 OK with metrics data

### Device Endpoints

#### List Devices
```bash
# Test device listing
curl -X GET $API_BASE_URL/devices \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 200 OK with device list

#### Get Device Details
```bash
# Test device details
curl -X GET $API_BASE_URL/devices/$DEVICE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 200 OK with device details

#### Execute Command
```bash
# Test command execution
COMMAND_ID=$(curl -s -X POST $API_BASE_URL/devices/$DEVICE_ID/commands \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command":"echo Hello World"}' \
  | jq -r '.data.command_id')

echo "Command ID: $COMMAND_ID"
```

**Expected Result**: 201 Created with command ID

#### Get Command Status
```bash
# Test command status
curl -X GET $API_BASE_URL/commands/$COMMAND_ID \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 200 OK with command status

### File Endpoints

#### List Files
```bash
# Test file listing
curl -X GET $API_BASE_URL/devices/$DEVICE_ID/files \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 200 OK with file list

#### Upload File
```bash
# Create test file
echo "Test content" > test_file.txt

# Test file upload
curl -X POST $API_BASE_URL/devices/$DEVICE_ID/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_file.txt" \
  -F "path=/tmp/" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 200 OK with upload confirmation

#### Download File
```bash
# Test file download
curl -X GET "$API_BASE_URL/devices/$DEVICE_ID/files/download?path=/tmp/test_file.txt" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -o downloaded_file.txt
```

**Expected Result**: 200 OK with file content

## Error Handling Testing

### Test 1: Invalid Endpoint
```bash
# Test non-existent endpoint
curl -X GET $API_BASE_URL/invalid-endpoint \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 404 Not Found

### Test 2: Missing Authentication
```bash
# Test without authentication
curl -X GET $API_BASE_URL/devices \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 401 Unauthorized

### Test 3: Invalid Parameters
```bash
# Test with invalid parameters
curl -X POST $API_BASE_URL/devices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"parameter"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 400 Bad Request

### Test 4: Resource Not Found
```bash
# Test with non-existent resource
curl -X GET $API_BASE_URL/devices/999999 \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

**Expected Result**: 404 Not Found

## Performance Testing

### Load Testing with Apache Bench
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test health endpoint
ab -n 1000 -c 10 $API_BASE_URL/health

# Test authenticated endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" $API_BASE_URL/devices
```

### Response Time Testing
```bash
# Test response times
curl -w "@curl-format.txt" -o /dev/null -s $API_BASE_URL/health

# Create curl-format.txt
cat > curl-format.txt << EOF
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
```

### Concurrent Request Testing
```bash
# Test concurrent requests
for i in {1..10}; do
  curl -s $API_BASE_URL/health &
done
wait
```

## Security Testing

### Rate Limiting Testing
```bash
# Test rate limiting
for i in {1..150}; do
  curl -s $API_BASE_URL/health > /dev/null
  echo "Request $i"
done
```

**Expected Result**: 429 Too Many Requests after limit

### Input Validation Testing
```bash
# Test SQL injection
curl -X POST $API_BASE_URL/devices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test\"; DROP TABLE users; --"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq

# Test XSS
curl -X POST $API_BASE_URL/devices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(\"XSS\")</script>"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

### Authentication Bypass Testing
```bash
# Test with invalid token
curl -X GET $API_BASE_URL/devices \
  -H "Authorization: Bearer invalid-token" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq

# Test with expired token
curl -X GET $API_BASE_URL/devices \
  -H "Authorization: Bearer expired-token" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq
```

## WebSocket Testing

### Basic WebSocket Connection
```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c $WS_URL
```

### Authentication via WebSocket
```javascript
// WebSocket authentication test
const ws = new WebSocket('wss://spark-backend-fixed-v2.onrender.com/ws');

ws.onopen = function() {
  // Send authentication
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }));
};

ws.onmessage = function(event) {
  console.log('Received:', event.data);
};

ws.onerror = function(error) {
  console.log('Error:', error);
};
```

### Message Testing
```bash
# Test WebSocket messages
echo '{"type":"auth","token":"'$TOKEN'"}' | wscat -c $WS_URL
echo '{"type":"ping"}' | wscat -c $WS_URL
```

## Automated Testing

### Test Script Example
```bash
#!/bin/bash
# API Test Script

set -e

API_BASE_URL="https://spark-backend-fixed-v2.onrender.com/api"
TEST_USERNAME="testuser"
TEST_PASSWORD="testpass"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
  local test_name="$1"
  local command="$2"
  local expected_code="$3"
  
  echo -n "Testing $test_name... "
  
  local actual_code=$(eval "$command" -w "%{http_code}" -o /dev/null -s)
  
  if [ "$actual_code" = "$expected_code" ]; then
    echo -e "${GREEN}PASS${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}FAIL${NC} (Expected: $expected_code, Got: $actual_code)"
    ((TESTS_FAILED++))
  fi
}

# Get authentication token
echo "Getting authentication token..."
TOKEN=$(curl -s -X POST $API_BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\"}" \
  | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get authentication token${NC}"
  exit 1
fi

echo -e "${GREEN}Authentication successful${NC}"

# Run tests
echo "Running API tests..."

# System endpoints
run_test "Health Check" "curl -X GET $API_BASE_URL/health" "200"
run_test "System Info" "curl -X GET $API_BASE_URL/info" "200"
run_test "Metrics" "curl -X GET $API_BASE_URL/metrics" "200"

# Device endpoints
run_test "List Devices" "curl -X GET $API_BASE_URL/devices -H \"Authorization: Bearer $TOKEN\"" "200"

# Error handling
run_test "Invalid Endpoint" "curl -X GET $API_BASE_URL/invalid" "404"
run_test "Unauthorized Access" "curl -X GET $API_BASE_URL/devices" "401"

# Print results
echo ""
echo "Test Results:"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
fi
```

### Python Test Suite
```python
import requests
import json
import time
import unittest

class SparkRATAPITest(unittest.TestCase):
    def setUp(self):
        self.base_url = "https://spark-backend-fixed-v2.onrender.com/api"
        self.ws_url = "wss://spark-backend-fixed-v2.onrender.com/ws"
        self.username = "testuser"
        self.password = "testpass"
        self.token = None
        
    def test_authentication(self):
        """Test API authentication"""
        response = requests.post(f"{self.base_url}/auth/login", 
                               json={"username": self.username, "password": self.password})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('token', data)
        self.token = data['token']
        
    def test_health_check(self):
        """Test health check endpoint"""
        response = requests.get(f"{self.base_url}/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('status', data)
        
    def test_device_listing(self):
        """Test device listing endpoint"""
        if not self.token:
            self.test_authentication()
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.base_url}/devices", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('data', data)
        
    def test_command_execution(self):
        """Test command execution"""
        if not self.token:
            self.test_authentication()
            
        headers = {"Authorization": f"Bearer {self.token}"}
        # First, get a device ID
        devices_response = requests.get(f"{self.base_url}/devices", headers=headers)
        if devices_response.status_code == 200:
            devices = devices_response.json()['data']
            if devices:
                device_id = devices[0]['id']
                # Execute command
                command_data = {"command": "echo Hello World"}
                response = requests.post(f"{self.base_url}/devices/{device_id}/commands", 
                                       headers=headers, json=command_data)
                self.assertEqual(response.status_code, 201)
                
    def test_error_handling(self):
        """Test error handling"""
        # Test invalid endpoint
        response = requests.get(f"{self.base_url}/invalid-endpoint")
        self.assertEqual(response.status_code, 404)
        
        # Test unauthorized access
        response = requests.get(f"{self.base_url}/devices")
        self.assertEqual(response.status_code, 401)

if __name__ == '__main__':
    unittest.main()
```

## Testing Tools

### Postman Collection
```json
{
  "info": {
    "name": "Spark RAT API",
    "description": "Complete API testing collection"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://spark-backend-fixed-v2.onrender.com/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"testpass\"\n}"
            },
            "url": "{{baseUrl}}/auth/login"
          }
        }
      ]
    }
  ]
}
```

### Newman (Postman CLI)
```bash
# Install Newman
npm install -g newman

# Run collection
newman run spark-rat-api.postman_collection.json \
  --environment spark-rat-env.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export report.html
```

### JMeter Test Plan
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan testname="Spark RAT API Test Plan">
      <elementProp name="TestPlan.arguments" elementType="Arguments" guiclass="ArgumentsPanel">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup testname="API Load Test">
        <stringProp name="ThreadGroup.num_threads">10</stringProp>
        <stringProp name="ThreadGroup.ramp_time">10</stringProp>
        <stringProp name="ThreadGroup.duration">60</stringProp>
      </ThreadGroup>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

## Best Practices

### Test Organization
- Group tests by functionality
- Use descriptive test names
- Maintain test data consistency
- Clean up test data after tests

### Test Data Management
- Use dedicated test accounts
- Create isolated test environments
- Implement test data cleanup
- Use realistic test data

### Error Handling
- Test all error scenarios
- Verify error response formats
- Check error codes and messages
- Test edge cases and boundaries

### Performance Considerations
- Test under realistic load
- Monitor response times
- Test concurrent users
- Validate rate limiting

### Security Testing
- Test authentication mechanisms
- Validate input sanitization
- Test authorization controls
- Check for common vulnerabilities

---

**Last Updated**: October 2025
**API Version**: 2.0.0
**Testing Framework**: Custom + Postman + Newman