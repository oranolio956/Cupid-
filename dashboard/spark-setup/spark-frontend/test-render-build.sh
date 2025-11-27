#!/bin/bash

# Test script to exactly replicate Render's build environment
echo "=== Render Build Environment Replication ==="

# Set environment variables exactly as Render does
export NODE_ENV=production
export NODE_VERSION=25.0.0
export NPM_VERSION=9

echo "Environment:"
echo "NODE_ENV: $NODE_ENV"
echo "NODE_VERSION: $NODE_VERSION"
echo "NPM_VERSION: $NPM_VERSION"

# Clean everything (as Render does)
echo "=== Cleaning environment ==="
rm -rf node_modules package-lock.json dist

# Simulate Render's directory structure
echo "=== Setting up Render directory structure ==="
mkdir -p /tmp/render-test/src/spark-setup/spark-frontend
cp -r . /tmp/render-test/src/spark-setup/spark-frontend/
cd /tmp/render-test/src/spark-setup/spark-frontend

echo "Current directory: $(pwd)"
echo "Contents:"
ls -la

# Install dependencies (as Render does)
echo "=== Installing dependencies ==="
npm install

# Run the exact build command Render uses
echo "=== Running Render build command ==="
npm run vercel-build

# Check build output
echo "=== Checking build output ==="
if [ -d "dist" ]; then
    echo "✅ dist directory exists"
    echo "Contents:"
    ls -la dist/
    
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html exists"
        echo "Checking HTML content:"
        head -5 dist/index.html
    else
        echo "❌ index.html missing"
    fi
else
    echo "❌ dist directory missing"
fi

echo "=== Render build simulation complete ==="