#!/usr/bin/env python3
"""
Render Deployment Script for Spark Backend
This script automates the deployment process using the Render API
"""

import requests
import json
import time
import sys

# Configuration
API_KEY = "rnd_DCT3Kms5YDiMxMPswtOvaDXHl26K"
SERVICE_ID = "srv-d3u6cgripnbc738naa70"
BASE_URL = "https://api.render.com/v1"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def check_service_status():
    """Check the current status of the service"""
    try:
        response = requests.get(f"{BASE_URL}/services/{SERVICE_ID}", headers=HEADERS)
        if response.status_code == 200:
            service_data = response.json()
            print(f"✅ Service Status: {service_data.get('suspended', 'unknown')}")
            print(f"📊 Service Name: {service_data.get('name', 'unknown')}")
            print(f"🌐 Service URL: {service_data.get('url', 'unknown')}")
            return service_data
        else:
            print(f"❌ Error checking service status: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def set_environment_variables():
    """Set up environment variables for the service"""
    env_vars = [
        {"key": "SPARK_LISTEN", "value": ":8000"},
        {"key": "SPARK_SALT", "value": "render-salt-123456789012345678901234"},
        {"key": "SPARK_USERNAME", "value": "admin"},
        {"key": "SPARK_PASSWORD", "value": "render-admin-password-123"}
    ]
    
    try:
        response = requests.post(
            f"{BASE_URL}/services/{SERVICE_ID}/env-vars",
            headers=HEADERS,
            json={"envVars": env_vars}
        )
        
        if response.status_code == 200:
            print("✅ Environment variables set successfully")
            return True
        else:
            print(f"❌ Error setting environment variables: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def update_service_config():
    """Update service configuration"""
    config = {
        "name": "Spark-Backend-API",
        "rootDir": "spark-setup/spark-backend",
        "serviceDetails": {
            "envSpecificDetails": {
                "dockerfilePath": "./Dockerfile.render",
                "dockerContext": ".",
                "dockerCommand": ""
            },
            "healthCheckPath": "/api/health"
        }
    }
    
    try:
        response = requests.patch(
            f"{BASE_URL}/services/{SERVICE_ID}",
            headers=HEADERS,
            json=config
        )
        
        if response.status_code == 200:
            print("✅ Service configuration updated successfully")
            return True
        else:
            print(f"❌ Error updating service config: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def trigger_deployment():
    """Trigger a new deployment"""
    try:
        response = requests.post(
            f"{BASE_URL}/services/{SERVICE_ID}/deploys",
            headers=HEADERS,
            json={}
        )
        
        if response.status_code == 200:
            print("✅ Deployment triggered successfully")
            return True
        else:
            print(f"❌ Error triggering deployment: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_endpoints():
    """Test the deployed service endpoints"""
    service_data = check_service_status()
    if not service_data:
        return False
    
    service_url = service_data.get('url', '')
    if not service_url:
        print("❌ No service URL found")
        return False
    
    endpoints = [
        f"{service_url}/api/health",
        f"{service_url}/api/device/list"
    ]
    
    print(f"\n🧪 Testing endpoints...")
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, timeout=10)
            if response.status_code == 200:
                print(f"✅ {endpoint} - OK")
            else:
                print(f"⚠️  {endpoint} - Status: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")
    
    return True

def main():
    """Main deployment process"""
    print("🚀 Spark Backend Deployment Script")
    print("=" * 40)
    
    # Check current status
    print("\n1. Checking service status...")
    service_data = check_service_status()
    if not service_data:
        print("❌ Failed to get service status")
        sys.exit(1)
    
    # Update configuration
    print("\n2. Updating service configuration...")
    if not update_service_config():
        print("❌ Failed to update service configuration")
        sys.exit(1)
    
    # Set environment variables
    print("\n3. Setting environment variables...")
    if not set_environment_variables():
        print("❌ Failed to set environment variables")
        sys.exit(1)
    
    # Check if service is suspended
    if service_data.get('suspended') == 'suspended':
        print("\n⚠️  Service is currently suspended.")
        print("   Please unsuspend it from the Render dashboard:")
        print(f"   https://dashboard.render.com/web/{SERVICE_ID}")
        print("\n   Once unsuspended, run this script again to trigger deployment.")
        return
    
    # Trigger deployment
    print("\n4. Triggering deployment...")
    if not trigger_deployment():
        print("❌ Failed to trigger deployment")
        sys.exit(1)
    
    # Wait a bit for deployment to start
    print("\n5. Waiting for deployment to start...")
    time.sleep(10)
    
    # Test endpoints
    print("\n6. Testing endpoints...")
    test_endpoints()
    
    print("\n🎉 Deployment process completed!")
    print(f"🌐 Your service should be available at: {service_data.get('url', 'unknown')}")

if __name__ == "__main__":
    main()