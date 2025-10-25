#!/bin/bash

# Spark Backend Deployment to Render
# This script deploys the Spark backend to Render using the render.yaml configuration

echo "🚀 Spark Backend Deployment to Render"
echo "====================================="
echo ""

# Configuration
SERVICE_NAME="spark-backend-fixed-v2"
BACKEND_URL="https://spark-backend-fixed-v2.onrender.com"
DOCKERFILE_PATH="./spark-setup/spark-backend/Dockerfile"
DOCKER_CONTEXT="./spark-setup/spark-backend/"

echo "📋 Deployment Configuration:"
echo "- Service Name: $SERVICE_NAME"
echo "- Backend URL: $BACKEND_URL"
echo "- Dockerfile: $DOCKERFILE_PATH"
echo "- Docker Context: $DOCKER_CONTEXT"
echo ""

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found!"
    echo "   Please ensure render.yaml is in the root directory."
    exit 1
fi

echo "✅ render.yaml found"

# Check if Dockerfile exists
if [ ! -f "$DOCKERFILE_PATH" ]; then
    echo "❌ Error: Dockerfile not found at $DOCKERFILE_PATH"
    exit 1
fi

echo "✅ Dockerfile found"

# Check if Docker context exists
if [ ! -d "$DOCKER_CONTEXT" ]; then
    echo "❌ Error: Docker context directory not found at $DOCKER_CONTEXT"
    exit 1
fi

echo "✅ Docker context directory found"

# Validate render.yaml configuration
echo ""
echo "🔍 Validating render.yaml configuration..."

# Check required fields
if ! grep -q "name: $SERVICE_NAME" render.yaml; then
    echo "⚠️  Warning: Service name in render.yaml doesn't match expected name"
fi

if ! grep -q "dockerfilePath: $DOCKERFILE_PATH" render.yaml; then
    echo "⚠️  Warning: Dockerfile path in render.yaml doesn't match expected path"
fi

if ! grep -q "dockerContext: $DOCKER_CONTEXT" render.yaml; then
    echo "⚠️  Warning: Docker context in render.yaml doesn't match expected context"
fi

# Check environment variables
echo ""
echo "🔧 Environment Variables Configuration:"
echo "- PORT: 8000"
echo "- GO_ENV: production"
echo "- SPARK_SALT: a2dac101827c8d47f00831f2d6c078b2"
echo "- SPARK_ADMIN_HASH: [bcrypt hash]"
echo ""

# Check if service is already deployed
echo "🔍 Checking if service is already deployed..."
if curl -s --head "$BACKEND_URL/api/info" | grep -q "200 OK"; then
    echo "✅ Service is already running at $BACKEND_URL"
    echo "   Health check endpoint responding"
else
    echo "ℹ️  Service not yet deployed or not responding"
fi

echo ""
echo "📝 Deployment Instructions:"
echo "=========================="
echo ""
echo "1. Go to https://dashboard.render.com"
echo "2. Create a new Web Service (if not exists)"
echo "3. Connect your GitHub repository"
echo "4. Use the following settings:"
echo "   - Name: $SERVICE_NAME"
echo "   - Environment: Docker"
echo "   - Dockerfile Path: $DOCKERFILE_PATH"
echo "   - Docker Context: $DOCKER_CONTEXT"
echo "   - Plan: Starter (or higher)"
echo "   - Region: Oregon (or your preference)"
echo "   - Branch: main"
echo "   - Auto-Deploy: Yes"
echo ""
echo "5. Set Environment Variables:"
echo "   - PORT: 8000"
echo "   - GO_ENV: production"
echo "   - SPARK_SALT: a2dac101827c8d47f00831f2d6c078b2"
echo "   - SPARK_ADMIN_HASH: \$2b\$10\$RYCAuSMeNE1uh2/qka5PSeE6RFjynbpXu95HMStXmUHA8qaQNBFjG"
echo ""
echo "6. Deploy the service"
echo "7. Wait for build to complete"
echo "8. Test the health endpoint: $BACKEND_URL/api/info"
echo ""

echo "🧪 Post-Deployment Testing:"
echo "=========================="
echo ""
echo "Test these endpoints after deployment:"
echo "- Health Check: curl $BACKEND_URL/api/info"
echo "- Device List: curl $BACKEND_URL/api/device/list"
echo "- WebSocket: wscat -c $BACKEND_URL/ws"
echo ""

echo "📊 Expected Health Check Response:"
echo '{"version":"1.0.0","uptime":"5s","clients":0}'
echo ""

echo "🎯 Your Spark Backend will be available at:"
echo "   $BACKEND_URL"
echo ""
echo "✅ Deployment script completed!"
echo "   Follow the instructions above to deploy to Render."