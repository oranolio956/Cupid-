import React, { useState } from 'react';
import { Card, Button, Input, message, Space, Typography, Divider, Alert } from 'antd';
import { CopyOutlined, DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getBaseURL } from '../../utils/utils';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const QuickDeploy = () => {
  const [copiedCommand, setCopiedCommand] = useState('');

  const deploymentCommands = {
    windows: {
      title: 'Windows Deployment',
      description: 'Run this command in PowerShell as Administrator',
      command: `# Download and run installer
Invoke-WebRequest -Uri "${getBaseURL(false, '/install-windows.ps1')}" -OutFile "install.ps1"
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\\install.ps1`,
      downloadUrl: getBaseURL(false, '/install-windows.ps1'),
      downloadText: 'Download PowerShell Script'
    },
    linux: {
      title: 'Linux Deployment',
      description: 'Run this command in terminal with sudo privileges',
      command: `curl -sSL ${getBaseURL(false, '/install-linux.sh')} | sudo bash`,
      downloadUrl: getBaseURL(false, '/install-linux.sh'),
      downloadText: 'Download Shell Script'
    },
    macos: {
      title: 'macOS Deployment',
      description: 'Run this command in terminal with sudo privileges',
      command: `curl -sSL ${getBaseURL(false, '/install-linux.sh')} | sudo bash`,
      downloadUrl: getBaseURL(false, '/install-linux.sh'),
      downloadText: 'Download Shell Script'
    }
  };

  const copyToClipboard = (text, platform) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(`${platform} command copied to clipboard`);
      setCopiedCommand(platform);
      setTimeout(() => setCopiedCommand(''), 2000);
    }).catch(() => {
      message.error('Failed to copy to clipboard');
    });
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Download started');
  };

  return (
    <div className="quick-deploy">
      <Alert
        message="Quick Deployment Guide"
        description="Use these commands to quickly deploy Spark clients on target systems. The clients will automatically connect to the configured server."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <div className="deployment-commands">
        {Object.entries(deploymentCommands).map(([key, config]) => (
          <Card
            key={key}
            title={config.title}
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => downloadFile(config.downloadUrl, `${key}-installer`)}
                >
                  {config.downloadText}
                </Button>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(config.command, config.title)}
                  className={copiedCommand === key ? 'copied' : ''}
                >
                  {copiedCommand === key ? 'Copied!' : 'Copy'}
                </Button>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Paragraph>
              <Text type="secondary">{config.description}</Text>
            </Paragraph>
            
            <TextArea
              value={config.command}
              readOnly
              rows={4}
              style={{ 
                fontFamily: 'monospace',
                fontSize: '12px',
                marginBottom: 16
              }}
            />

            <Divider />
            
            <div className="deployment-info">
              <Space direction="vertical" size="small">
                <div>
                  <Text strong>Server URL: </Text>
                  <Text code>{getBaseURL(false, '')}</Text>
                </div>
                <div>
                  <Text strong>WebSocket URL: </Text>
                  <Text code>{getBaseURL(true, '')}</Text>
                </div>
                <div>
                  <Text strong>Features: </Text>
                  <Text>Terminal, Desktop, File Manager, Process Control, Screenshot, System Control</Text>
                </div>
              </Space>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Manual Installation" style={{ marginTop: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>1. Download Client Binary</Title>
            <Paragraph>
              Download the appropriate client binary for your target system from the Client Manager.
            </Paragraph>
          </div>
          
          <div>
            <Title level={4}>2. Configure Client</Title>
            <Paragraph>
              The client is pre-configured to connect to the current server. No additional configuration is required.
            </Paragraph>
          </div>
          
          <div>
            <Title level={4}>3. Run Client</Title>
            <Paragraph>
              Execute the client binary on the target system. It will automatically connect to the server and appear in the dashboard.
            </Paragraph>
          </div>
          
          <div>
            <Title level={4}>4. Verify Connection</Title>
            <Paragraph>
              Check the dashboard to confirm the device appears in the device list with an "Online" status.
            </Paragraph>
          </div>
        </Space>
      </Card>

      <Card title="Troubleshooting" style={{ marginTop: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Title level={5}>Client Not Appearing in Dashboard</Title>
            <ul>
              <li>Check if the client is running on the target system</li>
              <li>Verify network connectivity to the server</li>
              <li>Check firewall settings (port 443 should be open)</li>
              <li>Review client logs for error messages</li>
            </ul>
          </div>
          
          <div>
            <Title level={5}>Connection Issues</Title>
            <ul>
              <li>Ensure the server URL is correct and accessible</li>
              <li>Check if the server is running and healthy</li>
              <li>Verify SSL/TLS certificate validity</li>
              <li>Test with a simple ping to the server</li>
            </ul>
          </div>
          
          <div>
            <Title level={5}>Permission Errors</Title>
            <ul>
              <li>Run installation scripts as Administrator (Windows) or with sudo (Linux/macOS)</li>
              <li>Check file permissions on the client binary</li>
              <li>Ensure the client has necessary system permissions</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default QuickDeploy;