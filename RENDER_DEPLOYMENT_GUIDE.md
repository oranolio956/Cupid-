# Render Deployment Guide for Spark Backend

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Ensure your code is pushed to GitHub
3. **Docker Knowledge**: Basic understanding of Docker containers

## Step 1: Prepare Repository

The repository is already configured with:
- ✅ `render.yaml` - Render service configuration
- ✅ `spark-setup/spark-backend/Dockerfile` - Multi-stage Docker build
- ✅ `spark-setup/spark-backend/.dockerignore` - Optimized build context
- ✅ `spark-setup/spark-backend/config.json` - Server configuration

## Step 2: Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account
   - Select the repository containing this code

3. **Configure Service**
   - **Name**: `spark-backend-fixed-v2`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `spark-setup/spark-backend/Dockerfile`
   - **Docker Context**: `spark-setup/spark-backend/`
   - **Plan**: `Starter` (Free tier)

4. **Set Environment Variables**
   ```
   PORT=8000
   GO_ENV=production
   SPARK_SALT=a2dac101827c8d47f00831f2d6c078b2
   SPARK_ADMIN_HASH=$2b$10$RYCAuSMeNE1uh2/qka5PSeE6RFjynbpXu95HMStXmUHA8qaQNBFjG
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)

### Option B: Using Render CLI

1. **Install Render CLI**
   ```bash
   # macOS
   curl -fsSL https://cli.render.com/install-macos.sh | sh
   
   # Linux
   curl -fsSL https://cli.render.com/install-linux.sh | sh
   ```

2. **Login to Render**
   ```bash
   render auth login
   ```

3. **Deploy Service**
   ```bash
   render services create --file render.yaml
   ```

## Step 3: Verify Deployment

### Health Check
```bash
curl https://your-service-name.onrender.com/api/info
```

Expected response:
```json
{
  "version": "1.0.0",
  "uptime": "5s",
  "clients": 0
}
```

### Test API Endpoints
```bash
# Device list
curl https://your-service-name.onrender.com/api/device/list

# Health check
curl https://your-service-name.onrender.com/api/info
```

## Step 4: Configure Frontend

Update the frontend configuration to use the new backend URL:

1. **Update Environment Variables**
   ```bash
   # In spark-setup/spark-frontend/.env.production
   REACT_APP_API_URL=https://your-service-name.onrender.com
   REACT_APP_WS_URL=wss://your-service-name.onrender.com
   ```

2. **Update Backend Configuration**
   ```javascript
   // In spark-setup/spark-frontend/src/config/backend.js
   const BACKEND_CONFIG = {
     API_URL: 'https://your-service-name.onrender.com',
     WS_URL: 'wss://your-service-name.onrender.com',
     // ... rest of config
   };
   ```

## Step 5: Test Client Connection

1. **Generate Client**
   - Use the frontend dashboard to generate a client
   - Download the client binary

2. **Install Client**
   - Run the client on a test machine
   - Verify it appears in the dashboard

3. **Test Features**
   - Terminal access
   - Desktop control
   - File management
   - Process control

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   - Check environment variables are set correctly
   - Verify Dockerfile path is correct
   - Check Render logs for errors

2. **Health Check Fails**
   - Ensure PORT=8000 is set
   - Check if the service is still starting up
   - Verify the health check path is correct

3. **Client Can't Connect**
   - Verify SPARK_SALT matches client configuration
   - Check if the service URL is correct
   - Ensure firewall allows HTTPS traffic

4. **Authentication Issues**
   - Verify SPARK_ADMIN_HASH is set correctly
   - Check if the password hash matches the expected value

### Debug Commands

```bash
# Check service status
render services list

# View logs
render logs your-service-name

# Check environment variables
render env list your-service-name
```

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive values to Git
   - Use Render's secure environment variable storage
   - Rotate secrets regularly

2. **Network Security**
   - Use HTTPS for all communications
   - Implement proper CORS policies
   - Monitor for suspicious activity

3. **Access Control**
   - Use strong admin passwords
   - Implement rate limiting
   - Monitor client connections

## Monitoring

1. **Render Dashboard**
   - Monitor service health
   - Check resource usage
   - View deployment logs

2. **Application Logs**
   - Monitor client connections
   - Track API usage
   - Watch for errors

3. **Performance**
   - Monitor response times
   - Check memory usage
   - Track concurrent connections

## Next Steps

After successful deployment:

1. ✅ Deploy frontend to Vercel
2. ✅ Configure production environment
3. ✅ Test end-to-end integration
4. ✅ Create production documentation
5. ✅ Set up monitoring and alerts

## Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Docker Documentation**: [docs.docker.com](https://docs.docker.com)
- **Go Documentation**: [golang.org/doc](https://golang.org/doc)

---

**Deployment Status**: Ready for deployment
**Last Updated**: $(date)
**Version**: 2.0.0