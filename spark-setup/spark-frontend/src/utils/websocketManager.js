// WebSocket Manager for Spark Frontend
// Centralized WebSocket connection management with reconnection logic

import { getWsUrl, getWsConfig } from '../config/backend';

class WebSocketManager {
  constructor() {
    this.connections = new Map();
    this.reconnectAttempts = new Map();
    this.heartbeatIntervals = new Map();
    this.config = getWsConfig();
  }

  // Create a new WebSocket connection
  createConnection(key, endpoint, options = {}) {
    const url = getWsUrl(endpoint);
    const ws = new WebSocket(url);
    
    // Store connection info
    this.connections.set(key, {
      ws,
      endpoint,
      url,
      options,
      connected: false,
      lastError: null
    });

    // Set up event handlers
    this.setupEventHandlers(key, ws, options);

    return ws;
  }

  // Set up WebSocket event handlers
  setupEventHandlers(key, ws, options = {}) {
    const connection = this.connections.get(key);
    if (!connection) return;

    ws.onopen = (event) => {
      connection.connected = true;
      connection.lastError = null;
      this.reconnectAttempts.set(key, 0);
      
      // Start heartbeat if enabled
      if (options.heartbeat !== false) {
        this.startHeartbeat(key);
      }

      // Call user onopen handler
      if (options.onopen) {
        options.onopen(event);
      }
    };

    ws.onmessage = (event) => {
      // Call user onmessage handler
      if (options.onmessage) {
        options.onmessage(event);
      }
    };

    ws.onclose = (event) => {
      connection.connected = false;
      this.stopHeartbeat(key);

      // Call user onclose handler
      if (options.onclose) {
        options.onclose(event);
      }

      // Attempt reconnection if not manually closed
      if (event.code !== 1000 && options.reconnect !== false) {
        this.attemptReconnection(key);
      }
    };

    ws.onerror = (event) => {
      connection.lastError = event;
      
      // Call user onerror handler
      if (options.onerror) {
        options.onerror(event);
      }
    };
  }

  // Attempt to reconnect a WebSocket
  attemptReconnection(key) {
    const connection = this.connections.get(key);
    if (!connection) return;

    const attempts = this.reconnectAttempts.get(key) || 0;
    const maxAttempts = connection.options.maxReconnectAttempts || this.config.MAX_RECONNECT_ATTEMPTS;

    if (attempts >= maxAttempts) {
      console.error(`WebSocket ${key}: Max reconnection attempts reached`);
      if (connection.options.onMaxReconnectAttempts) {
        connection.options.onMaxReconnectAttempts();
      }
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, attempts), 30000); // Exponential backoff, max 30s
    // Reconnection attempt (logging removed for production)

    setTimeout(() => {
      this.reconnectAttempts.set(key, attempts + 1);
      this.createConnection(key, connection.endpoint, connection.options);
    }, delay);
  }

  // Start heartbeat for a connection
  startHeartbeat(key) {
    const connection = this.connections.get(key);
    if (!connection) return;

    const interval = setInterval(() => {
      if (connection.connected && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.config.HEARTBEAT_INTERVAL);

    this.heartbeatIntervals.set(key, interval);
  }

  // Stop heartbeat for a connection
  stopHeartbeat(key) {
    const interval = this.heartbeatIntervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(key);
    }
  }

  // Send data through a WebSocket
  send(key, data) {
    const connection = this.connections.get(key);
    if (!connection || !connection.connected) {
      console.error(`WebSocket ${key}: Cannot send data, connection not available`);
      return false;
    }

    try {
      if (typeof data === 'string') {
        connection.ws.send(data);
      } else {
        connection.ws.send(JSON.stringify(data));
      }
      return true;
    } catch (error) {
      console.error(`WebSocket ${key}: Error sending data:`, error);
      return false;
    }
  }

  // Close a WebSocket connection
  close(key, code = 1000, reason = 'Normal closure') {
    const connection = this.connections.get(key);
    if (!connection) return;

    this.stopHeartbeat(key);
    connection.connected = false;
    
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.close(code, reason);
    }
  }

  // Close all WebSocket connections
  closeAll() {
    for (const key of this.connections.keys()) {
      this.close(key);
    }
  }

  // Get connection status
  getStatus(key) {
    const connection = this.connections.get(key);
    if (!connection) return null;

    return {
      connected: connection.connected,
      readyState: connection.ws.readyState,
      lastError: connection.lastError,
      reconnectAttempts: this.reconnectAttempts.get(key) || 0
    };
  }

  // Get all connection statuses
  getAllStatuses() {
    const statuses = {};
    for (const key of this.connections.keys()) {
      statuses[key] = this.getStatus(key);
    }
    return statuses;
  }

  // Remove a connection from the manager
  remove(key) {
    this.close(key);
    this.connections.delete(key);
    this.reconnectAttempts.delete(key);
    this.stopHeartbeat(key);
  }

  // Clean up all connections
  destroy() {
    this.closeAll();
    this.connections.clear();
    this.reconnectAttempts.clear();
    this.heartbeatIntervals.clear();
  }
}

// Create singleton instance
const wsManager = new WebSocketManager();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  wsManager.destroy();
});

export default wsManager;
export { WebSocketManager };