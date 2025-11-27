#!/bin/bash
# Spark Client Installer for Linux/macOS
# Run with sudo

if [ "$EUID" -ne 0 ]; then
  echo "ERROR: Please run as root (sudo ./install-linux.sh)"
  exit 1
fi

# Detect OS
if [ "$(uname)" == "Darwin" ]; then
  OS="macos"
  BINARY_URL="https://github.com/oranolio956/Cupid-/raw/main/spark-setup/spark-client/builds/spark-client-macos-intel"
  BINARY_NAME="spark-client-macos-intel"
elif [ "$(uname)" == "Linux" ]; then
  OS="linux"
  BINARY_URL="https://github.com/oranolio956/Cupid-/raw/main/spark-setup/spark-client/builds/spark-client-linux"
  BINARY_NAME="spark-client-linux"
else
  echo "ERROR: Unsupported OS"
  exit 1
fi

echo "Installing Spark client for $OS..."

# Download binary
echo "Downloading client..."
curl -L $BINARY_URL -o /usr/local/bin/spark-client
if [ $? -ne 0 ]; then
  echo "ERROR: Failed to download client. Please check your internet connection."
  exit 1
fi

chmod +x /usr/local/bin/spark-client
echo "Client downloaded and made executable"

# Create systemd service (Linux only)
if [ "$OS" == "linux" ]; then
  echo "Installing systemd service..."
  cat > /etc/systemd/system/spark-client.service << 'SERVICE'
[Unit]
Description=Spark Monitoring Client
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/spark-client
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

  systemctl daemon-reload
  systemctl enable spark-client
  systemctl start spark-client
  
  echo "✓ Installed as systemd service"
  systemctl status spark-client --no-pager
fi

# Create LaunchDaemon (macOS only)
if [ "$OS" == "macos" ]; then
  echo "Installing LaunchDaemon..."
  cat > /Library/LaunchDaemons/com.spark.client.plist << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.spark.client</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/spark-client</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
PLIST
  launchctl load /Library/LaunchDaemons/com.spark.client.plist
  
  echo "✓ Installed as LaunchDaemon"
fi

echo "✓ Installation complete!"
echo ""
echo "Your device will appear in the dashboard within 10 seconds."
echo "Dashboard: https://cupid-otys.vercel.app"
echo ""
echo "To check status:"
if [ "$OS" == "linux" ]; then
  echo "  sudo systemctl status spark-client"
  echo "  sudo systemctl restart spark-client"
else
  echo "  sudo launchctl list | grep spark"
fi