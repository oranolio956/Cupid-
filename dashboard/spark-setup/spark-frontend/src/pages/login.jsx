import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './login.css';

function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const success = await login(values.password);
      
      if (success) {
        message.success('Login successful!');
        // Redirect to dashboard
        window.location.href = '/';
      } else {
        message.error('Invalid password. Please try again.');
      }
    } catch (error) {
      message.error('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <Card className="login-card">
        <div className="login-header">
          <h1>🔐 Spark Dashboard</h1>
          <p>Remote Administration & Monitoring</p>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Admin Password"
              autoFocus
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
        <div className="login-footer">
          <small>Powered by Spark RAT v1.0</small>
        </div>
      </Card>
    </div>
  );
}

export default Login;