#!/bin/bash
set -e

echo "🔧 Installing debugging and testing tools..."

# Update package list
sudo apt-get update -qq

# Install HTTP testing tools
echo "📡 Installing HTTP tools..."
sudo apt-get install -y -qq curl wget httpie jq

# Install WebSocket testing tool
echo "🔌 Installing WebSocket tools..."
if ! command -v websocat &> /dev/null; then
    wget -q https://github.com/vi/websocat/releases/download/v1.12.0/websocat.x86_64-unknown-linux-musl -O /tmp/websocat
    chmod +x /tmp/websocat
    sudo mv /tmp/websocat /usr/local/bin/websocat
fi

# Install load testing tool
echo "⚡ Installing load testing tools..."
if ! command -v hey &> /dev/null; then
    wget -q https://hey-release.s3.us-east-2.amazonaws.com/hey_linux_amd64 -O /tmp/hey
    chmod +x /tmp/hey
    sudo mv /tmp/hey /usr/local/bin/hey
fi

# Install Go tools for backend testing
echo "🔨 Installing Go testing tools..."
go install github.com/rakyll/hey@latest 2>/dev/null || true

# Install Node.js tools for frontend testing
echo "📦 Installing Node.js tools..."
npm install -g npm-check-updates artillery autocannon 2>/dev/null || true

# Install monitoring tools
echo "📊 Installing monitoring tools..."
sudo apt-get install -y -qq htop iotop nethogs

# Install database tools
echo "💾 Installing database tools..."
sudo apt-get install -y -qq sqlite3 postgresql-client

# Verify installations
echo ""
echo "✅ Verifying installations..."
echo "curl: $(curl --version | head -1)"
echo "jq: $(jq --version)"
echo "httpie: $(http --version)"
echo "websocat: $(websocat --version 2>&1 | head -1)"
echo "hey: $(hey -version 2>&1 | head -1 || echo 'installed')"
echo "sqlite3: $(sqlite3 --version)"
echo ""
echo "🎉 All tools installed successfully!"
