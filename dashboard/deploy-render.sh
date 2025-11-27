#!/bin/bash

# Spark Backend Deployment Script for Render
# This script deploys the Spark backend to Render.com

set -e

echo "🚀 Starting Spark Backend Deployment to Render..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found. Please run this script from the project root."
    exit 1
fi

# Check if spark-setup directory exists
if [ ! -d "spark-setup/spark-backend" ]; then
    print_error "spark-setup/spark-backend directory not found."
    exit 1
fi

print_status "Verifying backend configuration..."

# Check if Dockerfile exists
if [ ! -f "spark-setup/spark-backend/Dockerfile" ]; then
    print_error "Dockerfile not found in spark-setup/spark-backend/"
    exit 1
fi

# Check if config.json exists
if [ ! -f "spark-setup/spark-backend/config.json" ]; then
    print_error "config.json not found in spark-setup/spark-backend/"
    exit 1
fi

print_success "Backend configuration verified"

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    print_warning "Render CLI not found. Installing..."
    
    # Download and install Render CLI
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        curl -fsSL https://cli.render.com/install-macos.sh | sh
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://cli.render.com/install-linux.sh | sh
    else
        print_error "Unsupported operating system. Please install Render CLI manually."
        exit 1
    fi
    
    # Add to PATH
    export PATH="$HOME/.render/bin:$PATH"
    
    if ! command -v render &> /dev/null; then
        print_error "Failed to install Render CLI. Please install manually."
        exit 1
    fi
    
    print_success "Render CLI installed successfully"
fi

print_status "Checking Render CLI authentication..."

# Check if user is logged in to Render
if ! render auth whoami &> /dev/null; then
    print_warning "Not logged in to Render. Please log in:"
    render auth login
fi

print_success "Render CLI authenticated"

print_status "Deploying to Render..."

# Deploy using render.yaml
if render services create --file render.yaml; then
    print_success "Backend deployed successfully to Render!"
    
    # Get the service URL
    SERVICE_URL=$(render services list --format json | jq -r '.[] | select(.name=="spark-backend-fixed-v2") | .serviceUrl')
    
    if [ -n "$SERVICE_URL" ]; then
        print_success "Service URL: $SERVICE_URL"
        
        # Test the health endpoint
        print_status "Testing health endpoint..."
        if curl -f -s "$SERVICE_URL/api/info" > /dev/null; then
            print_success "Health check passed!"
        else
            print_warning "Health check failed. Service may still be starting up."
        fi
        
        # Display environment variables that need to be set
        echo ""
        print_status "Environment variables configured in render.yaml:"
        echo "  - PORT: 8000"
        echo "  - GO_ENV: production"
        echo "  - SPARK_SALT: a2dac101827c8d47f00831f2d6c078b2"
        echo "  - SPARK_ADMIN_HASH: \$2b\$10\$RYCAuSMeNE1uh2/qka5PSeE6RFjynbpXu95HMStXmUHA8qaQNBFjG"
        
        echo ""
        print_success "Backend deployment complete!"
        print_status "Next steps:"
        echo "  1. Wait for the service to fully start (2-3 minutes)"
        echo "  2. Test the API endpoint: curl $SERVICE_URL/api/info"
        echo "  3. Deploy the frontend to Vercel"
        echo "  4. Update frontend configuration with the backend URL"
        
    else
        print_warning "Could not retrieve service URL. Check Render dashboard."
    fi
    
else
    print_error "Failed to deploy to Render. Check the error messages above."
    exit 1
fi

print_success "Deployment script completed!"