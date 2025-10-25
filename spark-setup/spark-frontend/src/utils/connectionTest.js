// Connection Test Utility for Spark Frontend
// Tests backend connectivity and provides diagnostic information

import axios from 'axios';
import { getApiUrl, getWsUrl } from '../config/backend';

class ConnectionTester {
  constructor() {
    this.isConnected = false;
    this.lastError = null;
    this.connectionTime = null;
  }

  // Test HTTP API connection
  async testApiConnection() {
    try {
      const startTime = Date.now();
      const response = await axios.get(getApiUrl('/api/info'), {
        timeout: 10000
      });
      this.connectionTime = Date.now() - startTime;
      
      if (response.status === 200) {
        this.isConnected = true;
        this.lastError = null;
        return {
          success: true,
          responseTime: this.connectionTime,
          data: response.data
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.isConnected = false;
      this.lastError = error.message;
      return {
        success: false,
        error: error.message,
        details: this.getErrorDetails(error)
      };
    }
  }

  // Test WebSocket connection
  async testWsConnection() {
    return new Promise((resolve) => {
      const ws = new WebSocket(getWsUrl('/ws'));
      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          success: false,
          error: 'WebSocket connection timeout'
        });
      }, 10000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve({
          success: true,
          message: 'WebSocket connection successful'
        });
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          error: 'WebSocket connection failed',
          details: error
        });
      };
    });
  }

  // Get detailed error information
  getErrorDetails(error) {
    if (error.code === 'ECONNREFUSED') {
      return 'Connection refused - server may be down';
    } else if (error.code === 'ENOTFOUND') {
      return 'Server not found - check URL configuration';
    } else if (error.code === 'ETIMEDOUT') {
      return 'Connection timeout - server may be slow or unreachable';
    } else if (error.response) {
      return `Server responded with ${error.response.status}: ${error.response.statusText}`;
    } else {
      return error.message || 'Unknown connection error';
    }
  }

  // Run comprehensive connection test
  async runFullTest() {
    console.log('🔍 Testing backend connection...');
    
    const apiTest = await this.testApiConnection();
    const wsTest = await this.testWsConnection();
    
    const results = {
      api: apiTest,
      websocket: wsTest,
      overall: apiTest.success && wsTest.success,
      timestamp: new Date().toISOString()
    };

    if (results.overall) {
      console.log('✅ Backend connection successful');
    } else {
      console.error('❌ Backend connection failed:', results);
    }

    return results;
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      lastError: this.lastError,
      connectionTime: this.connectionTime
    };
  }
}

// Create singleton instance
const connectionTester = new ConnectionTester();

export default connectionTester;
export { ConnectionTester };