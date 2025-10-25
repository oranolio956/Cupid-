# Spark Backend Deployment Guide

## 🚀 Complete Setup Instructions

Your Spark backend has been configured for deployment on Render. Here's everything you need to know:

## 📋 Service Configuration

- **Service Name**: Spark-Backend-API
- **Service ID**: srv-d3u6cgripnbc738naa70
- **Service URL**: https://cupid-1-njpo.onrender.com
- **Repository**: https://github.com/oranolio956/Cupid-
- **Root Directory**: spark-setup/spark-backend
- **Dockerfile**: ./Dockerfile.render
- **Plan**: Free (upgraded to Starter if needed)

## 🔧 Environment Variables

The following environment variables have been configured:

```bash
PORT=8000
SPARK_LISTEN=:8000
SPARK_SALT=render-salt-123456789012345678901234
SPARK_USERNAME=admin
SPARK_PASSWORD=render-admin-password-123
```

## 📡 API Endpoints

Once deployed, your backend will be available at:

- **Health Check**: `https://cupid-1-njpo.onrender.com/api/health`
- **Device List**: `https://cupid-1-njpo.onrender.com/api/device/list`
- **WebSocket**: `wss://cupid-1-njpo.onrender.com/ws`
- **Frontend**: `https://cupid-1-njpo.onrender.com/`

## 🔑 SSH Access

**SSH Key Generated**:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAID4WBzHOqRJD5SV8rnL2VaPiyK74drv1hSbRrsltp/Ls render-deployment-key
```

**SSH Address**: `srv-d3u6cgripnbc738naa70@ssh.oregon.render.com`

## 🚀 Deployment Steps

### Option 1: Manual Dashboard Deployment (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com/web/srv-d3u6cgripnbc738naa70
2. **Unsuspend Service**: Click "Unsuspend" to activate the service
3. **Monitor Deployment**: Watch the build logs as it deploys
4. **Test Endpoints**: Once deployed, test the API endpoints

### Option 2: Using render.yaml (Blue-Green Deployment)

1. **Commit Changes**: Push your changes to the main branch
2. **Auto-Deploy**: Render will automatically detect the render.yaml file
3. **Monitor**: Check the deployment status in the dashboard

### Option 3: Manual API Deployment

```bash
# Trigger manual deployment
curl -X POST https://api.render.com/v1/services/srv-d3u6cgripnbc738naa70/deploys \
  -H "Authorization: Bearer rnd_EBeA1GCdGDixMGI6PpwkalLa6gxh" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 🔍 Monitoring & Debugging

### Check Service Status
```bash
curl -s https://api.render.com/v1/services/srv-d3u6cgripnbc738naa70 \
  -H "Authorization: Bearer rnd_EBeA1GCdGDixMGI6PpwkalLa6gxh"
```

### Test Health Endpoint
```bash
curl https://cupid-1-njpo.onrender.com/api/health
```

### Test Device List
```bash
curl https://cupid-1-njpo.onrender.com/api/device/list
```

## 🛠️ Backend Features

Your Spark backend includes:

- **WebSocket Support**: Real-time device communication
- **REST API**: Device management endpoints
- **Embedded Frontend**: React-based UI served by Go
- **Health Monitoring**: Built-in health checks
- **CORS Support**: Cross-origin requests enabled
- **Graceful Shutdown**: Proper cleanup on termination

## 📁 Project Structure

```
spark-setup/spark-backend/
├── server/
│   ├── main.go              # Main server application
│   ├── embed.go             # Frontend embedding
│   └── dist/                # Built frontend
├── web/                     # Frontend source (if separate)
├── Dockerfile.render        # Render-optimized Dockerfile
├── start.sh                 # Startup script
├── config.json              # Configuration file
├── go.mod                   # Go dependencies
└── go.sum                   # Go dependency checksums
```

## 🔄 Auto-Deployment

The service is configured for:
- **Auto-deploy on commit**: Every push to main branch triggers deployment
- **Pull request previews**: Enabled for testing
- **Health checks**: Automatic monitoring
- **Graceful restarts**: Zero-downtime deployments

## 🚨 Troubleshooting

### Service Suspended
If the service is suspended:
1. Go to the Render dashboard
2. Click "Unsuspend" to reactivate
3. Monitor the deployment logs

### Build Failures
1. Check the build logs in the dashboard
2. Verify Dockerfile syntax
3. Ensure all dependencies are available

### Runtime Issues
1. Check the service logs
2. Verify environment variables
3. Test endpoints individually

## 📞 Support

- **Render Dashboard**: https://dashboard.render.com/web/srv-d3u6cgripnbc738naa70
- **Service Logs**: Available in the dashboard
- **API Documentation**: Check the main.go file for endpoint details

## ✅ Next Steps

1. **Unsuspend the service** from the dashboard
2. **Monitor the deployment** progress
3. **Test all endpoints** once deployed
4. **Update your frontend** to use the new backend URL
5. **Configure custom domain** if needed

Your Spark backend is now fully configured and ready for deployment! 🎉