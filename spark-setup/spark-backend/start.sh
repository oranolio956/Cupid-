#!/bin/bash

# Render startup script for Spark
# This script handles environment variables and starts the server

echo "🚀 Starting Spark on Render..."

# Set default values if not provided
export SPARK_LISTEN=${SPARK_LISTEN:-":${PORT:-8000}"}
export SPARK_SALT=${SPARK_SALT:-"render-salt-123456789012345678901234"}
export SPARK_USERNAME=${SPARK_USERNAME:-"admin"}
export SPARK_PASSWORD=${SPARK_PASSWORD:-"render-admin-password-123"}

# Create config.json from environment variables
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

# Start the server
echo "🎯 Starting Spark server..."

# Check if binary exists and is executable
if [ ! -f "./spark-server" ]; then
    echo "❌ Error: spark-server binary not found!"
    ls -la /app/
    exit 1
fi

if [ ! -x "./spark-server" ]; then
    echo "❌ Error: spark-server binary is not executable!"
    ls -la /app/
    exit 1
fi

echo "✅ Binary found and executable, starting server..."
exec ./spark-server