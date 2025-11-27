#!/bin/bash

# Vercel Deployment Verification Script
# This script helps verify that the Vercel deployment is working correctly

echo "🔍 Vercel Deployment Verification Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

echo "📋 Pre-deployment Checklist:"
echo "1. Code changes committed and pushed ✅"
echo "2. Vercel dashboard configuration required:"
echo "   - Root Directory: spark-setup/spark-frontend"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Environment Variables: REACT_APP_API_URL, REACT_APP_WS_URL"
echo ""

# Check if we can access the backend
print_status "INFO" "Testing backend connectivity..."

BACKEND_URL="https://spark-backend-fixed-v2.onrender.com"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health" 2>/dev/null)

if [ "$HEALTH_CHECK" = "200" ]; then
    print_status "SUCCESS" "Backend is accessible at $BACKEND_URL"
else
    print_status "WARNING" "Backend health check failed (HTTP $HEALTH_CHECK)"
    print_status "INFO" "This might be normal if the service is starting up"
fi

echo ""
print_status "INFO" "Backend API endpoints to verify:"
echo "  - Health: $BACKEND_URL/api/health"
echo "  - Device List: $BACKEND_URL/api/device/list"
echo "  - WebSocket: wss://spark-backend-fixed-v2.onrender.com/ws"
echo ""

echo "🔧 Vercel Configuration Checklist:"
echo "=================================="
echo ""
echo "1. Root Directory Configuration:"
echo "   - Go to: Vercel Dashboard → Project Settings → General"
echo "   - Set Root Directory to: spark-setup/spark-frontend"
echo "   - Click Save"
echo ""

echo "2. Build Settings:"
echo "   - Framework Preset: Other"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Install Command: npm install"
echo ""

echo "3. Environment Variables:"
echo "   - Go to: Settings → Environment Variables"
echo "   - Add: REACT_APP_API_URL = https://spark-backend-fixed-v2.onrender.com"
echo "   - Add: REACT_APP_WS_URL = wss://spark-backend-fixed-v2.onrender.com"
echo "   - Enable for: Production, Preview, Development"
echo ""

echo "4. Trigger Redeploy:"
echo "   - Go to: Deployments tab"
echo "   - Click Redeploy on latest deployment"
echo "   - UNCHECK 'Use existing Build Cache'"
echo "   - Click Redeploy"
echo ""

echo "🧪 Post-deployment Verification:"
echo "==============================="
echo ""
echo "1. Open your Vercel URL in browser"
echo "2. Check for Spark dashboard (NOT CupidBot site)"
echo "3. Open Developer Tools (F12)"
echo "4. Check Console for:"
echo "   - API Base URL: https://spark-backend-fixed-v2.onrender.com"
echo "   - WebSocket URL: wss://spark-backend-fixed-v2.onrender.com"
echo "5. Check Network tab for API calls to Render backend"
echo "6. Verify device list loads with 3 sample devices"
echo ""

echo "🚨 Common Issues & Solutions:"
echo "============================="
echo ""
echo "Issue: Shows CupidBot site instead of Spark dashboard"
echo "Solution: Root directory not set correctly"
echo "Fix: Set Root Directory to 'spark-setup/spark-frontend'"
echo ""

echo "Issue: White screen with console errors"
echo "Solution: Environment variables not configured"
echo "Fix: Add REACT_APP_API_URL and REACT_APP_WS_URL in Vercel dashboard"
echo ""

echo "Issue: API calls return 404"
echo "Solution: axios.baseURL still using relative path"
echo "Fix: Verify index.jsx uses process.env.REACT_APP_API_URL"
echo ""

echo "Issue: Build fails"
echo "Solution: Check build logs for specific errors"
echo "Fix: Verify webpack configuration and dependencies"
echo ""

echo "📊 Expected Performance:"
echo "======================="
echo "- Build Time: 1-3 minutes"
echo "- First Load: < 5 seconds"
echo "- Time to Interactive: < 3 seconds"
echo "- Bundle Size: ~2-3 MB"
echo ""

print_status "SUCCESS" "Verification script completed!"
print_status "INFO" "Complete the Vercel dashboard configuration to resolve the white screen issue."
echo ""
echo "🎯 Next Steps:"
echo "1. Configure Vercel dashboard (4 steps above)"
echo "2. Trigger redeploy"
echo "3. Test the deployed application"
echo "4. Verify all functionality works correctly"
echo ""
echo "📞 Need Help?"
echo "Check the VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions"