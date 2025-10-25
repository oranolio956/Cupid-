# Spark RAT API Quick Reference

## Base URL
```
https://spark-backend-fixed-v2.onrender.com/api
```

## Authentication
```http
Authorization: Bearer <your-jwt-token>
```

## Common Headers
```http
Content-Type: application/json
Accept: application/json
X-Request-ID: <unique-request-id>
```

## System Endpoints

### Health Check
```http
GET /api/health
```
**Response**: System health status

### System Information
```http
GET /api/info
```
**Response**: System version and features

### Metrics
```http
GET /api/metrics
```
**Response**: System performance metrics

### Status
```http
GET /api/status
```
**Response**: System status and statistics

## Device Endpoints

### List Devices
```http
GET /api/devices
```
**Query Parameters**:
- `page` (optional): Page number
- `per_page` (optional): Items per page
- `status` (optional): Filter by status
- `group` (optional): Filter by group

### Get Device Details
```http
GET /api/devices/{id}
```
**Response**: Device information and status

### Connect to Device
```http
POST /api/devices/{id}/connect
```
**Response**: Connection status

### Disconnect from Device
```http
POST /api/devices/{id}/disconnect
```
**Response**: Disconnection status

### Execute Command
```http
POST /api/devices/{id}/commands
Content-Type: application/json

{
  "command": "ls -la",
  "working_directory": "/home/user",
  "timeout": 30
}
```

### Get Command Status
```http
GET /api/commands/{command_id}
```
**Response**: Command execution status

### Get Command Output
```http
GET /api/commands/{command_id}/output
```
**Response**: Command output and results

## File Endpoints

### List Files
```http
GET /api/devices/{id}/files
```
**Query Parameters**:
- `path` (optional): Directory path
- `recursive` (optional): Include subdirectories

### Upload File
```http
POST /api/devices/{id}/files/upload
Content-Type: multipart/form-data

file: <file-data>
path: /home/user/uploads/
```

### Download File
```http
GET /api/devices/{id}/files/download
```
**Query Parameters**:
- `path`: File path to download

### Delete File
```http
DELETE /api/devices/{id}/files
Content-Type: application/json

{
  "path": "/path/to/file"
}
```

### Create Directory
```http
POST /api/devices/{id}/files/directory
Content-Type: application/json

{
  "path": "/path/to/directory"
}
```

## User Management Endpoints

### List Users
```http
GET /api/users
```
**Response**: List of all users

### Get User Details
```http
GET /api/users/{id}
```
**Response**: User information

### Create User
```http
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "role": "operator",
  "permissions": ["device:read", "device:write"]
}
```

### Update User
```http
PUT /api/users/{id}
Content-Type: application/json

{
  "username": "updateduser",
  "role": "manager"
}
```

### Delete User
```http
DELETE /api/users/{id}
```
**Response**: Deletion confirmation

### Reset Password
```http
POST /api/users/{id}/reset-password
Content-Type: application/json

{
  "new_password": "newpassword123"
}
```

## Authentication Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

## Monitoring Endpoints

### Get Health Status
```http
GET /api/monitoring/health
```
**Response**: System health details

### Get Metrics
```http
GET /api/monitoring/metrics
```
**Query Parameters**:
- `since` (optional): Start time
- `until` (optional): End time
- `metric` (optional): Specific metric

### Get Alerts
```http
GET /api/monitoring/alerts
```
**Query Parameters**:
- `since` (optional): Start time
- `status` (optional): Alert status

### Get Active Alerts
```http
GET /api/monitoring/alerts/active
```
**Response**: Currently active alerts

### Resolve Alert
```http
POST /api/monitoring/alerts/{id}/resolve
Authorization: Bearer <token>
```

## Security Endpoints

### Get Security Status
```http
GET /api/security/status
Authorization: Bearer <token>
```

### Get Blocked IPs
```http
GET /api/security/blocked-ips
Authorization: Bearer <token>
```

### Block IP
```http
POST /api/security/block-ip
Authorization: Bearer <token>
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "reason": "Suspicious activity",
  "duration": 3600
}
```

### Unblock IP
```http
POST /api/security/unblock-ip
Authorization: Bearer <token>
Content-Type: application/json

{
  "ip": "192.168.1.100"
}
```

### Get Rate Limit Status
```http
GET /api/security/rate-limit/status
Authorization: Bearer <token>
```

## WebSocket API

### Connection
```javascript
const ws = new WebSocket('wss://spark-backend-fixed-v2.onrender.com/ws');
```

### Authentication
```javascript
ws.onopen = function() {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }));
};
```

### Message Types

#### Device Status Update
```json
{
  "type": "device_status",
  "data": {
    "device_id": "123",
    "status": "online",
    "timestamp": "2025-10-25T14:00:00Z"
  }
}
```

#### Command Output
```json
{
  "type": "command_output",
  "data": {
    "command_id": "cmd_123456",
    "output": "Command output here",
    "is_complete": false
  }
}
```

#### File Transfer Progress
```json
{
  "type": "file_progress",
  "data": {
    "file_id": "file_123456",
    "progress": 75.5,
    "bytes_transferred": 768000,
    "total_bytes": 1024000
  }
}
```

## Response Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "specific_field",
      "reason": "specific_reason"
    }
  },
  "timestamp": "2025-10-25T14:00:00Z",
  "request_id": "req_123456789"
}
```

## Rate Limiting

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Limits
| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| File Upload | 10 requests | 1 minute |
| Command Execution | 50 requests | 1 minute |
| WebSocket | 1000 messages | 1 minute |

## SDK Examples

### JavaScript/Node.js
```javascript
const SparkRAT = require('spark-rat-sdk');

const client = new SparkRAT({
  baseUrl: 'https://spark-backend-fixed-v2.onrender.com/api',
  token: 'your-jwt-token'
});

// List devices
const devices = await client.devices.list();

// Execute command
const command = await client.devices.executeCommand('123', 'ls -la');

// Upload file
const file = await client.files.upload('123', '/path/to/file', fileData);
```

### Python
```python
from spark_rat import SparkRATClient

client = SparkRATClient(
    base_url='https://spark-backend-fixed-v2.onrender.com/api',
    token='your-jwt-token'
)

# List devices
devices = client.devices.list()

# Execute command
command = client.devices.execute_command('123', 'ls -la')

# Upload file
file = client.files.upload('123', '/path/to/file', file_data)
```

### Go
```go
package main

import (
    "fmt"
    "github.com/spark-rat/sdk-go"
)

func main() {
    client := sparkrat.NewClient(
        "https://spark-backend-fixed-v2.onrender.com/api",
        "your-jwt-token",
    )
    
    // List devices
    devices, err := client.Devices.List()
    if err != nil {
        panic(err)
    }
    
    // Execute command
    command, err := client.Devices.ExecuteCommand("123", "ls -la")
    if err != nil {
        panic(err)
    }
}
```

### cURL Examples

#### Get System Health
```bash
curl -s https://spark-backend-fixed-v2.onrender.com/api/health | jq
```

#### List Devices
```bash
curl -s https://spark-backend-fixed-v2.onrender.com/api/devices \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### Execute Command
```bash
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/devices/123/commands \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command":"ls -la"}' | jq
```

#### Upload File
```bash
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/devices/123/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/file" \
  -F "path=/home/user/uploads/" | jq
```

#### Download File
```bash
curl -X GET "https://spark-backend-fixed-v2.onrender.com/api/devices/123/files/download?path=/path/to/file" \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded_file.txt
```

## Testing Tools

### API Testing with Postman
1. Import the API collection
2. Set up environment variables
3. Configure authentication
4. Run test scenarios

### API Testing with curl
```bash
# Test health endpoint
curl -I https://spark-backend-fixed-v2.onrender.com/api/health

# Test authentication
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Test device listing
curl -s https://spark-backend-fixed-v2.onrender.com/api/devices \
  -H "Authorization: Bearer $TOKEN" | jq
```

### WebSocket Testing
```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c wss://spark-backend-fixed-v2.onrender.com/ws

# Send authentication message
{"type":"auth","token":"your-jwt-token"}
```

## Best Practices

### Authentication
- Store tokens securely
- Implement token refresh
- Use HTTPS only
- Rotate tokens regularly

### Error Handling
- Check response codes
- Handle rate limiting
- Implement retry logic
- Log errors appropriately

### Performance
- Use pagination for large datasets
- Implement caching where appropriate
- Monitor rate limits
- Use WebSocket for real-time data

### Security
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Monitor for suspicious activity

---

**Last Updated**: October 2025
**API Version**: 2.0.0
**Base URL**: https://spark-backend-fixed-v2.onrender.com/api