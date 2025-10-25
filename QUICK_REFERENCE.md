# Spark RAT - Quick Reference Guide

## 🚀 Quick Start

### Access the System
- **Dashboard**: https://spark-rat-dashboard.vercel.app
- **Login**: admin / [password]
- **Backend API**: https://spark-backend-fixed-v2.onrender.com

### Install Client
```bash
# Windows
spark-client-windows.exe

# Linux
chmod +x spark-client-linux
./spark-client-linux

# macOS
chmod +x spark-client-darwin
./spark-client-darwin
```

## 🔧 Configuration

### Backend (Render)
- **Service**: spark-backend-fixed-v2
- **Port**: 8000
- **Environment**: production
- **Salt**: a2dac101827c8d47f00831f2d6c078b2

### Frontend (Vercel)
- **Project**: spark-rat-dashboard
- **Build Command**: npm run vercel-build
- **Output Directory**: dist
- **API URL**: https://spark-backend-fixed-v2.onrender.com

### Client
- **Server**: spark-backend-fixed-v2.onrender.com
- **Port**: 443
- **Salt**: a2dac101827c8d47f00831f2d6c078b2

## 📱 Features

| Feature | Status | Description |
|---------|--------|-------------|
| Terminal | ✅ | Remote command execution |
| Desktop | ✅ | Real-time screen sharing |
| Files | ✅ | File upload/download |
| Process | ✅ | Process management |
| Screenshot | ✅ | Screen capture |
| System | ✅ | Power control |

## 🔐 Security

### Authentication
- **Method**: Cookie-based
- **Admin**: admin / [password]
- **Encryption**: AES-256
- **Protocol**: HTTPS/WSS

### Headers
- **HSTS**: Enabled
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: Enabled
- **CORS**: Configured

## 🧪 Testing

### Health Checks
```bash
# Backend health
curl https://spark-backend-fixed-v2.onrender.com/api/device/list

# Frontend
curl https://spark-rat-dashboard.vercel.app

# WebSocket
wscat -c wss://spark-backend-fixed-v2.onrender.com/ws
```

### Expected Responses
- **Backend**: `{"count":3,"devices":[...]}`
- **Frontend**: HTML content
- **WebSocket**: Connection established

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Backend 404 | Check service status in Render |
| Frontend not loading | Check Vercel deployment |
| Client won't connect | Verify server URL and salt |
| Auth failed | Check password hash |

### Debug Commands
```bash
# Check backend status
curl -I https://spark-backend-fixed-v2.onrender.com

# Check frontend status
curl -I https://spark-rat-dashboard.vercel.app

# Test API
curl -H "Origin: https://spark-rat-dashboard.vercel.app" \
     https://spark-backend-fixed-v2.onrender.com/api/device/list
```

## 📊 Monitoring

### Key Metrics
- **Response Time**: < 200ms
- **Uptime**: 99.9%
- **Clients**: Up to 1000
- **Memory**: < 512MB

### Logs
- **Backend**: Render dashboard
- **Frontend**: Vercel dashboard
- **Client**: Local system logs

## 🔄 Maintenance

### Daily
- Check service status
- Review logs
- Monitor performance

### Weekly
- Update dependencies
- Review security
- Check backups

### Monthly
- Rotate credentials
- Update documentation
- Review access logs

## 📞 Support

### Documentation
- **User Guide**: README.md
- **Admin Guide**: ADMIN_GUIDE.md
- **API Docs**: API.md

### URLs
- **GitHub**: [Repository URL]
- **Issues**: [Issues URL]
- **Support**: [Support Email]

---

**Version**: 2.0.0  
**Last Updated**: October 25, 2025