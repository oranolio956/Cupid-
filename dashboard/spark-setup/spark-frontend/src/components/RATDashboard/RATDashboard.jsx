import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Button, Space, Tooltip } from 'antd';
import {
  DesktopOutlined,
  CodeOutlined,
  FileTextOutlined,
  SettingOutlined,
  CameraOutlined,
  PoweroffOutlined,
  WifiOutlined,
  GlobalOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { isFeatureEnabled } from '../../config/backend';

const RATDashboard = ({ devices = [] }) => {
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    avgLatency: 0,
    totalCpuUsage: 0,
    totalRamUsage: 0
  });

  useEffect(() => {
    if (devices.length > 0) {
      const online = devices.filter(d => d.latency && d.latency < 5000);
      const offline = devices.filter(d => !d.latency || d.latency >= 5000);
      const avgLatency = online.length > 0 
        ? online.reduce((sum, d) => sum + d.latency, 0) / online.length 
        : 0;
      const totalCpu = devices.reduce((sum, d) => sum + (d.cpu?.usage || 0), 0);
      const totalRam = devices.reduce((sum, d) => sum + (d.ram?.usage || 0), 0);

      setStats({
        totalDevices: devices.length,
        onlineDevices: online.length,
        offlineDevices: offline.length,
        avgLatency: Math.round(avgLatency),
        totalCpuUsage: Math.round(totalCpu / devices.length),
        totalRamUsage: Math.round(totalRam / devices.length)
      });
    }
  }, [devices]);

  const features = [
    {
      key: 'terminal',
      name: 'Terminal Access',
      icon: <CodeOutlined />,
      enabled: isFeatureEnabled('TERMINAL'),
      description: 'Execute commands remotely on target devices',
      color: '#52c41a'
    },
    {
      key: 'desktop',
      name: 'Desktop Control',
      icon: <DesktopOutlined />,
      enabled: isFeatureEnabled('DESKTOP'),
      description: 'View and control desktop in real-time',
      color: '#1890ff'
    },
    {
      key: 'file',
      name: 'File Management',
      icon: <FileTextOutlined />,
      enabled: isFeatureEnabled('FILE_MANAGER'),
      description: 'Upload, download, and manage files',
      color: '#722ed1'
    },
    {
      key: 'process',
      name: 'Process Control',
      icon: <SettingOutlined />,
      enabled: isFeatureEnabled('PROCESS_MANAGER'),
      description: 'Monitor and control running processes',
      color: '#fa8c16'
    },
    {
      key: 'screenshot',
      name: 'Screenshot',
      icon: <CameraOutlined />,
      enabled: isFeatureEnabled('SCREENSHOT'),
      description: 'Capture screenshots of target devices',
      color: '#eb2f96'
    },
    {
      key: 'system',
      name: 'System Control',
      icon: <PoweroffOutlined />,
      enabled: isFeatureEnabled('SYSTEM_CONTROL'),
      description: 'Lock, restart, shutdown devices',
      color: '#f5222d'
    }
  ];

  const osDistribution = devices.reduce((acc, device) => {
    const os = device.os || 'Unknown';
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="rat-dashboard">
      {/* Statistics Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Devices"
              value={stats.totalDevices}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Online Devices"
              value={stats.onlineDevices}
              valueStyle={{ color: '#3f8600' }}
              prefix={<WifiOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Offline Devices"
              value={stats.offlineDevices}
              valueStyle={{ color: '#cf1322' }}
              prefix={<PoweroffOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Latency"
              value={stats.avgLatency}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* System Performance */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card title="Average CPU Usage">
            <Progress
              percent={stats.totalCpuUsage}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Average RAM Usage">
            <Progress
              percent={stats.totalRamUsage}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* RAT Capabilities */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="RAT Capabilities" extra={<Tag color="blue">Advanced Features</Tag>}>
            <Row gutter={[16, 16]}>
              {features.map(feature => (
                <Col xs={24} sm={12} md={8} lg={6} key={feature.key}>
                  <Card
                    size="small"
                    className={`feature-card ${feature.enabled ? 'enabled' : 'disabled'}`}
                  >
                    <div className="feature-content">
                      <div className="feature-icon" style={{ color: feature.color }}>
                        {feature.icon}
                      </div>
                      <div className="feature-info">
                        <h4>{feature.name}</h4>
                        <p>{feature.description}</p>
                        <Tag color={feature.enabled ? 'green' : 'red'}>
                          {feature.enabled ? 'Enabled' : 'Disabled'}
                        </Tag>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* OS Distribution */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Operating System Distribution">
            <Space wrap>
              {Object.entries(osDistribution).map(([os, count]) => (
                <Tooltip key={os} title={`${count} device(s)`}>
                  <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {os}: {count}
                  </Tag>
                </Tooltip>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RATDashboard;