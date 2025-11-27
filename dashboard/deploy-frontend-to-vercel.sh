#!/bin/bash

# Spark Frontend Deployment to Vercel
# This script deploys the Spark frontend to Vercel

echo "🚀 Spark Frontend Deployment to Vercel"
echo "======================================"
echo ""

# Configuration
FRONTEND_DIR="spark-setup/spark-frontend"
FRONTEND_URL="https://spark-rat-dashboard.vercel.app"
BACKEND_URL="https://spark-backend-fixed-v2.onrender.com"

echo "📋 Deployment Configuration:"
echo "- Frontend Directory: $FRONTEND_DIR"
echo "- Frontend URL: $FRONTEND_URL"
echo "- Backend URL: $BACKEND_URL"
echo ""

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Error: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

echo "✅ Frontend directory found"

# Check if package.json exists
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo "❌ Error: package.json not found in frontend directory"
    exit 1
fi

echo "✅ package.json found"

# Check if vercel.json exists
if [ ! -f "$FRONTEND_DIR/vercel.json" ]; then
    echo "❌ Error: vercel.json not found in frontend directory"
    exit 1
fi

echo "✅ vercel.json found"

# Check if webpack.config.js exists
if [ ! -f "$FRONTEND_DIR/webpack.config.js" ]; then
    echo "❌ Error: webpack.config.js not found in frontend directory"
    exit 1
fi

echo "✅ webpack.config.js found"

# Validate vercel.json configuration
echo ""
echo "🔍 Validating vercel.json configuration..."

# Check if backend URL is correctly configured
if ! grep -q "$BACKEND_URL" "$FRONTEND_DIR/vercel.json"; then
    echo "⚠️  Warning: Backend URL in vercel.json doesn't match expected URL"
    echo "   Expected: $BACKEND_URL"
    echo "   Found in vercel.json:"
    grep "REACT_APP_API_URL" "$FRONTEND_DIR/vercel.json" || echo "   Not found"
fi

# Check build configuration
if ! grep -q "vercel-build" "$FRONTEND_DIR/package.json"; then
    echo "⚠️  Warning: vercel-build script not found in package.json"
fi

echo ""
echo "🔧 Environment Variables Configuration:"
echo "- REACT_APP_API_URL: $BACKEND_URL"
echo "- REACT_APP_WS_URL: wss://spark-backend-fixed-v2.onrender.com"
echo "- REACT_APP_NAME: Spark RAT Dashboard"
echo "- REACT_APP_VERSION: 2.0.0"
echo "- REACT_APP_ENVIRONMENT: production"
echo "- All feature flags: enabled"
echo ""

# Check if Vercel CLI is available
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI found"
    VERCEL_CLI_AVAILABLE=true
else
    echo "ℹ️  Vercel CLI not found - you'll need to install it or use the web interface"
    VERCEL_CLI_AVAILABLE=false
fi

echo ""
echo "📝 Deployment Instructions:"
echo "=========================="
echo ""

if [ "$VERCEL_CLI_AVAILABLE" = true ]; then
    echo "Method 1: Using Vercel CLI (Recommended)"
    echo "1. Navigate to frontend directory:"
    echo "   cd $FRONTEND_DIR"
    echo ""
    echo "2. Install dependencies:"
    echo "   npm install"
    echo ""
    echo "3. Deploy to Vercel:"
    echo "   vercel --prod"
    echo ""
    echo "4. Follow the prompts to configure the project"
    echo ""
else
    echo "Method 1: Using Vercel Web Interface"
    echo "1. Go to https://vercel.com"
    echo "2. Import your GitHub repository"
    echo "3. Set the following configuration:"
    echo "   - Framework Preset: Other"
    echo "   - Root Directory: $FRONTEND_DIR"
    echo "   - Build Command: npm run vercel-build"
    echo "   - Output Directory: dist"
    echo "   - Install Command: npm install"
    echo ""
    echo "4. Set Environment Variables:"
    echo "   - REACT_APP_API_URL: $BACKEND_URL"
    echo "   - REACT_APP_WS_URL: wss://spark-backend-fixed-v2.onrender.com"
    echo "   - REACT_APP_NAME: Spark RAT Dashboard"
    echo "   - REACT_APP_VERSION: 2.0.0"
    echo "   - REACT_APP_ENVIRONMENT: production"
    echo "   - REACT_APP_ENABLE_HTTPS: true"
    echo "   - REACT_APP_ENABLE_WEBSOCKETS: true"
    echo "   - REACT_APP_ENABLE_TERMINAL: true"
    echo "   - REACT_APP_ENABLE_DESKTOP: true"
    echo "   - REACT_APP_ENABLE_FILE_MANAGER: true"
    echo "   - REACT_APP_ENABLE_PROCESS_MANAGER: true"
    echo "   - REACT_APP_ENABLE_SCREENSHOT: true"
    echo "   - REACT_APP_ENABLE_SYSTEM_CONTROL: true"
    echo ""
    echo "5. Deploy the project"
    echo ""
fi

echo "🧪 Post-Deployment Testing:"
echo "=========================="
echo ""
echo "Test these after deployment:"
echo "- Frontend URL: $FRONTEND_URL"
echo "- Login page: $FRONTEND_URL/login"
echo "- Dashboard: $FRONTEND_URL/"
echo "- API connection: Check browser console for API calls"
echo ""

echo "🔧 Build Configuration:"
echo "======================"
echo ""
echo "The frontend is configured with:"
echo "- Webpack 5 for bundling"
echo "- React 17 with Ant Design"
echo "- Production optimizations enabled"
echo "- Security headers configured"
echo "- SPA routing with fallback to index.html"
echo "- Static asset caching"
echo ""

echo "📊 Expected Features:"
echo "===================="
echo "- Responsive dashboard design"
echo "- Device management interface"
echo "- Terminal access"
echo "- File manager"
echo "- Desktop streaming"
echo "- Process management"
echo "- Screenshot capture"
echo "- System control"
echo ""

echo "🎯 Your Spark Frontend will be available at:"
echo "   $FRONTEND_URL"
echo ""
echo "✅ Deployment script completed!"
echo "   Follow the instructions above to deploy to Vercel."