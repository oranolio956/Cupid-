#!/bin/bash

# Test script to simulate Vercel's build environment
echo "=== Vercel Build Simulation ==="

# Set environment variables as Vercel would
export NODE_ENV=production
export NODE_VERSION=18
export NPM_VERSION=9

echo "Environment:"
echo "NODE_ENV: $NODE_ENV"
echo "NODE_VERSION: $NODE_VERSION"
echo "NPM_VERSION: $NPM_VERSION"

# Clean install (as Vercel does)
echo "=== Cleaning node_modules ==="
rm -rf node_modules package-lock.json

echo "=== Installing dependencies ==="
npm install

echo "=== Running Vercel build command ==="
npm run vercel-build

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

echo "=== Build simulation complete ==="