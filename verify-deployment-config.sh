#!/bin/bash
# Deployment Configuration Verification Script
# This script checks if all deployment configurations are correct

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     SPARK RAT DEPLOYMENT CONFIGURATION VERIFICATION        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "BACKEND VERIFICATION (Render Deployment)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check 1: Go version
echo "🔍 Checking go.mod version..."
if grep -q "^go 1.21" spark-setup/spark-backend/go.mod; then
    echo -e "${GREEN}✅ PASS${NC} - go.mod uses go 1.21"
else
    GO_VERSION=$(grep "^go " spark-setup/spark-backend/go.mod)
    echo -e "${RED}❌ FAIL${NC} - go.mod has invalid version: $GO_VERSION"
    echo "   Expected: go 1.21"
    ((ERRORS++))
fi

# Check 2: Toolchain version
echo "🔍 Checking toolchain version..."
if grep -q "toolchain go1.24" spark-setup/spark-backend/go.mod; then
    echo -e "${RED}❌ FAIL${NC} - go.mod has invalid toolchain: go1.24.x"
    echo "   This should be removed or changed to go1.21.0"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ PASS${NC} - No problematic toolchain version"
fi

# Check 3: Dockerfile has wget
echo "🔍 Checking Dockerfile for wget..."
if grep -q "wget" spark-setup/spark-backend/Dockerfile.simple; then
    echo -e "${GREEN}✅ PASS${NC} - Dockerfile includes wget"
else
    echo -e "${RED}❌ FAIL${NC} - Dockerfile missing wget (required for health checks)"
    ((ERRORS++))
fi

# Check 4: Dockerfile has HEALTHCHECK
echo "🔍 Checking Dockerfile for HEALTHCHECK..."
if grep -q "HEALTHCHECK" spark-setup/spark-backend/Dockerfile.simple; then
    echo -e "${GREEN}✅ PASS${NC} - Dockerfile includes HEALTHCHECK directive"
else
    echo -e "${RED}❌ FAIL${NC} - Dockerfile missing HEALTHCHECK directive"
    ((ERRORS++))
fi

# Check 5: Dockerfile copies config.json
echo "🔍 Checking Dockerfile for config.json copy..."
if grep -q "COPY config.json" spark-setup/spark-backend/Dockerfile.simple || grep -q "COPY . ." spark-setup/spark-backend/Dockerfile.simple; then
    if grep -q "COPY config.json" spark-setup/spark-backend/Dockerfile.simple; then
        echo -e "${GREEN}✅ PASS${NC} - Dockerfile explicitly copies config.json"
    else
        echo -e "${YELLOW}⚠️  WARN${NC} - Dockerfile uses 'COPY . .' which includes config.json"
        echo "   Explicit copy is recommended"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ FAIL${NC} - Dockerfile doesn't copy config.json"
    ((ERRORS++))
fi

# Check 6: config.json exists
echo "🔍 Checking if config.json exists..."
if [ -f "spark-setup/spark-backend/config.json" ]; then
    echo -e "${GREEN}✅ PASS${NC} - config.json exists"
else
    echo -e "${RED}❌ FAIL${NC} - config.json not found"
    ((ERRORS++))
fi

# Check 7: render.yaml configuration
echo "🔍 Checking render.yaml configuration..."
if [ -f "render.yaml" ]; then
    if grep -q "dockerfilePath: ./spark-setup/spark-backend/Dockerfile.simple" render.yaml; then
        echo -e "${GREEN}✅ PASS${NC} - render.yaml points to correct Dockerfile"
    else
        echo -e "${RED}❌ FAIL${NC} - render.yaml Dockerfile path is incorrect"
        ((ERRORS++))
    fi
else
    echo -e "${RED}❌ FAIL${NC} - render.yaml not found"
    ((ERRORS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FRONTEND VERIFICATION (Vercel Deployment)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check 8: vercel.json buildCommand
echo "🔍 Checking vercel.json for buildCommand..."
if grep -q "buildCommand" spark-setup/spark-frontend/vercel.json; then
    echo -e "${GREEN}✅ PASS${NC} - vercel.json includes buildCommand"
else
    echo -e "${RED}❌ FAIL${NC} - vercel.json missing buildCommand"
    ((ERRORS++))
fi

# Check 9: package.json build scripts
echo "🔍 Checking package.json build scripts..."
if grep -q '"build": "npm run build-prod"' spark-setup/spark-frontend/package.json; then
    echo -e "${GREEN}✅ PASS${NC} - package.json has correct build script"
else
    echo -e "${RED}❌ FAIL${NC} - package.json build script incorrect"
    ((ERRORS++))
fi

# Check 10: Backend URL consistency
echo "🔍 Checking backend URL consistency across frontend files..."
BACKEND_URL_COUNT=$(grep -r "spark-backend-fixed-v2.onrender.com" spark-setup/spark-frontend/ 2>/dev/null | grep -v node_modules | wc -l)
if [ "$BACKEND_URL_COUNT" -ge 3 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Backend URLs found in expected files (count: $BACKEND_URL_COUNT)"
else
    echo -e "${YELLOW}⚠️  WARN${NC} - Backend URL found in fewer files than expected (count: $BACKEND_URL_COUNT)"
    ((WARNINGS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CONFIGURATION SYNC VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check 11: Salt value sync
echo "🔍 Checking salt value sync between config.json and render.yaml..."
CONFIG_SALT=$(grep '"salt":' spark-setup/spark-backend/config.json | cut -d'"' -f4)
RENDER_SALT=$(grep "SPARK_SALT" render.yaml -A 1 | grep "value:" | awk '{print $2}')
if [ "$CONFIG_SALT" == "$RENDER_SALT" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Salt values match"
else
    echo -e "${RED}❌ FAIL${NC} - Salt values DO NOT match"
    echo "   config.json: $CONFIG_SALT"
    echo "   render.yaml: $RENDER_SALT"
    ((ERRORS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo ""
    echo "🚀 Configuration is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "  1. Commit changes to git"
    echo "  2. Push to GitHub"
    echo "  3. Deploy backend to Render"
    echo "  4. Deploy frontend to Vercel"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  WARNINGS FOUND: $WARNINGS${NC}"
    echo ""
    echo "Configuration will likely work but has minor issues."
    echo "Review warnings above and fix if needed."
    exit 0
else
    echo -e "${RED}❌ CRITICAL ERRORS FOUND: $ERRORS${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  WARNINGS: $WARNINGS${NC}"
    fi
    echo ""
    echo "🚫 DO NOT DEPLOY until all errors are fixed!"
    echo ""
    echo "See DEPLOYMENT_VERIFICATION_REPORT.md for detailed fix instructions."
    exit 1
fi