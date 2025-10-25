import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, Button, Space, Typography } from 'antd';
import { WifiOutlined, DisconnectOutlined, ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useWebSocket } from '../../hooks/useWebSocket';

const { Text } = Typography;

const RealTimeStatus = ({ device, onReconnect }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastPing, setLastPing] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // WebSocket connection for real-time status
  const { 
    isConnected, 
    error, 
    reconnectAttempts: wsReconnectAttempts,
    reconnect: wsReconnect 
  } = useWebSocket(
    `/api/device/status?device=${device.id}`,
    {
      onmessage: (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ping') {
            setLastPing(Date.now());
          } else if (data.type === 'status') {
            setConnectionStatus(data.status);
          }
        } catch (err) {
          console.error('Error parsing status message:', err);
        }
      },
      onopen: () => {
        setConnectionStatus('connected');
        setReconnectAttempts(0);
      },
      onclose: () => {
        setConnectionStatus('disconnected');
      },
      onerror: () => {
        setConnectionStatus('error');
      }
    }
  );

  useEffect(() => {
    setReconnectAttempts(wsReconnectAttempts);
  }, [wsReconnectAttempts]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'processing';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <WifiOutlined />;
      case 'connecting':
        return <ReloadOutlined spin />;
      case 'error':
        return <ExclamationCircleOutlined />;
      default:
        return <DisconnectOutlined />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  const handleReconnect = () => {
    if (wsReconnect) {
      wsReconnect();
    }
    if (onReconnect) {
      onReconnect();
    }
  };

  const formatLastPing = () => {
    if (!lastPing) return 'Never';
    const now = Date.now();
    const diff = now - lastPing;
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    return `${Math.floor(diff / 60000)}m ago`;
  };

  return (
    <div className="real-time-status">
      <Space>
        <Badge 
          status={getStatusColor()} 
          text={
            <Space>
              {getStatusIcon()}
              <Text strong>{getStatusText()}</Text>
            </Space>
          }
        />
        
        {lastPing && (
          <Tooltip title="Last ping received">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatLastPing()}
            </Text>
          </Tooltip>
        )}
        
        {reconnectAttempts > 0 && (
          <Tooltip title="Reconnection attempts">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ({reconnectAttempts} attempts)
            </Text>
          </Tooltip>
        )}
        
        {connectionStatus !== 'connected' && (
          <Button 
            size="small" 
            icon={<ReloadOutlined />}
            onClick={handleReconnect}
            loading={connectionStatus === 'connecting'}
          >
            Reconnect
          </Button>
        )}
      </Space>
      
      {error && (
        <div style={{ marginTop: 8 }}>
          <Text type="danger" style={{ fontSize: '12px' }}>
            Error: {error.message || 'Connection failed'}
          </Text>
        </div>
      )}
    </div>
  );
};

export default RealTimeStatus;