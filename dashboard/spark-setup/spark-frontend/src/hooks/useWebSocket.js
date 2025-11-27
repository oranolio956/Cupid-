// React Hook for WebSocket Management
// Provides easy WebSocket integration for React components

import { useEffect, useRef, useState, useCallback } from 'react';
import wsManager from '../utils/websocketManager';

export const useWebSocket = (endpoint, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const connectionKey = useRef(`ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messageHandlers = useRef(new Set());

  // Enhanced options with default handlers
  const enhancedOptions = {
    onopen: (event) => {
      setIsConnected(true);
      setError(null);
      setReconnectAttempts(0);
      if (options.onopen) options.onopen(event);
    },
    onclose: (event) => {
      setIsConnected(false);
      if (options.onclose) options.onclose(event);
    },
    onmessage: (event) => {
      setLastMessage(event);
      if (options.onmessage) options.onmessage(event);
      
      // Call all registered message handlers
      messageHandlers.current.forEach(handler => {
        try {
          handler(event);
        } catch (err) {
          console.error('Error in message handler:', err);
        }
      });
    },
    onerror: (event) => {
      setError(event);
      if (options.onerror) options.onerror(event);
    },
    onMaxReconnectAttempts: () => {
      setError(new Error('Max reconnection attempts reached'));
      if (options.onMaxReconnectAttempts) options.onMaxReconnectAttempts();
    },
    ...options
  };

  // Create connection
  const connect = useCallback(() => {
    try {
      wsManager.createConnection(connectionKey.current, endpoint, enhancedOptions);
    } catch (err) {
      setError(err);
    }
  }, [endpoint, enhancedOptions]);

  // Send message
  const sendMessage = useCallback((data) => {
    return wsManager.send(connectionKey.current, data);
  }, []);

  // Send JSON message
  const sendJson = useCallback((data) => {
    return wsManager.send(connectionKey.current, JSON.stringify(data));
  }, []);

  // Add message handler
  const addMessageHandler = useCallback((handler) => {
    messageHandlers.current.add(handler);
    return () => messageHandlers.current.delete(handler);
  }, []);

  // Remove message handler
  const removeMessageHandler = useCallback((handler) => {
    messageHandlers.current.delete(handler);
  }, []);

  // Close connection
  const close = useCallback((code, reason) => {
    wsManager.close(connectionKey.current, code, reason);
  }, []);

  // Reconnect manually
  const reconnect = useCallback(() => {
    close();
    setTimeout(connect, 1000);
  }, [close, connect]);

  // Get connection status
  const getStatus = useCallback(() => {
    return wsManager.getStatus(connectionKey.current);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      wsManager.remove(connectionKey.current);
    };
  }, [connect]);

  // Update reconnect attempts
  useEffect(() => {
    const interval = setInterval(() => {
      const status = wsManager.getStatus(connectionKey.current);
      if (status) {
        setReconnectAttempts(status.reconnectAttempts);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    lastMessage,
    error,
    reconnectAttempts,
    sendMessage,
    sendJson,
    addMessageHandler,
    removeMessageHandler,
    close,
    reconnect,
    getStatus
  };
};

export default useWebSocket;