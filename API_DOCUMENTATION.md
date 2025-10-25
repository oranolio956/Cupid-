# Spark RAT API Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Base URL and Endpoints](#base-url-and-endpoints)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Endpoints](#api-endpoints)
8. [WebSocket API](#websocket-api)
9. [SDK Examples](#sdk-examples)
10. [Changelog](#changelog)

## Introduction

The Spark RAT API provides programmatic access to all system functionality. This RESTful API allows you to manage devices, execute commands, transfer files, and monitor system health.

### API Version
- **Current Version**: 2.0.0
- **Base URL**: `https://spark-backend-fixed-v2.onrender.com/api`
- **Protocol**: HTTPS
- **Content Type**: `application/json`

### Features
- RESTful API design
- WebSocket support for real-time communication
- Comprehensive error handling
- Rate limiting and security
- Detailed documentation and examples

## Authentication

### Authentication Methods

#### 1. Bearer Token (Recommended)
```http
Authorization: Bearer <your-token>
```

#### 2. Basic Authentication
```http
Authorization: Basic <base64-encoded-credentials>
```

#### 3. API Key (Legacy)
```http
X-API-Key: <your-api-key>
```

### Getting an Access Token

#### Login Endpoint
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

#### Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "123",
    "username": "your-username",
    "role": "admin",
    "permissions": ["*"]
  }
}
```

### Token Refresh
```http
POST /api/auth/refresh
Authorization: Bearer <your-token>
```

## Base URL and Endpoints

### Base URL
```
https://spark-backend-fixed-v2.onrender.com/api
```

### Endpoint Categories

#### System Endpoints
- `/health` - System health check
- `/info` - System information
- `/metrics` - System metrics
- `/status` - System status

#### Device Endpoints
- `/devices` - Device management
- `/devices/{id}` - Specific device operations
- `/devices/{id}/connect` - Connect to device
- `/devices/{id}/disconnect` - Disconnect from device

#### File Endpoints
- `/files` - File management
- `/files/upload` - Upload files
- `/files/download` - Download files
- `/files/{id}` - File operations

#### Command Endpoints
- `/commands` - Command execution
- `/commands/{id}` - Command status
- `/commands/{id}/output` - Command output

#### Monitoring Endpoints
- `/monitoring/health` - Health monitoring
- `/monitoring/metrics` - Performance metrics
- `/monitoring/alerts` - Alert management

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-10-25T14:00:00Z",
  "request_id": "req_123456789"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "username",
      "reason": "Username is required"
    }
  },
  "timestamp": "2025-10-25T14:00:00Z",
  "request_id": "req_123456789"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2025-10-25T14:00:00Z"
}
```

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 502 | Bad Gateway - Upstream server error |
| 503 | Service Unavailable - Service temporarily unavailable |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_FAILED` | Invalid credentials |
| `AUTHORIZATION_DENIED` | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `DEVICE_OFFLINE` | Target device is offline |
| `COMMAND_FAILED` | Command execution failed |
| `FILE_NOT_FOUND` | File not found |
| `PERMISSION_DENIED` | File permission denied |
| `STORAGE_FULL` | Storage quota exceeded |

### Error Response Example
```json
{
  "success": false,
  "error": {
    "code": "DEVICE_OFFLINE",
    "message": "The requested device is currently offline",
    "details": {
      "device_id": "123",
      "last_seen": "2025-10-25T13:45:00Z",
      "status": "offline"
    }
  },
  "timestamp": "2025-10-25T14:00:00Z",
  "request_id": "req_123456789"
}
```

## Rate Limiting

### Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| File Upload | 10 requests | 1 minute |
| Command Execution | 50 requests | 1 minute |
| WebSocket | 1000 messages | 1 minute |

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again later.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset_time": "2025-10-25T14:01:00Z",
      "retry_after": 60
    }
  }
}
```

## API Endpoints

### System Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "2.0.0",
    "uptime": "5d 12h 30m",
    "services": {
      "database": "healthy",
      "storage": "healthy",
      "network": "healthy"
    },
    "timestamp": "2025-10-25T14:00:00Z"
  }
}
```

#### System Information
```http
GET /api/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "2.0.0",
    "build_time": "2025-10-25T10:00:00Z",
    "git_commit": "abc123def456",
    "environment": "production",
    "features": [
      "terminal",
      "desktop",
      "file_manager",
      "process_manager"
    ]
  }
}
```

#### System Metrics
```http
GET /api/metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": {
      "total": 10000,
      "successful": 9500,
      "failed": 500,
      "rate_per_second": 10.5
    },
    "memory": {
      "alloc": 52428800,
      "sys": 104857600,
      "heap": 52428800,
      "stack": 1048576
    },
    "connections": {
      "active": 25,
      "total": 1000,
      "peak": 50
    }
  }
}
```

### Device Endpoints

#### List Devices
```http
GET /api/devices
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (online, offline)
- `group` (optional): Filter by group

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "Workstation-01",
      "ip": "192.168.1.100",
      "os": "Windows 11",
      "status": "online",
      "last_seen": "2025-10-25T14:00:00Z",
      "uptime": "2d 5h 30m",
      "performance": {
        "cpu_usage": 45.2,
        "memory_usage": 67.8,
        "disk_usage": 23.1
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

#### Get Device Details
```http
GET /api/devices/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Workstation-01",
    "ip": "192.168.1.100",
    "os": "Windows 11",
    "architecture": "x64",
    "status": "online",
    "last_seen": "2025-10-25T14:00:00Z",
    "uptime": "2d 5h 30m",
    "performance": {
      "cpu_usage": 45.2,
      "memory_usage": 67.8,
      "disk_usage": 23.1,
      "network_io": {
        "bytes_sent": 1024000,
        "bytes_received": 2048000
      }
    },
    "capabilities": [
      "terminal",
      "desktop",
      "file_manager",
      "process_manager"
    ]
  }
}
```

#### Connect to Device
```http
POST /api/devices/{id}/connect
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connection_id": "conn_123456",
    "status": "connected",
    "established_at": "2025-10-25T14:00:00Z"
  }
}
```

#### Disconnect from Device
```http
POST /api/devices/{id}/disconnect
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connection_id": "conn_123456",
    "status": "disconnected",
    "disconnected_at": "2025-10-25T14:00:00Z"
  }
}
```

### File Endpoints

#### List Files
```http
GET /api/devices/{id}/files
```

**Query Parameters:**
- `path` (optional): Directory path (default: /)
- `recursive` (optional): Include subdirectories (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "/home/user",
    "files": [
      {
        "name": "document.pdf",
        "type": "file",
        "size": 1024000,
        "modified": "2025-10-25T13:30:00Z",
        "permissions": "rw-r--r--"
      },
      {
        "name": "documents",
        "type": "directory",
        "size": 4096,
        "modified": "2025-10-25T13:00:00Z",
        "permissions": "rwxr-xr-x"
      }
    ]
  }
}
```

#### Upload File
```http
POST /api/devices/{id}/files/upload
Content-Type: multipart/form-data

file: <file-data>
path: /home/user/uploads/
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file_id": "file_123456",
    "name": "document.pdf",
    "path": "/home/user/uploads/document.pdf",
    "size": 1024000,
    "uploaded_at": "2025-10-25T14:00:00Z"
  }
}
```

#### Download File
```http
GET /api/devices/{id}/files/download
```

**Query Parameters:**
- `path`: File path to download

**Response:**
```http
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="document.pdf"
Content-Length: 1024000

<file-data>
```

### Command Endpoints

#### Execute Command
```http
POST /api/devices/{id}/commands
Content-Type: application/json

{
  "command": "ls -la",
  "working_directory": "/home/user",
  "timeout": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "command_id": "cmd_123456",
    "command": "ls -la",
    "status": "running",
    "started_at": "2025-10-25T14:00:00Z"
  }
}
```

#### Get Command Status
```http
GET /api/commands/{command_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "command_id": "cmd_123456",
    "command": "ls -la",
    "status": "completed",
    "exit_code": 0,
    "started_at": "2025-10-25T14:00:00Z",
    "completed_at": "2025-10-25T14:00:05Z",
    "output": "total 8\ndrwxr-xr-x 2 user user 4096 Oct 25 13:30 .\ndrwxr-xr-x 3 user user 4096 Oct 25 13:00 ..\n-rw-r--r-- 1 user user 1024 Oct 25 13:30 document.pdf"
  }
}
```

#### Get Command Output
```http
GET /api/commands/{command_id}/output
```

**Response:**
```json
{
  "success": true,
  "data": {
    "command_id": "cmd_123456",
    "output": "total 8\ndrwxr-xr-x 2 user user 4096 Oct 25 13:30 .\ndrwxr-xr-x 3 user user 4096 Oct 25 13:00 ..\n-rw-r--r-- 1 user user 1024 Oct 25 13:30 document.pdf",
    "stderr": "",
    "is_complete": true
  }
}
```

### Monitoring Endpoints

#### Get Health Status
```http
GET /api/monitoring/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_health": "healthy",
    "components": {
      "api": {
        "status": "healthy",
        "response_time": 45.2
      },
      "database": {
        "status": "healthy",
        "response_time": 12.5
      },
      "storage": {
        "status": "healthy",
        "free_space": "85%"
      }
    },
    "timestamp": "2025-10-25T14:00:00Z"
  }
}
```

#### Get Metrics
```http
GET /api/monitoring/metrics
```

**Query Parameters:**
- `since` (optional): Start time (ISO 8601)
- `until` (optional): End time (ISO 8601)
- `metric` (optional): Specific metric name

**Response:**
```json
{
  "success": true,
  "data": {
    "cpu_usage": [
      {
        "timestamp": "2025-10-25T14:00:00Z",
        "value": 45.2
      }
    ],
    "memory_usage": [
      {
        "timestamp": "2025-10-25T14:00:00Z",
        "value": 67.8
      }
    ],
    "request_rate": [
      {
        "timestamp": "2025-10-25T14:00:00Z",
        "value": 10.5
      }
    ]
  }
}
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

## SDK Examples

### JavaScript/Node.js

#### Installation
```bash
npm install spark-rat-sdk
```

#### Basic Usage
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

#### Installation
```bash
pip install spark-rat-sdk
```

#### Basic Usage
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

#### Installation
```bash
go get github.com/spark-rat/sdk-go
```

#### Basic Usage
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

## Changelog

### Version 2.0.0 (2025-10-25)

#### Added
- RESTful API with comprehensive endpoints
- WebSocket support for real-time communication
- JWT-based authentication
- Rate limiting and security features
- Comprehensive error handling
- SDK support for JavaScript, Python, and Go

#### Changed
- Improved response format with consistent structure
- Enhanced error messages with detailed information
- Updated authentication flow
- Improved rate limiting implementation

#### Fixed
- Fixed authentication token expiration handling
- Fixed file upload progress reporting
- Fixed WebSocket connection stability
- Fixed command execution timeout handling

### Version 1.0.0 (2025-10-01)

#### Added
- Initial API implementation
- Basic device management
- File transfer functionality
- Command execution
- Basic authentication

---

## Support

For API support and questions:
- **Email**: api-support@sparkrat.com
- **Documentation**: https://docs.sparkrat.com
- **GitHub**: https://github.com/spark-rat/api
- **Status Page**: https://status.sparkrat.com

**Last Updated**: October 2025
**API Version**: 2.0.0