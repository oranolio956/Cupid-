// Backend Configuration for Spark Frontend
// This file centralizes all backend connection settings

const BACKEND_CONFIG = {
  // Production backend URL
  API_URL: process.env.REACT_APP_API_URL || 'https://spark-backend-fixed-v2.onrender.com',
  WS_URL: process.env.REACT_APP_WS_URL || 'wss://spark-backend-fixed-v2.onrender.com',
  
  // API endpoints
  ENDPOINTS: {
    DEVICE_LIST: '/api/device/list',
    DEVICE_SCREENSHOT: '/api/device/screenshot/get',
    DEVICE_ACTION: '/api/device',
    DEVICE_TERMINAL: '/api/device/terminal',
    DEVICE_DESKTOP: '/api/device/desktop',
    DEVICE_FILE: '/api/device/file',
    DEVICE_PROCESS: '/api/device/process',
    AUTH_LOGIN: '/api/auth/login',
    AUTH_LOGOUT: '/api/auth/logout',
    SERVER_INFO: '/api/info'
  },
  
  // WebSocket endpoints
  WS_ENDPOINTS: {
    TERMINAL: '/ws/terminal',
    DESKTOP: '/ws/desktop',
    FILE: '/ws/file',
    PROCESS: '/ws/process'
  },
  
  // Request configuration
  REQUEST_CONFIG: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
  },
  
  // WebSocket configuration
  WS_CONFIG: {
    RECONNECT_INTERVAL: 5000, // 5 seconds
    MAX_RECONNECT_ATTEMPTS: 10,
    HEARTBEAT_INTERVAL: 30000 // 30 seconds
  },
  
  // Feature flags
  FEATURES: {
    TERMINAL: process.env.REACT_APP_ENABLE_TERMINAL !== 'false',
    DESKTOP: process.env.REACT_APP_ENABLE_DESKTOP !== 'false',
    FILE_MANAGER: process.env.REACT_APP_ENABLE_FILE_MANAGER !== 'false',
    PROCESS_MANAGER: process.env.REACT_APP_ENABLE_PROCESS_MANAGER !== 'false',
    SCREENSHOT: process.env.REACT_APP_ENABLE_SCREENSHOT !== 'false',
    SYSTEM_CONTROL: process.env.REACT_APP_ENABLE_SYSTEM_CONTROL !== 'false'
  }
};

// Helper functions
export const getApiUrl = (endpoint) => {
  return BACKEND_CONFIG.API_URL + endpoint;
};

export const getWsUrl = (endpoint) => {
  return BACKEND_CONFIG.WS_URL + endpoint;
};

export const isFeatureEnabled = (feature) => {
  return BACKEND_CONFIG.FEATURES[feature] || false;
};

export const getRequestConfig = () => {
  return BACKEND_CONFIG.REQUEST_CONFIG;
};

export const getWsConfig = () => {
  return BACKEND_CONFIG.WS_CONFIG;
};

export default BACKEND_CONFIG;