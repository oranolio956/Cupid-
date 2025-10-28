#!/bin/bash

echo "=== Building Spark RAT Client ==="
echo ""

# Clean old builds
rm -rf builds/*
mkdir -p builds

# Build for Linux (amd64)
echo "Building for Linux (amd64)..."
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o builds/spark-client-linux client.go
if [ $? -eq 0 ]; then
    echo "✅ Linux build complete: $(ls -lh builds/spark-client-linux | awk '{print $5}')"
else
    echo "❌ Linux build failed"
    exit 1
fi

# Build for Linux (arm64)
echo "Building for Linux (arm64)..."
GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o builds/spark-client-linux-arm client.go
if [ $? -eq 0 ]; then
    echo "✅ Linux ARM build complete: $(ls -lh builds/spark-client-linux-arm | awk '{print $5}')"
else
    echo "❌ Linux ARM build failed"
    exit 1
fi

# Build for Windows (amd64)
echo "Building for Windows (amd64)..."
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w -H=windowsgui" -o builds/spark-client-windows.exe client.go
if [ $? -eq 0 ]; then
    echo "✅ Windows build complete: $(ls -lh builds/spark-client-windows.exe | awk '{print $5}')"
else
    echo "❌ Windows build failed"
    exit 1
fi

echo ""
echo "=== Build Summary ==="
ls -lh builds/
echo ""
echo "✅ All builds complete!"
