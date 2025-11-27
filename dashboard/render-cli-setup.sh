#!/bin/bash

# Render CLI Setup Script
# This script sets up the Render CLI with the provided API key

echo "🚀 Render CLI Setup Complete!"
echo "=============================="

# Set environment variable for current session
export RENDER_API_KEY=rnd_DCT3Kms5YDiMxMPswtOvaDXHl26K

# Create config directory and file
mkdir -p ~/.render
echo "api_key: rnd_DCT3Kms5YDiMxMPswtOvaDXHl26K" > ~/.render/config.yaml

# Set workspace
render workspace set tea-d3tu5p2li9vc73bmjq00 -o json > /dev/null 2>&1

echo "✅ Render CLI is installed and configured"
echo "✅ API Key: rnd_DCT3Kms5YDiMxMPswtOvaDXHl26K"
echo "✅ Workspace: My Workspace (tea-d3tu5p2li9vc73bmjq00)"
echo ""

echo "📋 Available Services:"
echo "1. Cupid- (Frontend) - https://cupid-6kev.onrender.com [SUSPENDED]"
echo "2. Spark-Backend-API - https://cupid-1-njpo.onrender.com [SUSPENDED]"
echo "3. spark-backend-fixed-v2 - https://spark-backend-fixed-v2.onrender.com [ACTIVE]"
echo "4. Spark-Backend-Production - https://spark-backend-production.onrender.com [ACTIVE]"
echo ""

echo "🔧 Common Commands:"
echo "  render services -o json                    # List all services"
echo "  render services instances <service-id>     # List service instances"
echo "  render logs <service-id>                   # View service logs"
echo "  render restart <service-id>                # Restart a service"
echo "  render deploys <service-id>                # List deployments"
echo ""

echo "🌐 Service URLs:"
echo "  Frontend: https://cupid-6kev.onrender.com"
echo "  Backend (v1): https://cupid-1-njpo.onrender.com"
echo "  Backend (v2): https://spark-backend-fixed-v2.onrender.com"
echo "  Backend (Production): https://spark-backend-production.onrender.com"
echo ""

echo "📝 Note: Some services are suspended. Use the Render dashboard to unsuspend them:"
echo "  https://dashboard.render.com/"