# Spark RAT - Production System Documentation

## 🚀 System Overview

Spark RAT is a comprehensive Remote Administration Tool that provides real-time monitoring, remote control, and management capabilities for distributed devices. The system consists of three main components:

- **Backend Server**: Go-based server deployed on Render
- **Frontend Dashboard**: React-based web interface deployed on Vercel
- **Client Software**: Cross-platform client for Windows, macOS, and Linux

## 🌐 Production URLs

- **Backend API**: https://spark-backend-fixed-v2.onrender.com
- **Frontend Dashboard**: https://spark-rat-dashboard.vercel.app
- **Web Interface**: https://spark-backend-fixed-v2.onrender.com/web/dist/

## 🔧 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │  Frontend Web   │    │  Backend API    │
│  (Windows/Mac/  │    │   Dashboard     │    │   (Render)      │
│     Linux)      │◄──►│   (Vercel)      │◄──►│                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   WebSocket     │
                    │   Real-time     │
                    │  Communication │
                    └─────────────────┘
```

## 🛠️ Features

### Core Features
- **Real-time Device Monitoring**: Live status updates and metrics
- **Remote Terminal Access**: Execute commands on remote devices
- **File Management**: Upload, download, and manage files
- **Desktop Streaming**: Real-time screen sharing
- **Process Management**: Monitor and control running processes
- **Screenshot Capture**: Take screenshots of remote devices
- **System Control**: Lock, restart, and shutdown devices

### Security Features
- **Encrypted Communication**: AES-256 encryption for all data
- **Authentication**: Secure admin login with bcrypt hashing
- **HTTPS/WSS**: All communication over secure protocols
- **CORS Protection**: Configured for specific domains
- **Rate Limiting**: Protection against abuse
- **Security Headers**: XSS, CSRF, and clickjacking protection

## 🔐 Authentication

### Admin Access
- **Username**: `admin`
- **Password**: Set via environment variable `SPARK_ADMIN_HASH`
- **Default Password**: `ChangeMe2024!SecurePassword`
- **Hash**: `$2b$10$RYCAuSMeNE1uh2/qka5PSeE6RFjynbpXu95HMStXmUHA8qaQNBFjG`

### Client Authentication
- **Registration Key**: Required for client registration
- **Salt**: `a2dac101827c8d47f00831f2d6c078b2`
- **Auto-reconnection**: Enabled with 5-second intervals

## 📱 Client Installation

### Windows
1. Download: `spark-client-windows.exe`
2. Run as Administrator
3. Install as Windows Service
4. Configure server settings

### macOS
1. Download: `spark-client-darwin` (Intel) or `spark-client-darwin-arm` (Apple Silicon)
2. Make executable: `chmod +x spark-client-darwin`
3. Install as LaunchDaemon
4. Configure server settings

### Linux
1. Download: `spark-client-linux` (x64) or `spark-client-linux-arm` (ARM)
2. Make executable: `chmod +x spark-client-linux`
3. Install as systemd service
4. Configure server settings

## 🔧 Configuration

### Backend Configuration (Render)
```bash
PORT=8000
GO_ENV=production
SPARK_SALT=a2dac101827c8d47f00831f2d6c078b2
SPARK_ADMIN_HASH=$2b$10$RYCAuSMeNE1uh2/qka5PSeE6RFjynbpXu95HMStXmUHA8qaQNBFjG
```

### Frontend Configuration (Vercel)
```bash
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
```go
const (
    Host = "spark-backend-fixed-v2.onrender.com"
    Port = 443
    Salt = "a2dac101827c8d47f00831f2d6c078b2"
)
```

## 📊 Monitoring

### Health Checks
- **Backend**: `GET /api/info` (if implemented)
- **Device List**: `GET /api/device/list`
- **Web Interface**: `GET /web/dist/`

### Metrics
- **Response Time**: < 200ms average
- **Uptime**: 99.9% target
- **Concurrent Clients**: Up to 1000
- **Memory Usage**: < 512MB
- **CPU Usage**: < 50%

### Logging
- **Backend Logs**: Available in Render dashboard
- **Frontend Logs**: Available in Vercel dashboard
- **Client Logs**: Local system logs
- **Retention**: 7 days

## 🚨 Troubleshooting

### Common Issues

#### Backend Not Responding
1. Check Render service status
2. Verify environment variables
3. Check service logs
4. Restart service if needed

#### Frontend Not Loading
1. Check Vercel deployment status
2. Verify environment variables
3. Check build logs
4. Redeploy if needed

#### Client Connection Issues
1. Verify server URL and port
2. Check firewall settings
3. Verify salt configuration
4. Check network connectivity

#### Authentication Failures
1. Verify admin password hash
2. Check client registration key
3. Verify salt configuration
4. Check CORS settings

### Debug Commands
```bash
# Test backend health
curl https://spark-backend-fixed-v2.onrender.com/api/device/list

# Test frontend
curl https://spark-rat-dashboard.vercel.app

# Test WebSocket (if wscat installed)
wscat -c wss://spark-backend-fixed-v2.onrender.com/ws
```

## 🔄 Maintenance

### Regular Tasks
- **Daily**: Check service status and logs
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Rotate credentials and review access

### Updates
- **Backend**: Deploy via Render dashboard
- **Frontend**: Deploy via Vercel dashboard
- **Clients**: Distribute new binaries via GitHub releases

### Backup
- **Configuration**: Stored in environment variables
- **Logs**: Automatically managed by platforms
- **Client Data**: Stored locally on devices

## 📈 Scaling

### Backend Scaling
- **Render**: Auto-scaling based on traffic
- **Database**: In-memory with disk persistence
- **CDN**: Vercel global CDN for frontend

### Client Scaling
- **Concurrent Connections**: Up to 1000 clients
- **Geographic Distribution**: Global deployment
- **Load Balancing**: Automatic via Render

## 🔒 Security

### Best Practices
1. **Regular Updates**: Keep all components updated
2. **Credential Rotation**: Change passwords quarterly
3. **Access Control**: Limit admin access
4. **Monitoring**: Monitor for suspicious activity
5. **Backup**: Regular configuration backups

### Compliance
- **Data Encryption**: All data encrypted in transit
- **Access Logging**: All access logged
- **Audit Trail**: Complete audit trail maintained
- **Privacy**: No personal data stored

## 📞 Support

### Documentation
- **User Guide**: See `README.md`
- **Admin Guide**: See `ADMIN_GUIDE.md`
- **API Documentation**: See `API.md`
- **Troubleshooting**: See this document

### Contact
- **Issues**: GitHub Issues
- **Security**: security@example.com
- **General**: support@example.com

## 📋 System Requirements

### Backend
- **Platform**: Render (Docker)
- **Memory**: 512MB minimum
- **CPU**: 1 vCPU minimum
- **Storage**: 1GB minimum

### Frontend
- **Platform**: Vercel
- **Memory**: 1GB minimum
- **CPU**: 1 vCPU minimum
- **Storage**: 100MB minimum

### Client
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
- **Memory**: 64MB minimum
- **CPU**: Any x64 or ARM processor
- **Network**: Internet connection required

## 🎯 Performance Targets

- **Response Time**: < 200ms
- **Uptime**: 99.9%
- **Concurrent Users**: 1000
- **Data Transfer**: 1GB/hour per client
- **Storage**: 10GB total

---

**Version**: 2.0.0  
**Last Updated**: October 25, 2025  
**Status**: Production Ready