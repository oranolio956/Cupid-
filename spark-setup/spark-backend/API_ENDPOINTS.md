# Spark RAT API Endpoints Documentation

## Overview
This document describes all available API endpoints for the Spark RAT system.

## Base URL
- **Production**: `https://spark-backend-fixed-v2.onrender.com/api`
- **Development**: `http://localhost:8000/api`

## Authentication
Most endpoints require authentication via cookie-based session or basic auth.

## Public Endpoints (No Authentication Required)

### Health Check
- **GET** `/api/health`
- **Description**: Comprehensive health check with system information
- **Response**: Health status, version, uptime, clients, memory, system info

### System Information
- **GET** `/api/info`
- **Description**: System information and feature list
- **Response**: Version, uptime, clients, environment, features, endpoints

### Metrics
- **GET** `/api/metrics`
- **Description**: System metrics and performance data
- **Response**: Request metrics, connection metrics, performance metrics, security metrics

### Status
- **GET** `/api/status`
- **Description**: Simple system status
- **Response**: Status, uptime, clients, requests, success/failure counts

### Version
- **GET** `/api/version`
- **Description**: Version information
- **Response**: Version, build time, git commit, Go version, environment, features

### Ping
- **GET** `/api/ping`
- **Description**: Simple ping/pong test
- **Response**: "pong" message with timestamp

## Protected Endpoints (Authentication Required)

### Device Management

#### Get Device List
- **POST** `/api/device/list`
- **Description**: Get list of connected devices
- **Request Body**: None
- **Response**: List of devices with status, IP, hostname, etc.

#### Get Device Screenshot
- **POST** `/api/device/screenshot/get`
- **Description**: Capture screenshot of a device
- **Request Body**: `{"device_id": "string"}`
- **Response**: Screenshot data or error

#### List Device Processes
- **POST** `/api/device/process/list`
- **Description**: Get running processes on a device
- **Request Body**: `{"device_id": "string"}`
- **Response**: List of processes with PID, name, CPU, memory usage

#### Kill Device Process
- **POST** `/api/device/process/kill`
- **Description**: Kill a process on a device
- **Request Body**: `{"device_id": "string", "pid": "int"}`
- **Response**: Success or error message

#### List Device Files
- **POST** `/api/device/file/list`
- **Description**: List files in a directory on a device
- **Request Body**: `{"device_id": "string", "path": "string"}`
- **Response**: List of files and directories

#### Upload File to Device
- **POST** `/api/device/file/upload`
- **Description**: Upload a file to a device
- **Request Body**: Multipart form with file and device_id
- **Response**: Success or error message

#### Download File from Device
- **POST** `/api/device/file/get`
- **Description**: Download a file from a device
- **Request Body**: `{"device_id": "string", "path": "string"}`
- **Response**: File data or error

#### Remove Device Files
- **POST** `/api/device/file/remove`
- **Description**: Remove files on a device
- **Request Body**: `{"device_id": "string", "paths": ["string"]}`
- **Response**: Success or error message

#### Get Device Text File
- **POST** `/api/device/file/text`
- **Description**: Get text content of a file on a device
- **Request Body**: `{"device_id": "string", "path": "string"}`
- **Response**: File content or error

#### Execute Command on Device
- **POST** `/api/device/exec`
- **Description**: Execute a command on a device
- **Request Body**: `{"device_id": "string", "command": "string"}`
- **Response**: Command output or error

#### Call Device Action
- **POST** `/api/device/:act`
- **Description**: Call a specific action on a device
- **Parameters**: `act` - action name
- **Request Body**: `{"device_id": "string", "params": {}}`
- **Response**: Action result or error

### Real-time Communication

#### Terminal
- **WebSocket** `/api/device/terminal`
- **Description**: Real-time terminal access to a device
- **Parameters**: `device_id` in query string
- **Protocol**: WebSocket with binary data

#### Desktop
- **WebSocket** `/api/device/desktop`
- **Description**: Real-time desktop streaming from a device
- **Parameters**: `device_id` in query string
- **Protocol**: WebSocket with binary data

### Client Management

#### Check Client
- **POST** `/api/client/check`
- **Description**: Check client status and version
- **Request Body**: `{"client_id": "string"}`
- **Response**: Client information and status

#### Generate Client
- **POST** `/api/client/generate`
- **Description**: Generate a new client binary
- **Request Body**: `{"platform": "string", "config": {}}`
- **Response**: Client binary or download link

## Bridge Endpoints

### Bridge Push
- **POST** `/api/bridge/push`
- **Description**: Push data through bridge
- **Request Body**: Binary data
- **Response**: Success or error

### Bridge Pull
- **POST** `/api/bridge/pull`
- **Description**: Pull data through bridge
- **Request Body**: Binary data
- **Response**: Binary data or error

### Client Update
- **GET** `/api/client/update`
- **Description**: Check for client updates
- **Response**: Update information or "no update"

## WebSocket Endpoints

### Main WebSocket
- **WebSocket** `/ws`
- **Description**: Main WebSocket connection for real-time communication
- **Headers**: `UUID`, `Key` (hex encoded)
- **Protocol**: Binary messages with encryption

## Response Format

### Success Response
```json
{
  "code": 0,
  "message": "Success",
  "data": {},
  "time": 1640995200
}
```

### Error Response
```json
{
  "code": 1,
  "message": "Error description",
  "data": null,
  "time": 1640995200
}
```

## HTTP Status Codes

- **200 OK**: Request successful
- **400 Bad Request**: Invalid request
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Endpoint not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Rate Limiting

- **Global**: 100 requests per minute
- **Per IP**: 50 requests per minute
- **Burst**: 10 requests per 10 seconds

## Security Headers

All responses include security headers:
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Content-Security-Policy`
- `Referrer-Policy`

## CORS

CORS is enabled for:
- **Origins**: `https://spark-rat-dashboard.vercel.app`
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Origin, Content-Type, Accept, Authorization, X-Requested-With

## Examples

### Get System Info
```bash
curl -X GET https://spark-backend-fixed-v2.onrender.com/api/info
```

### Get Device List (with auth)
```bash
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/device/list \
  -H "Content-Type: application/json" \
  -H "Cookie: Authorization=your-session-token"
```

### Health Check
```bash
curl -X GET https://spark-backend-fixed-v2.onrender.com/api/health
```

## Error Handling

All endpoints return consistent error responses with:
- Error code
- Human-readable message
- Timestamp
- Additional data if available

## Monitoring

The API provides comprehensive monitoring through:
- `/api/health` - Health status
- `/api/metrics` - Performance metrics
- `/api/status` - System status

## Version History

- **v2.0.0** - Current version with comprehensive API
- **v1.0.0** - Initial version