# Spark Client Installer for Windows
# Run as Administrator

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: Please run as Administrator" -ForegroundColor Red
    exit 1
}

# Download client
Write-Host "Downloading Spark client..." -ForegroundColor Green
$url = "https://github.com/oranolio956/Cupid-/raw/main/spark-setup/spark-client/builds/spark-client-windows.exe"
$output = "$env:ProgramFiles\Spark\spark-client.exe"

# Create directory
New-Item -ItemType Directory -Force -Path "$env:ProgramFiles\Spark" | Out-Null

# Download
try {
    Invoke-WebRequest -Uri $url -OutFile $output
    Write-Host "Download completed successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to download client. Please check your internet connection." -ForegroundColor Red
    exit 1
}

# Install as service
Write-Host "Installing as service..." -ForegroundColor Green
try {
    New-Service -Name "SparkClient" `
        -BinaryPathName $output `
        -DisplayName "Spark Monitoring Client" `
        -Description "Remote monitoring and administration client" `
        -StartupType Automatic
    
    Write-Host "Service installed successfully" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Failed to install as service. You can run manually: $output" -ForegroundColor Yellow
}

# Start service
try {
    Start-Service -Name "SparkClient"
    Write-Host "Service started successfully" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Failed to start service. Please start manually." -ForegroundColor Yellow
}

Write-Host "✓ Installation complete!" -ForegroundColor Green
Write-Host "Service status:" -ForegroundColor Cyan
Get-Service -Name "SparkClient" -ErrorAction SilentlyContinue

Write-Host "`nYour device will appear in the dashboard within 10 seconds." -ForegroundColor Cyan
Write-Host "Dashboard: https://cupid-otys.vercel.app" -ForegroundColor Cyan