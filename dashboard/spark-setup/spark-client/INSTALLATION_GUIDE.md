# Spark Client Installation Guide

## Quick Installation

### Windows
1. **Download**: Right-click and "Save as" → [install-windows.ps1](install-windows.ps1)
2. **Run as Administrator**: Right-click PowerShell → "Run as Administrator"
3. **Execute**: `.\install-windows.ps1`
4. **Done**: Client installs as Windows service and starts automatically

### Linux
1. **Download**: `wget https://github.com/oranolio956/Cupid-/raw/main/spark-setup/spark-client/install-linux.sh`
2. **Make executable**: `chmod +x install-linux.sh`
3. **Run with sudo**: `sudo ./install-linux.sh`
4. **Done**: Client installs as systemd service and starts automatically

### macOS
1. **Download**: `curl -O https://github.com/oranolio956/Cupid-/raw/main/spark-setup/spark-client/install-linux.sh`
2. **Make executable**: `chmod +x install-linux.sh`
3. **Run with sudo**: `sudo ./install-linux.sh`
4. **Done**: Client installs as LaunchDaemon and starts automatically

## Manual Installation

### Windows
1. Download [spark-client-windows.exe](builds/spark-client-windows.exe)
2. Run as Administrator
3. Allow firewall access when prompted
4. Client runs in background

### Linux
1. Download [spark-client-linux](builds/spark-client-linux)
2. Make executable: `chmod +x spark-client-linux`
3. Run: `sudo ./spark-client-linux`

### macOS
1. Download [spark-client-macos-intel](builds/spark-client-macos-intel) (Intel Macs)
2. Download [spark-client-macos-arm](builds/spark-client-macos-arm) (Apple Silicon)
3. Make executable: `chmod +x spark-client-macos-*`
4. Run: `sudo ./spark-client-macos-*`

## Service Management

### Windows
```powershell
# Check status
Get-Service -Name "SparkClient"

# Start service
Start-Service -Name "SparkClient"

# Stop service
Stop-Service -Name "SparkClient"

# Restart service
Restart-Service -Name "SparkClient"
```

### Linux
```bash
# Check status
sudo systemctl status spark-client

# Start service
sudo systemctl start spark-client

# Stop service
sudo systemctl stop spark-client

# Restart service
sudo systemctl restart spark-client

# Enable auto-start
sudo systemctl enable spark-client

# Disable auto-start
sudo systemctl disable spark-client
```

### macOS
```bash
# Check status
sudo launchctl list | grep spark

# Start service
sudo launchctl load /Library/LaunchDaemons/com.spark.client.plist

# Stop service
sudo launchctl unload /Library/LaunchDaemons/com.spark.client.plist
```

## Verification

After installation, your device should appear in the dashboard within 10 seconds:

1. **Open Dashboard**: https://cupid-otys.vercel.app
2. **Login**: Use admin credentials
3. **Check Device List**: Your device should appear with:
   - Device name (hostname)
   - Online status (green indicator)
   - System information (OS, CPU, RAM, etc.)

## Troubleshooting

### Device Not Appearing
1. **Check client is running**:
   - Windows: Task Manager → Services → SparkClient
   - Linux: `sudo systemctl status spark-client`
   - macOS: `sudo launchctl list | grep spark`

2. **Check firewall**: Allow outbound connections on port 443

3. **Check internet connection**: Client needs to reach `spark-backend-fixed-v2.onrender.com`

4. **Check logs**:
   - Windows: Event Viewer → Windows Logs → Application
   - Linux: `sudo journalctl -u spark-client -f`
   - macOS: `sudo log show --predicate 'process == "spark-client"'`

### Connection Issues
1. **Server URL**: Client connects to `spark-backend-fixed-v2.onrender.com:443`
2. **Salt mismatch**: Ensure client and server use same salt
3. **HTTPS required**: Client uses secure connection only

### Permission Issues
1. **Windows**: Run as Administrator
2. **Linux/macOS**: Use `sudo` for installation and service management

## Uninstallation

### Windows
1. Stop service: `Stop-Service -Name "SparkClient"`
2. Remove service: `sc delete SparkClient`
3. Delete files: Remove `C:\Program Files\Spark\`

### Linux
1. Stop service: `sudo systemctl stop spark-client`
2. Disable service: `sudo systemctl disable spark-client`
3. Remove service file: `sudo rm /etc/systemd/system/spark-client.service`
4. Remove binary: `sudo rm /usr/local/bin/spark-client`
5. Reload systemd: `sudo systemctl daemon-reload`

### macOS
1. Stop service: `sudo launchctl unload /Library/LaunchDaemons/com.spark.client.plist`
2. Remove plist: `sudo rm /Library/LaunchDaemons/com.spark.client.plist`
3. Remove binary: `sudo rm /usr/local/bin/spark-client`

## Security Notes

- Client connects to server using encrypted communication
- All traffic uses HTTPS/WSS (port 443)
- Salt key ensures only authorized clients can connect
- Client runs with appropriate system permissions
- No sensitive data stored locally

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify your system meets requirements
3. Check server status: https://spark-backend-fixed-v2.onrender.com/api/info
4. Contact administrator for assistance