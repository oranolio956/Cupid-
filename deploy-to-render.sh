#!/bin/bash

# Render Deployment Script for Spark Backend
# This script helps deploy your Spark backend to Render

echo "🚀 Spark Backend Deployment Script"
echo "=================================="

# Configuration
SERVICE_ID="srv-d3u6cgripnbc738naa70"
API_KEY="rnd_EBeA1GCdGDixMGI6PpwkalLa6gxh"
SERVICE_URL="https://cupid-1-njpo.onrender.com"

echo "📋 Service Configuration:"
echo "- Service ID: $SERVICE_ID"
echo "- Service URL: $SERVICE_URL"
echo "- Root Directory: spark-setup/spark-backend"
echo "- Dockerfile: ./Dockerfile.render"
echo ""

# Check if service is accessible
echo "🔍 Checking service status..."
STATUS=$(curl -s "https://api.render.com/v1/services/$SERVICE_ID" \
  -H "Authorization: Bearer $API_KEY" | \
  grep -o '"suspended":"[^"]*"' | cut -d'"' -f4)

if [ "$STATUS" = "suspended" ]; then
    echo "⚠️  Service is currently suspended."
    echo "   You need to unsuspend it from the Render dashboard:"
    echo "   https://dashboard.render.com/web/$SERVICE_ID"
    echo ""
    echo "   Or you can try to unsuspend it manually through the dashboard."
    echo "   Once unsuspended, the service will automatically deploy."
else
    echo "✅ Service is active and ready for deployment."
fi

echo ""
echo "🔧 Environment Variables Set:"
echo "- SPARK_LISTEN=:8000"
echo "- SPARK_SALT=render-salt-123456789012345678901234"
echo "- SPARK_USERNAME=admin"
echo "- SPARK_PASSWORD=render-admin-password-123"
echo ""

echo "📡 API Endpoints Available:"
echo "- Health Check: $SERVICE_URL/api/health"
echo "- Device List: $SERVICE_URL/api/device/list"
echo "- WebSocket: $SERVICE_URL/ws"
echo "- Frontend: $SERVICE_URL/"
echo ""

echo "🔑 SSH Access:"
echo "SSH Key: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAID4WBzHOqRJD5SV8rnL2VaPiyK74drv1hSbRrsltp/Ls render-deployment-key"
echo "SSH Address: srv-d3u6cgripnbc738naa70@ssh.oregon.render.com"
echo ""

echo "📝 Next Steps:"
echo "1. Go to https://dashboard.render.com/web/$SERVICE_ID"
echo "2. Click 'Unsuspend' to activate the service"
echo "3. The service will automatically build and deploy"
echo "4. Monitor the deployment logs"
echo "5. Test the endpoints once deployed"
echo ""

echo "🎯 Your Spark Backend will be available at: $SERVICE_URL"
echo "   The service is configured to auto-deploy on every commit to the main branch."