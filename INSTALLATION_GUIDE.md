# Spark RAT Installation Guide

## Table of Contents
1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Backend Installation](#backend-installation)
4. [Frontend Installation](#frontend-installation)
5. [Client Installation](#client-installation)
6. [Database Setup](#database-setup)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Service Configuration](#service-configuration)
9. [Verification](#verification)
10. [Troubleshooting](#troubleshooting)

## Introduction

This guide provides step-by-step instructions for installing and configuring the Spark RAT system. The system consists of three main components:

- **Backend Server**: Go-based server handling all operations
- **Frontend Dashboard**: React-based web interface
- **Client Software**: Cross-platform client for target devices

### Installation Methods

1. **Docker Installation** (Recommended for production)
2. **Manual Installation** (For development and custom setups)
3. **Cloud Deployment** (Render for backend, Vercel for frontend)

## System Requirements

### Backend Server Requirements

#### Minimum Requirements
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 2 GB
- **Storage**: 10 GB free space
- **OS**: Linux (Ubuntu 20.04+), macOS (10.15+), Windows 10+
- **Network**: Internet connection for client communication

#### Recommended Requirements
- **CPU**: 4 cores, 3.0 GHz
- **RAM**: 8 GB
- **Storage**: 50 GB free space
- **OS**: Linux (Ubuntu 22.04 LTS)
- **Network**: High-speed internet connection

#### Software Dependencies
- **Go**: 1.21 or later
- **Docker**: 20.10 or later (for containerized deployment)
- **SSL Certificate**: Valid SSL certificate for HTTPS
- **Database**: PostgreSQL 13+ (optional, for advanced features)

### Frontend Requirements

#### Minimum Requirements
- **Node.js**: 18.0 or later
- **npm**: 8.0 or later
- **RAM**: 1 GB
- **Storage**: 2 GB free space

#### Recommended Requirements
- **Node.js**: 20.0 or later
- **npm**: 10.0 or later
- **RAM**: 4 GB
- **Storage**: 10 GB free space

### Client Requirements

#### Supported Operating Systems
- **Windows**: 7, 8, 10, 11 (x64, ARM64)
- **macOS**: 10.12+ (x64, ARM64)
- **Linux**: Ubuntu 18.04+, CentOS 7+, Debian 10+ (x64, ARM64)

#### Minimum Requirements
- **RAM**: 512 MB
- **Storage**: 100 MB free space
- **Network**: Internet connection

## Backend Installation

### Method 1: Docker Installation (Recommended)

#### Prerequisites
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Installation Steps
1. **Clone the repository**
```bash
git clone https://github.com/oranolio956/Cupid-.git
cd Cupid-/spark-setup/spark-backend
```

2. **Create environment file**
```bash
cat > .env << EOF
PORT=8000
GO_ENV=production
SPARK_SALT=your-salt-here
SPARK_ADMIN_HASH=your-bcrypt-hash-here
LOG_LEVEL=info
RATE_LIMIT_RPS=100
CORS_ORIGINS=https://spark-rat-dashboard.vercel.app
EOF
```

3. **Generate salt and admin hash**
```bash
# Generate salt
SALT=$(openssl rand -hex 32)
echo "SPARK_SALT=$SALT" >> .env

# Generate admin password hash
ADMIN_PASSWORD="admin123"
ADMIN_HASH=$(echo -n "$ADMIN_PASSWORD" | bcrypt-cli -c 12)
echo "SPARK_ADMIN_HASH=$ADMIN_HASH" >> .env
```

4. **Build and run with Docker**
```bash
# Build the image
docker build -t spark-rat-backend .

# Run the container
docker run -d \
  --name spark-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  spark-rat-backend
```

5. **Verify installation**
```bash
# Check container status
docker ps | grep spark-backend

# Check logs
docker logs spark-backend

# Test health endpoint
curl http://localhost:8000/api/health
```

### Method 2: Manual Installation

#### Prerequisites
```bash
# Install Go
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Verify Go installation
go version
```

#### Installation Steps
1. **Clone and build**
```bash
git clone https://github.com/oranolio956/Cupid-.git
cd Cupid-/spark-setup/spark-backend

# Download dependencies
go mod download
go mod tidy

# Build the application
go build -o spark-server main.go
```

2. **Create configuration**
```bash
cat > config.json << EOF
{
  "listen": ":8000",
  "environment": "production",
  "auth": {
    "admin": "\$bcrypt\$your-hash-here"
  },
  "security": {
    "rate_limit": {
      "enabled": true,
      "requests_per_minute": 100
    },
    "cors": {
      "enabled": true,
      "allowed_origins": ["https://spark-rat-dashboard.vercel.app"]
    }
  },
  "logging": {
    "level": "info",
    "file": "logs/spark.log"
  }
}
EOF
```

3. **Create systemd service**
```bash
sudo cat > /etc/systemd/system/spark-rat.service << EOF
[Unit]
Description=Spark RAT Backend Server
After=network.target

[Service]
Type=simple
User=spark
Group=spark
WorkingDirectory=/opt/spark-rat
ExecStart=/opt/spark-rat/spark-server
Restart=always
RestartSec=5
Environment=PORT=8000
Environment=GO_ENV=production
Environment=SPARK_SALT=your-salt-here
Environment=SPARK_ADMIN_HASH=your-hash-here

[Install]
WantedBy=multi-user.target
EOF
```

4. **Create user and directories**
```bash
sudo useradd -r -s /bin/false spark
sudo mkdir -p /opt/spark-rat/logs
sudo cp spark-server /opt/spark-rat/
sudo cp config.json /opt/spark-rat/
sudo chown -R spark:spark /opt/spark-rat
```

5. **Start the service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable spark-rat
sudo systemctl start spark-rat
sudo systemctl status spark-rat
```

### Method 3: Cloud Deployment (Render)

#### Prerequisites
- Render account
- GitHub repository access
- SSL certificate (provided by Render)

#### Deployment Steps
1. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure service**
   - **Name**: `spark-backend-fixed-v2`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `spark-setup/spark-backend/Dockerfile`
   - **Docker Context**: `spark-setup/spark-backend/`

3. **Set environment variables**
```
PORT=8000
GO_ENV=production
SPARK_SALT=your-salt-here
SPARK_ADMIN_HASH=your-hash-here
LOG_LEVEL=info
RATE_LIMIT_RPS=100
CORS_ORIGINS=https://spark-rat-dashboard.vercel.app
```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL

## Frontend Installation

### Method 1: Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository access
- Node.js 18+ (for local development)

#### Deployment Steps
1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure project**
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `spark-setup/spark-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Set environment variables**
```
REACT_APP_API_URL=https://spark-backend-fixed-v2.onrender.com
REACT_APP_WS_URL=wss://spark-backend-fixed-v2.onrender.com
REACT_APP_NAME=Spark RAT Dashboard
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_HTTPS=true
REACT_APP_ENABLE_WEBSOCKETS=true
REACT_APP_ENABLE_TERMINAL=true
REACT_APP_ENABLE_DESKTOP=true
REACT_APP_ENABLE_FILE_MANAGER=true
REACT_APP_ENABLE_PROCESS_MANAGER=true
REACT_APP_ENABLE_SCREENSHOT=true
REACT_APP_ENABLE_SYSTEM_CONTROL=true
```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the deployment URL

### Method 2: Manual Installation

#### Prerequisites
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Installation Steps
1. **Clone and install**
```bash
git clone https://github.com/oranolio956/Cupid-.git
cd Cupid-/spark-setup/spark-frontend

# Install dependencies
npm install
```

2. **Configure environment**
```bash
cat > .env.local << EOF
REACT_APP_API_URL=https://spark-backend-fixed-v2.onrender.com
REACT_APP_WS_URL=wss://spark-backend-fixed-v2.onrender.com
REACT_APP_NAME=Spark RAT Dashboard
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_HTTPS=true
REACT_APP_ENABLE_WEBSOCKETS=true
REACT_APP_ENABLE_TERMINAL=true
REACT_APP_ENABLE_DESKTOP=true
REACT_APP_ENABLE_FILE_MANAGER=true
REACT_APP_ENABLE_PROCESS_MANAGER=true
REACT_APP_ENABLE_SCREENSHOT=true
REACT_APP_ENABLE_SYSTEM_CONTROL=true
EOF
```

3. **Build the application**
```bash
npm run build
```

4. **Serve the application**
```bash
# Install serve globally
npm install -g serve

# Serve the built application
serve -s dist -l 3000
```

## Client Installation

### Windows Installation

#### Method 1: Executable Installation
1. **Download the client**
   - Download `spark-client-windows-amd64.exe` for x64
   - Download `spark-client-windows-arm64.exe` for ARM64

2. **Run the installer**
```cmd
spark-client-windows-amd64.exe --install
```

3. **Configure the client**
```cmd
spark-client-windows-amd64.exe --config
```

#### Method 2: Manual Installation
1. **Download and extract**
   - Download the client archive
   - Extract to `C:\Program Files\Spark Client\`

2. **Create configuration**
```json
{
  "server": {
    "host": "spark-backend-fixed-v2.onrender.com",
    "port": 443,
    "secure": true
  },
  "client": {
    "name": "My Windows Device",
    "group": "Default",
    "auto_connect": true,
    "auto_start": true
  },
  "security": {
    "salt": "your-salt-here",
    "encryption": true
  }
}
```

3. **Create Windows service**
```cmd
sc create "Spark Client" binPath="C:\Program Files\Spark Client\spark-client.exe" start=auto
sc start "Spark Client"
```

### macOS Installation

#### Method 1: Package Installation
1. **Download the package**
   - Download `spark-client-darwin-amd64.pkg` for Intel Macs
   - Download `spark-client-darwin-arm64.pkg` for Apple Silicon

2. **Install the package**
```bash
sudo installer -pkg spark-client-darwin-amd64.pkg -target /
```

3. **Configure the client**
```bash
sudo /usr/local/bin/spark-client --config
```

#### Method 2: Manual Installation
1. **Download and install**
```bash
# Download the client
wget https://github.com/oranolio956/Cupid-/releases/latest/download/spark-client-darwin-amd64

# Make executable
chmod +x spark-client-darwin-amd64

# Move to system location
sudo mv spark-client-darwin-amd64 /usr/local/bin/spark-client
```

2. **Create launchd service**
```bash
sudo cat > /Library/LaunchDaemons/com.sparkrat.client.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.sparkrat.client</string>
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
EOF
```

3. **Load the service**
```bash
sudo launchctl load /Library/LaunchDaemons/com.sparkrat.client.plist
```

### Linux Installation

#### Method 1: Package Installation
1. **Download the package**
   - Download `spark-client-linux-amd64.deb` for Debian/Ubuntu
   - Download `spark-client-linux-amd64.rpm` for Red Hat/CentOS

2. **Install the package**
```bash
# Debian/Ubuntu
sudo dpkg -i spark-client-linux-amd64.deb

# Red Hat/CentOS
sudo rpm -i spark-client-linux-amd64.rpm
```

#### Method 2: Manual Installation
1. **Download and install**
```bash
# Download the client
wget https://github.com/oranolio956/Cupid-/releases/latest/download/spark-client-linux-amd64

# Make executable
chmod +x spark-client-linux-amd64

# Move to system location
sudo mv spark-client-linux-amd64 /usr/local/bin/spark-client
```

2. **Create systemd service**
```bash
sudo cat > /etc/systemd/system/spark-client.service << EOF
[Unit]
Description=Spark RAT Client
After=network.target

[Service]
Type=simple
User=spark-client
Group=spark-client
ExecStart=/usr/local/bin/spark-client
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

3. **Create user and start service**
```bash
sudo useradd -r -s /bin/false spark-client
sudo systemctl daemon-reload
sudo systemctl enable spark-client
sudo systemctl start spark-client
```

## Database Setup (Optional)

### PostgreSQL Installation

#### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE spark_rat;
CREATE USER spark_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE spark_rat TO spark_user;
\q
```

#### CentOS/RHEL
```bash
# Install PostgreSQL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE spark_rat;
CREATE USER spark_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE spark_rat TO spark_user;
\q
```

### Database Configuration
```bash
# Update backend configuration
cat >> config.json << EOF
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "spark_rat",
    "user": "spark_user",
    "password": "your_password",
    "ssl_mode": "disable"
  }
}
EOF
```

## SSL Certificate Setup

### Let's Encrypt (Recommended)

#### Install Certbot
```bash
# Ubuntu/Debian
sudo apt install certbot

# CentOS/RHEL
sudo yum install certbot
```

#### Obtain Certificate
```bash
# Stop web server
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com

# Start web server
sudo systemctl start nginx
```

#### Auto-renewal
```bash
# Add to crontab
sudo crontab -e

# Add this line
0 12 * * * /usr/bin/certbot renew --quiet
```

### Self-signed Certificate (Development)

#### Generate Certificate
```bash
# Create certificate directory
sudo mkdir -p /etc/ssl/spark-rat

# Generate private key
sudo openssl genrsa -out /etc/ssl/spark-rat/private.key 2048

# Generate certificate
sudo openssl req -new -x509 -key /etc/ssl/spark-rat/private.key -out /etc/ssl/spark-rat/certificate.crt -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"

# Set permissions
sudo chmod 600 /etc/ssl/spark-rat/private.key
sudo chmod 644 /etc/ssl/spark-rat/certificate.crt
```

## Service Configuration

### Nginx Configuration (Reverse Proxy)

#### Install Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### Configure Nginx
```bash
sudo cat > /etc/nginx/sites-available/spark-rat << EOF
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/spark-rat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Firewall Configuration

#### UFW (Ubuntu)
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

#### Firewalld (CentOS/RHEL)
```bash
# Start firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow services
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Reload firewall
sudo firewall-cmd --reload
```

## Verification

### Backend Verification
```bash
# Check service status
sudo systemctl status spark-rat

# Check logs
sudo journalctl -u spark-rat -f

# Test health endpoint
curl https://your-domain.com/api/health

# Test info endpoint
curl https://your-domain.com/api/info
```

### Frontend Verification
```bash
# Check if frontend is accessible
curl -I https://spark-rat-dashboard.vercel.app

# Test API connectivity
curl https://spark-rat-dashboard.vercel.app/api/health
```

### Client Verification
```bash
# Check client status
sudo systemctl status spark-client

# Check client logs
sudo journalctl -u spark-client -f

# Test client connectivity
spark-client --test-connection
```

### End-to-End Testing
```bash
# Test complete system
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test device listing
curl -X GET https://your-domain.com/api/devices \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check logs
sudo journalctl -u spark-rat -f

# Check configuration
spark-server --validate-config

# Check port availability
sudo netstat -tlnp | grep :8000
```

#### Frontend Build Fails
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Client Connection Issues
```bash
# Check client logs
sudo journalctl -u spark-client -f

# Test network connectivity
ping spark-backend-fixed-v2.onrender.com

# Check firewall
sudo ufw status
```

### Log Locations
- **Backend**: `/var/log/spark-rat.log` or `journalctl -u spark-rat`
- **Frontend**: Vercel logs in dashboard
- **Client**: `journalctl -u spark-client`
- **Nginx**: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`

### Support
- **Documentation**: https://docs.sparkrat.com
- **GitHub Issues**: https://github.com/oranolio956/Cupid-/issues
- **Email Support**: support@sparkrat.com
- **Community Forum**: https://community.sparkrat.com

---

**Last Updated**: October 2025
**Version**: 2.0.0
**Support**: support@sparkrat.com