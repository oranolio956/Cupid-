import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import './login.css';

function Login() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', {
        username: 'admin',  // Spark uses fixed 'admin' username
        password: values.password
      });
      
      if (response.data.code === 0) {
        message.success('Login successful!');
        // Redirect to dashboard
        window.location.href = '/';
      } else {
        message.error(response.data.msg || 'Login failed');
      }
    } catch (error) {
      message.error('Login failed. Check your password.');
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