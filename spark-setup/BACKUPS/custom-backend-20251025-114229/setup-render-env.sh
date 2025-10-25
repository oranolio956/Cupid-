#!/bin/bash

# Render Environment Variables Setup Script
# This script helps you set up the environment variables for Render deployment

echo "🔧 Spark Backend - Render Environment Variables Setup"
echo "======================================================"
echo ""

echo "📋 Required Environment Variables for Render Dashboard:"
echo ""

echo "Core Configuration:"
echo "  PORT = 8000"
echo "  GO_ENV = production"
echo ""

echo "Security Configuration (CRITICAL):"
echo "  SPARK_SALT = 72415144205a3a1f5618223832aecbed"
echo "  SPARK_ADMIN_HASH = \$2b\$10\$Jbxck.MpAVkEZy.jM.z0Rufztx4WGfj//IhyOyBqsQp4nLWvr.em6"
echo ""

echo "Optional Configuration:"
echo "  SPARK_LOG_LEVEL = info"
echo "  SPARK_LOG_PATH = ./logs"
echo "  SPARK_LOG_DAYS = 7"
echo ""

echo "🔐 Security Information:"
echo "  Admin Password: ChangeMe2024!SecurePassword"
echo "  Salt Length: 32 characters (hex)"
echo "  Hash Algorithm: bcrypt (10 rounds)"
echo ""

echo "📝 Instructions:"
echo "1. Go to https://dashboard.render.com"
echo "2. Select your spark-backend service"
echo "3. Click 'Environment' tab"
echo "4. Add each variable with its value"
echo "5. Click 'Save Changes'"
echo "6. Redeploy the service"
echo ""

echo "✅ Setup complete! Remember to change the admin password in production."