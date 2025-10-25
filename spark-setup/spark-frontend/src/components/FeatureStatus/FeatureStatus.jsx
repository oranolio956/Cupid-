import React from 'react';
import { Card, Row, Col, Tag, Tooltip, Badge } from 'antd';
import {
  TerminalOutlined,
  DesktopOutlined,
  FileTextOutlined,
  SettingOutlined,
  CameraOutlined,
  PoweroffOutlined,
  LockOutlined,
  UserOutlined,
  GlobalOutlined,
  WifiOutlined
} from '@ant-design/icons';
import { isFeatureEnabled } from '../../config/backend';

const FeatureStatus = ({ device, compact = false }) => {
  const features = [
    {
      key: 'terminal',
      name: 'Terminal',
      icon: <TerminalOutlined />,
      enabled: isFeatureEnabled('TERMINAL'),
      description: 'Remote command execution and terminal access'
    },
    {
      key: 'desktop',
      name: 'Desktop',
      icon: <DesktopOutlined />,
      enabled: isFeatureEnabled('DESKTOP'),
      description: 'Real-time desktop streaming and control'
    },
    {
      key: 'file',
      name: 'File Manager',
      icon: <FileTextOutlined />,
      enabled: isFeatureEnabled('FILE_MANAGER'),
      description: 'File upload, download, and management'
    },
    {
      key: 'process',
      name: 'Process Manager',
      icon: <SettingOutlined />,
      enabled: isFeatureEnabled('PROCESS_MANAGER'),
      description: 'Process monitoring and control'
    },
    {
      key: 'screenshot',
      name: 'Screenshot',
      icon: <CameraOutlined />,
      enabled: isFeatureEnabled('SCREENSHOT'),
      description: 'Screen capture and image viewing'
    },
    {
      key: 'system',
      name: 'System Control',
      icon: <PoweroffOutlined />,
      enabled: isFeatureEnabled('SYSTEM_CONTROL'),
      description: 'Lock, restart, shutdown, and system control'
    }
  ];

  const systemInfo = [
    {
      key: 'os',
      name: 'Operating System',
      icon: <GlobalOutlined />,
      value: device?.os || 'Unknown'
    },
    {
      key: 'arch',
      name: 'Architecture',
      icon: <SettingOutlined />,
      value: device?.arch || 'Unknown'
    },
    {
      key: 'user',
      name: 'User',
      icon: <UserOutlined />,
      value: device?.username || 'Unknown'
    },
    {
      key: 'connection',
      name: 'Connection',
      icon: <WifiOutlined />,
      value: device?.latency ? `${device.latency}ms` : 'Offline',
      status: device?.latency && device.latency < 5000 ? 'success' : 'error'
    }
  ];

  if (compact) {
    return (
      <div className="feature-status-compact">
        {features.map(feature => (
          <Tooltip key={feature.key} title={feature.description}>
            <Tag
              icon={feature.icon}
              color={feature.enabled ? 'green' : 'red'}
              style={{ margin: '2px' }}
            >
              {feature.name}
            </Tag>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <Card title="RAT Capabilities" size="small" className="feature-status-card">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <h4>Available Features</h4>
          <div className="feature-grid">
            {features.map(feature => (
              <div key={feature.key} className="feature-item">
                <Tooltip title={feature.description}>
                  <Badge
                    status={feature.enabled ? 'success' : 'error'}
                    text={
                      <span>
                        {feature.icon} {feature.name}
                      </span>
                    }
                  />
                </Tooltip>
              </div>
            ))}
          </div>
        </Col>
        
        <Col span={24}>
          <h4>System Information</h4>
          <div className="system-info">
            {systemInfo.map(info => (
              <div key={info.key} className="info-item">
                <span className="info-icon">{info.icon}</span>
                <span className="info-label">{info.name}:</span>
                <Tag color={info.status || 'default'} className="info-value">
                  {info.value}
                </Tag>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default FeatureStatus;