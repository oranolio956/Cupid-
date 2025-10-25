#!/bin/bash

# Spark Frontend Deployment Script for Vercel
# This script deploys the Spark frontend to Vercel

set -e

echo "🚀 Starting Spark Frontend Deployment to Vercel..."

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
if [ ! -f "spark-setup/spark-frontend/package.json" ]; then
    print_error "Frontend package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    
    # Install Vercel CLI
    npm install -g vercel
    
    if ! command -v vercel &> /dev/null; then
        print_error "Failed to install Vercel CLI. Please install manually: npm install -g vercel"
        exit 1
    fi
    
    print_success "Vercel CLI installed successfully"
fi

print_status "Checking Vercel CLI authentication..."

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please log in:"
    vercel login
fi

print_success "Vercel CLI authenticated"

# Navigate to frontend directory
cd spark-setup/spark-frontend

print_status "Installing dependencies..."

# Install dependencies
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

print_status "Building frontend for production..."

# Build the frontend
if npm run build; then
    print_success "Frontend built successfully"
else
    print_error "Failed to build frontend"
    exit 1
fi

print_status "Deploying to Vercel..."

# Deploy to Vercel
if vercel --prod; then
    print_success "Frontend deployed successfully to Vercel!"
    
    # Get the deployment URL
    DEPLOYMENT_URL=$(vercel ls | grep "spark-rat-dashboard" | head -1 | awk '{print $2}' || echo "")
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        print_success "Deployment URL: https://$DEPLOYMENT_URL"
        
        # Test the deployment
        print_status "Testing deployment..."
        if curl -f -s "https://$DEPLOYMENT_URL" > /dev/null; then
            print_success "Deployment test passed!"
        else
            print_warning "Deployment test failed. Service may still be starting up."
        fi
        
        echo ""
        print_success "Frontend deployment complete!"
        print_status "Next steps:"
        echo "  1. Test the frontend at: https://$DEPLOYMENT_URL"
        echo "  2. Verify backend connection"
        echo "  3. Test client generation and deployment"
        echo "  4. Configure production environment variables if needed"
        
    else
        print_warning "Could not retrieve deployment URL. Check Vercel dashboard."
    fi
    
else
    print_error "Failed to deploy to Vercel. Check the error messages above."
    exit 1
fi

print_success "Deployment script completed!"