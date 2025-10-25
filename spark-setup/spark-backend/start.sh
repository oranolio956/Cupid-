#!/bin/bash

# Render startup script for Spark
# This script handles environment variables and starts the server

echo "🚀 Starting Spark on Render..."

# Set default values if not provided
export SPARK_LISTEN=${SPARK_LISTEN:-":${PORT:-8000}"}
export SPARK_SALT=${SPARK_SALT:-"render-salt-123456789012345678901234"}
export SPARK_USERNAME=${SPARK_USERNAME:-"admin"}
export SPARK_PASSWORD=${SPARK_PASSWORD:-"render-admin-password-123"}

# Debug: Show current working directory and files
echo "📁 Current directory: $(pwd)"
echo "📋 Files in current directory:"
ls -la

# Create config.json from environment variables
echo "📝 Creating configuration..."
cat > config.json << EOF
{
    "listen": "${SPARK_LISTEN}",
    "salt": "${SPARK_SALT}",
    "auth": {
        "${SPARK_USERNAME}": "${SPARK_PASSWORD}"
    },
    "log": {
        "level": "info",
        "path": "./logs",
        "days": 7
    }
}
EOF

echo "📝 Configuration created:"
echo "- Listen: ${SPARK_LISTEN}"
echo "- Username: ${SPARK_USERNAME}"
echo "- Salt: ${SPARK_SALT:0:8}..."

# Create logs directory
mkdir -p logs

# Check if binary exists and is executable
if [ ! -f "/app/spark-server" ]; then
    echo "❌ Error: spark-server binary not found!"
    echo "📋 Available files:"
    ls -la /app/
    exit 1
fi

if [ ! -x "/app/spark-server" ]; then
    echo "❌ Error: spark-server binary is not executable!"
    echo "📋 File permissions:"
    ls -la /app/spark-server
    exit 1
fi

echo "✅ Binary found and executable, starting server..."

# Start the server
exec /app/spark-server