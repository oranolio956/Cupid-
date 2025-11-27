import React from 'react';
import { Card, Progress, Button, Dropdown, Space, Tag } from 'antd';
import {
  DesktopOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  AppleOutlined,
  WindowsOutlined,
  AndroidOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import RealTimeStatus from '../RealTimeStatus/RealTimeStatus';
import './DeviceCard.css';

function DeviceCard({ device, onAction }) {
  // Safely access nested properties
  const cpuUsage = device?.cpu?.usage || 0;
  const ramUsage = device?.ram?.usage || 0;
  const diskUsage = device?.disk?.usage || 0;
  const hostname = device?.hostname || 'Unknown Device';
  const username = device?.username || 'N/A';
  const os = device?.os || 'Unknown';
  const arch = device?.arch || '';
  const latency = device?.latency || 0;
  const online = latency > 0 && latency < 5000; // Consider online if ping < 5s

  // Get OS icon
  const getOSIcon = (os) => {
    const osLower = os.toLowerCase();
    if (osLower.includes('windows')) return <WindowsOutlined />;
    if (osLower.includes('mac') || osLower.includes('darwin')) return <AppleOutlined />;
    if (osLower.includes('android')) return <AndroidOutlined />;
    return <GlobalOutlined />;
  };

  const moreActions = [
    { key: 'execute', label: 'Execute Command' },
    { key: 'desktop', label: 'Remote Desktop' },
    { key: 'screenshot', label: 'Take Screenshot' },
    { key: 'lock', label: 'Lock Screen' },
    { key: 'shutdown', label: 'Shutdown' },
  ];

  return (
    <Card className="device-card">
      {/* Header */}
      <div className="device-card-header">
        {getOSIcon(os)}
        <div className="device-card-title">
          <h3>{hostname}</h3>
          <span className="device-card-subtitle">{os} {arch && `(${arch})`}</span>
        </div>
        <div className="device-card-status">
          <RealTimeStatus device={device} />
        </div>
      </div>

      {/* Info Grid */}
      <div className="device-card-info">
        <div className="info-row">
          <UserOutlined /> 
          <span className="info-label">User:</span> 
          <strong>{username}</strong>
        </div>
        <div className="info-row">
          <ClockCircleOutlined /> 
          <span className="info-label">Latency:</span> 
          <strong className={latency > 100 ? 'latency-warning' : 'latency-good'}>
            {latency > 0 ? `${latency}ms` : 'N/A'}
          </strong>
        </div>
      </div>

      {/* Usage Bars */}
      <div className="device-card-usage">
        <div className="usage-item">
          <div className="usage-header">
            <span>CPU</span>
            <span className="usage-value">{cpuUsage.toFixed(1)}%</span>
          </div>
          <Progress 
            percent={cpuUsage} 
            showInfo={false} 
            strokeColor={cpuUsage > 80 ? '#ff4d4f' : '#52c41a'}
          />
        </div>
        <div className="usage-item">
          <div className="usage-header">
            <span>RAM</span>
            <span className="usage-value">{ramUsage.toFixed(1)}%</span>
          </div>
          <Progress 
            percent={ramUsage} 
            showInfo={false}
            strokeColor={ramUsage > 80 ? '#ff4d4f' : '#1890ff'}
          />
        </div>
        <div className="usage-item">
          <div className="usage-header">
            <span>Disk</span>
            <span className="usage-value">{diskUsage.toFixed(1)}%</span>
          </div>
          <Progress 
            percent={diskUsage} 
            showInfo={false}
            strokeColor={diskUsage > 80 ? '#ff4d4f' : '#faad14'}
          />
        </div>
      </div>

      {/* Network Stats */}
      <div className="device-card-network">
        <span>Network: {formatNetwork(device)}</span>
      </div>

      {/* Actions */}
      <Space className="device-card-actions" size="small">
        <Button 
          type="primary" 
          size="large" 
          block 
          onClick={() => onAction('terminal', device)}
          disabled={!online}
        >
          Terminal
        </Button>
        <Button 
          size="large" 
          block 
          onClick={() => onAction('explorer', device)}
          disabled={!online}
        >
          Explorer
        </Button>
        <Dropdown 
          menu={{ 
            items: moreActions, 
            onClick: (e) => onAction(e.key, device) 
          }}
          disabled={!online}
        >
          <Button size="large" icon={<MoreOutlined />}>More</Button>
        </Dropdown>
      </Space>
    </Card>
  );
}

function formatNetwork(device) {
  const sent = (device?.net_sent || 0) * 8 / 1024;
  const recv = (device?.net_recv || 0) * 8 / 1024;
  
  if (sent === 0 && recv === 0) return 'No activity';
  
  return `${format(sent)} ↑ / ${format(recv)} ↓`;

  function format(size) {
    if (size < 1) return '0 Kbps';
    let k = 1024, i = Math.floor(Math.log(size) / Math.log(k));
    let units = ['Kbps', 'Mbps', 'Gbps', 'Tbps'];
    return (size / Math.pow(k, i)).toFixed(1) + ' ' + units[i];
  }
}

export default DeviceCard;