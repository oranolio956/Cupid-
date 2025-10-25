import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const savedCredentials = localStorage.getItem('spark_credentials');
    if (savedCredentials) {
      try {
        const creds = JSON.parse(savedCredentials);
        setCredentials(creds);
        setIsAuthenticated(true);
        // Set axios auth for all requests
        axios.defaults.auth = creds;
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
        localStorage.removeItem('spark_credentials');
      }
    }
    setLoading(false);
  }, []);

  const login = async (password) => {
    try {
      const creds = {
        username: 'admin',
        password: password
      };
      
      // Test authentication
      const response = await axios.post('/api/device/list', {}, {
        auth: creds
      });
      
      if (response.data.code === 0) {
        setCredentials(creds);
        setIsAuthenticated(true);
        // Save credentials for future requests
        localStorage.setItem('spark_credentials', JSON.stringify(creds));
        // Set axios auth for all requests
        axios.defaults.auth = creds;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setCredentials(null);
    setIsAuthenticated(false);
    localStorage.removeItem('spark_credentials');
    delete axios.defaults.auth;
  };

  const value = {
    isAuthenticated,
    credentials,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};