import React from 'react';
import { Card, Progress, Button, Dropdown, Space, Tag } from 'antd';
import { 
  DesktopOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  MoreOutlined 
} from '@ant-design/icons';
import './DeviceCard.css';

function DeviceCard({ device, onAction }) {
  const moreActions = [
    { key: 'execute', label: 'Execute' },
    { key: 'desktop', label: 'Desktop' },
    { key: 'screenshot', label: 'Screenshot' },
    { key: 'lock', label: 'Lock' },
    { key: 'shutdown', label: 'Shutdown' },
  ];

  return (
    <Card className="device-card">
      {/* Header */}
      <div className="device-card-header">
        <DesktopOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
        <h3>{device.hostname}</h3>
        <Tag color={device.online ? 'success' : 'default'}>
          {device.online ? 'Online' : 'Offline'}
        </Tag>
      </div>

      {/* Info Grid */}
      <div className="device-card-info">
        <div className="info-row">
          <UserOutlined /> <span>User:</span> <strong>{device.username}</strong>
        </div>
        <div className="info-row">
          <span>OS:</span> <strong>{device.os} ({device.arch})</strong>
        </div>
        <div className="info-row">
          <ClockCircleOutlined /> <span>Ping:</span> <strong>{device.latency}ms</strong>
        </div>
      </div>

      {/* Usage Bars */}
      <div className="device-card-usage">
        <div className="usage-item">
          <span>CPU</span>
          <Progress percent={device.cpu?.usage || 0} size="small" />
        </div>
        <div className="usage-item">
          <span>RAM</span>
          <Progress percent={device.ram?.usage || 0} size="small" />
        </div>
        <div className="usage-item">
          <span>Disk</span>
          <Progress percent={device.disk?.usage || 0} size="small" />
        </div>
      </div>

      {/* Network Stats */}
      <div className="device-card-network">
        <span>Network: {formatNetwork(device)}</span>
      </div>

      {/* Actions */}
      <Space className="device-card-actions" size="small">
        <Button type="primary" size="large" block onClick={() => onAction('terminal', device)}>
          Terminal
        </Button>
        <Button size="large" block onClick={() => onAction('explorer', device)}>
          Explorer
        </Button>
        <Dropdown menu={{ items: moreActions, onClick: (e) => onAction(e.key, device) }}>
          <Button size="large" icon={<MoreOutlined />}>More</Button>
        </Dropdown>
      </Space>
    </Card>
  );
}

function formatNetwork(device) {
  let sent = device.net_sent * 8 / 1024;
  let recv = device.net_recv * 8 / 1024;
  return `${format(sent)} ↑ / ${format(recv)} ↓`;
  
  function format(size) {
    if (size <= 1) return '0 Kbps';
    let k = 1024, i = Math.floor(Math.log(size) / Math.log(k));
    let units = ['Kbps', 'Mbps', 'Gbps', 'Tbps'];
    return (size / Math.pow(k, i)).toFixed(1) + ' ' + units[i];
  }
}

export default DeviceCard;