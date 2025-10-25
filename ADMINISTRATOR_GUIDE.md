# Spark RAT Administrator Guide

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Installation and Setup](#installation-and-setup)
4. [Configuration Management](#configuration-management)
5. [User Management](#user-management)
6. [Security Configuration](#security-configuration)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Backup and Recovery](#backup-and-recovery)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Features](#advanced-features)

## Introduction

This guide is designed for system administrators who need to deploy, configure, and maintain the Spark RAT system in production environments. It covers advanced configuration, security settings, monitoring, and maintenance procedures.

### Target Audience

- System Administrators
- IT Managers
- Security Professionals
- DevOps Engineers
- Network Administrators

### Prerequisites

- Basic knowledge of system administration
- Understanding of network protocols and security
- Experience with web applications and databases
- Familiarity with command-line interfaces

## System Architecture

### Overview

Spark RAT consists of three main components:

1. **Backend Server**: Go-based server handling all operations
2. **Frontend Dashboard**: React-based web interface
3. **Client Software**: Cross-platform client for target devices

### Backend Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Server    │    │  API Gateway    │    │  Auth Service   │
│   (Gin/Golang)  │◄──►│   (REST/WS)     │◄──►│   (JWT/OAuth)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  File Manager   │    │  Device Manager │    │  Process Mgr    │
│   (Storage)     │    │   (WebSocket)   │    │   (System)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Security Mgr   │    │  Monitoring     │    │  Logging        │
│  (Rate Limit)   │    │   (Metrics)     │    │   (Audit)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │  Device List    │    │  File Manager   │
│   (Overview)    │◄──►│   (Management)  │◄──►│   (Transfer)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Remote Desktop │    │   Terminal      │    │  Process Mgr    │
│   (VNC/RDP)     │    │   (SSH/WS)      │    │   (System)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Client Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Communication  │    │  System Access  │    │  Security       │
│   (WebSocket)   │◄──►│   (OS APIs)     │◄──►│   (Encryption)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  File Manager   │    │  Process Mgr    │    │  Desktop Access │
│   (Local FS)    │    │   (System)      │    │   (Screen)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Installation and Setup

### Backend Installation

#### Prerequisites
- Go 1.21 or later
- Docker (for containerized deployment)
- SSL certificates
- Database (optional, for advanced features)

#### Manual Installation

1. **Clone the repository**
```bash
git clone https://github.com/oranolio956/Cupid-.git
cd Cupid-/spark-setup/spark-backend
```

2. **Install dependencies**
```bash
go mod download
go mod tidy
```

3. **Configure environment**
```bash
cp config.json.example config.json
# Edit config.json with your settings
```

4. **Build the application**
```bash
go build -o spark-server main.go
```

5. **Run the server**
```bash
./spark-server
```

#### Docker Installation

1. **Build the Docker image**
```bash
docker build -t spark-rat-backend .
```

2. **Run the container**
```bash
docker run -d \
  --name spark-backend \
  -p 8000:8000 \
  -e PORT=8000 \
  -e GO_ENV=production \
  -e SPARK_SALT=your-salt-here \
  -e SPARK_ADMIN_HASH=your-hash-here \
  spark-rat-backend
```

#### Render Deployment

1. **Connect to Render**
   - Link your GitHub repository
   - Select the backend directory
   - Configure environment variables

2. **Environment Variables**
```
PORT=8000
GO_ENV=production
SPARK_SALT=your-salt-here
SPARK_ADMIN_HASH=your-hash-here
```

3. **Deploy**
   - Render will automatically build and deploy
   - Monitor the deployment logs
   - Verify the service is running

### Frontend Installation

#### Prerequisites
- Node.js 18 or later
- npm or yarn
- Vercel CLI (for deployment)

#### Local Development

1. **Navigate to frontend directory**
```bash
cd spark-setup/spark-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
# Edit .env.local with your settings
```

4. **Start development server**
```bash
npm run dev
```

#### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Configure environment variables**
   - Go to Vercel dashboard
   - Select your project
   - Add environment variables

### Client Installation

#### Windows Installation

1. **Download the client**
   - Download `spark-client-windows-amd64.exe`
   - Or download `spark-client-windows-arm64.exe` for ARM

2. **Install**
```cmd
spark-client-windows-amd64.exe --install
```

3. **Configure**
```cmd
spark-client-windows-amd64.exe --config
```

#### macOS Installation

1. **Download the client**
   - Download `spark-client-darwin-amd64`
   - Or download `spark-client-darwin-arm64` for Apple Silicon

2. **Make executable**
```bash
chmod +x spark-client-darwin-amd64
```

3. **Install**
```bash
sudo ./spark-client-darwin-amd64 --install
```

#### Linux Installation

1. **Download the client**
   - Download `spark-client-linux-amd64`
   - Or download `spark-client-linux-arm64` for ARM

2. **Make executable**
```bash
chmod +x spark-client-linux-amd64
```

3. **Install**
```bash
sudo ./spark-client-linux-amd64 --install
```

## Configuration Management

### Backend Configuration

#### Main Configuration File (`config.json`)

```json
{
  "listen": ":8000",
  "environment": "production",
  "auth": {
    "admin": "$bcrypt$your-hash-here"
  },
  "security": {
    "rate_limit": {
      "enabled": true,
      "requests_per_minute": 100
    },
    "cors": {
      "enabled": true,
      "allowed_origins": ["https://spark-rat-dashboard.vercel.app"]
    }
  },
  "logging": {
    "level": "info",
    "file": "logs/spark.log"
  }
}
```

#### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 8000 | Yes |
| `GO_ENV` | Environment | development | Yes |
| `SPARK_SALT` | Encryption salt | - | Yes |
| `SPARK_ADMIN_HASH` | Admin password hash | - | Yes |
| `LOG_LEVEL` | Logging level | info | No |
| `RATE_LIMIT_RPS` | Rate limit (requests/sec) | 100 | No |
| `CORS_ORIGINS` | CORS allowed origins | * | No |

### Frontend Configuration

#### Environment Variables (`.env.local`)

```env
REACT_APP_API_URL=https://spark-backend-fixed-v2.onrender.com
REACT_APP_WS_URL=wss://spark-backend-fixed-v2.onrender.com
REACT_APP_NAME=Spark RAT Dashboard
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_HTTPS=true
REACT_APP_ENABLE_WEBSOCKETS=true
REACT_APP_ENABLE_TERMINAL=true
REACT_APP_ENABLE_DESKTOP=true
REACT_APP_ENABLE_FILE_MANAGER=true
REACT_APP_ENABLE_PROCESS_MANAGER=true
REACT_APP_ENABLE_SCREENSHOT=true
REACT_APP_ENABLE_SYSTEM_CONTROL=true
```

### Client Configuration

#### Configuration File (`config.json`)

```json
{
  "server": {
    "host": "spark-backend-fixed-v2.onrender.com",
    "port": 443,
    "secure": true
  },
  "client": {
    "name": "My Device",
    "group": "Default",
    "auto_connect": true,
    "auto_start": true
  },
  "security": {
    "salt": "your-salt-here",
    "encryption": true
  }
}
```

## User Management

### User Roles

#### Administrator
- Full system access
- User management
- System configuration
- Security settings
- All device operations

#### Manager
- Device management
- User management (limited)
- Monitoring access
- File operations
- Process management

#### Operator
- Device operations
- File operations
- Process management
- Monitoring access
- Limited configuration

#### Viewer
- Read-only access
- Monitoring only
- No device operations
- No configuration changes

### User Creation

#### Via Dashboard
1. Go to Settings > User Management
2. Click "Add User"
3. Enter user details
4. Assign role and permissions
5. Set password or send invitation

#### Via API
```bash
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "role": "operator",
    "permissions": ["device:read", "device:write"]
  }'
```

### Permission Management

#### Device Permissions
- `device:read` - View device information
- `device:write` - Modify device settings
- `device:control` - Control device operations
- `device:delete` - Remove devices

#### File Permissions
- `file:read` - View files
- `file:write` - Upload/modify files
- `file:delete` - Delete files
- `file:transfer` - Transfer files

#### System Permissions
- `system:monitor` - View system monitoring
- `system:configure` - Modify system settings
- `system:users` - Manage users
- `system:logs` - View system logs

## Security Configuration

### Authentication

#### Password Policies
```json
{
  "password_policy": {
    "min_length": 12,
    "require_uppercase": true,
    "require_lowercase": true,
    "require_numbers": true,
    "require_special": true,
    "max_age_days": 90,
    "history_count": 5
  }
}
```

#### Two-Factor Authentication
```json
{
  "2fa": {
    "enabled": true,
    "issuer": "Spark RAT",
    "algorithm": "SHA1",
    "digits": 6,
    "period": 30
  }
}
```

### Encryption

#### Data Encryption
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with SHA-256
- **Key Rotation**: Every 24 hours
- **Perfect Forward Secrecy**: Enabled

#### Communication Security
- **Protocol**: TLS 1.3
- **Cipher Suites**: ECDHE-RSA-AES256-GCM-SHA384
- **Certificate Validation**: Strict
- **HSTS**: Enabled

### Network Security

#### Firewall Configuration
```bash
# Allow HTTPS traffic
ufw allow 443/tcp

# Allow WebSocket traffic
ufw allow 443/tcp

# Block direct database access
ufw deny 5432/tcp

# Allow SSH (if needed)
ufw allow 22/tcp
```

#### Rate Limiting
```json
{
  "rate_limiting": {
    "global_rps": 1000,
    "per_ip_rps": 100,
    "per_user_rps": 50,
    "burst_limit": 10,
    "window_size": "1m"
  }
}
```

### Access Control

#### IP Whitelisting
```json
{
  "ip_whitelist": [
    "192.168.1.0/24",
    "10.0.0.0/8",
    "203.0.113.0/24"
  ]
}
```

#### Time-based Access
```json
{
  "time_restrictions": {
    "enabled": true,
    "business_hours": "09:00-17:00",
    "timezone": "UTC",
    "weekend_access": false
  }
}
```

## Monitoring and Maintenance

### System Monitoring

#### Health Checks
- **Server Health**: `/api/health`
- **Database Health**: `/api/health/database`
- **Storage Health**: `/api/health/storage`
- **Network Health**: `/api/health/network`

#### Performance Metrics
- **CPU Usage**: Real-time CPU monitoring
- **Memory Usage**: RAM and swap monitoring
- **Disk Usage**: Storage space monitoring
- **Network I/O**: Network traffic monitoring

#### Alert Configuration
```json
{
  "alerts": {
    "cpu_threshold": 80,
    "memory_threshold": 85,
    "disk_threshold": 90,
    "response_time_threshold": 1000,
    "error_rate_threshold": 5
  }
}
```

### Log Management

#### Log Levels
- **DEBUG**: Detailed debugging information
- **INFO**: General information
- **WARN**: Warning messages
- **ERROR**: Error messages
- **FATAL**: Critical errors

#### Log Rotation
```json
{
  "log_rotation": {
    "max_size": "100MB",
    "max_files": 10,
    "max_age_days": 30,
    "compress": true
  }
}
```

#### Log Analysis
```bash
# View recent errors
tail -f logs/spark.log | grep ERROR

# Count errors by type
grep ERROR logs/spark.log | cut -d' ' -f4 | sort | uniq -c

# Monitor real-time logs
tail -f logs/spark.log | grep -E "(ERROR|WARN)"
```

### Maintenance Tasks

#### Daily Tasks
- Check system health
- Review error logs
- Monitor performance metrics
- Verify backups

#### Weekly Tasks
- Update system packages
- Review security logs
- Clean temporary files
- Test disaster recovery

#### Monthly Tasks
- Security audit
- Performance review
- User access review
- Backup verification

## Backup and Recovery

### Backup Strategy

#### Database Backup
```bash
# Create database backup
pg_dump spark_rat > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_$(date +%Y%m%d).sql
```

#### Configuration Backup
```bash
# Backup configuration files
tar -czf config_backup_$(date +%Y%m%d).tar.gz config.json .env

# Backup SSL certificates
tar -czf ssl_backup_$(date +%Y%m%d).tar.gz ssl/
```

#### File System Backup
```bash
# Backup uploaded files
tar -czf files_backup_$(date +%Y%m%d).tar.gz uploads/

# Backup logs
tar -czf logs_backup_$(date +%Y%m%d).tar.gz logs/
```

### Recovery Procedures

#### Database Recovery
```bash
# Restore database
gunzip backup_20250101.sql.gz
psql spark_rat < backup_20250101.sql
```

#### Configuration Recovery
```bash
# Restore configuration
tar -xzf config_backup_20250101.tar.gz
systemctl restart spark-rat
```

#### Full System Recovery
1. Restore operating system
2. Install required software
3. Restore configuration files
4. Restore database
5. Restore file system
6. Start services
7. Verify functionality

### Disaster Recovery Plan

#### RTO (Recovery Time Objective)
- **Critical Systems**: 1 hour
- **Important Systems**: 4 hours
- **Standard Systems**: 24 hours

#### RPO (Recovery Point Objective)
- **Critical Data**: 15 minutes
- **Important Data**: 1 hour
- **Standard Data**: 24 hours

## Troubleshooting

### Common Issues

#### Server Won't Start
**Symptoms**: Server fails to start or crashes immediately
**Causes**:
- Port already in use
- Configuration errors
- Missing dependencies
- Permission issues

**Solutions**:
```bash
# Check if port is in use
netstat -tlnp | grep :8000

# Check configuration
./spark-server --validate-config

# Check logs
tail -f logs/spark.log

# Check permissions
ls -la spark-server
```

#### Database Connection Issues
**Symptoms**: Database connection errors
**Causes**:
- Database server down
- Wrong credentials
- Network issues
- Firewall blocking

**Solutions**:
```bash
# Check database status
systemctl status postgresql

# Test connection
psql -h localhost -U spark_rat -d spark_rat

# Check network connectivity
ping database-server

# Check firewall
ufw status
```

#### Performance Issues
**Symptoms**: Slow response times, high resource usage
**Causes**:
- High load
- Memory leaks
- Database issues
- Network problems

**Solutions**:
```bash
# Check system resources
top
htop
iostat

# Check database performance
SELECT * FROM pg_stat_activity;

# Check network
netstat -i
iftop

# Restart services
systemctl restart spark-rat
```

### Diagnostic Tools

#### System Information
```bash
# System overview
uname -a
cat /etc/os-release
free -h
df -h

# Process information
ps aux | grep spark
lsof -i :8000

# Network information
netstat -tlnp
ss -tlnp
```

#### Application Logs
```bash
# View all logs
tail -f logs/spark.log

# Filter by level
grep ERROR logs/spark.log
grep WARN logs/spark.log

# Real-time monitoring
tail -f logs/spark.log | grep -E "(ERROR|WARN|FATAL)"
```

#### Performance Analysis
```bash
# CPU usage
top -p $(pgrep spark-server)

# Memory usage
pmap $(pgrep spark-server)

# I/O usage
iotop -p $(pgrep spark-server)

# Network usage
nethogs
```

## Advanced Features

### Custom Integrations

#### Webhook Integration
```json
{
  "webhooks": {
    "device_connected": "https://api.example.com/webhook/device-connected",
    "device_disconnected": "https://api.example.com/webhook/device-disconnected",
    "alert_triggered": "https://api.example.com/webhook/alert"
  }
}
```

#### API Integration
```bash
# Get device list
curl -H "Authorization: Bearer $TOKEN" \
  https://spark-backend-fixed-v2.onrender.com/api/devices

# Execute command
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command": "ls -la"}' \
  https://spark-backend-fixed-v2.onrender.com/api/devices/123/exec
```

### Custom Scripts

#### Device Management Script
```bash
#!/bin/bash
# Add multiple devices
for ip in 192.168.1.{10..20}; do
  curl -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"ip\": \"$ip\", \"name\": \"Device-$ip\"}" \
    https://spark-backend-fixed-v2.onrender.com/api/devices
done
```

#### Backup Script
```bash
#!/bin/bash
# Automated backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/spark-rat/$DATE"

mkdir -p $BACKUP_DIR

# Backup database
pg_dump spark_rat > $BACKUP_DIR/database.sql

# Backup configuration
cp -r config/ $BACKUP_DIR/

# Backup files
tar -czf $BACKUP_DIR/files.tar.gz uploads/

# Cleanup old backups
find /backups/spark-rat -type d -mtime +30 -exec rm -rf {} \;
```

### Scaling and Load Balancing

#### Horizontal Scaling
```yaml
# docker-compose.yml
version: '3.8'
services:
  spark-backend-1:
    image: spark-rat-backend
    ports:
      - "8001:8000"
  
  spark-backend-2:
    image: spark-rat-backend
    ports:
      - "8002:8000"
  
  nginx:
    image: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

#### Load Balancer Configuration
```nginx
upstream spark_backend {
    server spark-backend-1:8000;
    server spark-backend-2:8000;
}

server {
    listen 80;
    server_name spark-rat.example.com;
    
    location / {
        proxy_pass http://spark_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Conclusion

This administrator guide provides comprehensive information for deploying, configuring, and maintaining the Spark RAT system in production environments. For additional support, refer to the API documentation or contact the development team.

**Last Updated**: October 2025
**Version**: 2.0.0
**Support**: admin@sparkrat.com