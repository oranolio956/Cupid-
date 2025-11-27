import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm,
  Tabs,
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
  Alert
} from 'antd';
import {
  DownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  CloudDownloadOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { request, getBaseURL } from '../../utils/utils';
import { isFeatureEnabled } from '../../config/backend';
import QuickDeploy from '../QuickDeploy/QuickDeploy';

const { TabPane } = Tabs;
const { Option } = Select;

const ClientManager = ({ visible, onClose }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [generateForm] = Form.useForm();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    platforms: {}
  });

  // Load clients data
  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await request('/api/clients/list');
      if (response.data.code === 0) {
        setClients(response.data.data || []);
        updateStats(response.data.data || []);
      }
    } catch (error) {
      message.error('Failed to load clients');
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = (clientsData) => {
    const total = clientsData.length;
    const active = clientsData.filter(c => c.status === 'active').length;
    const platforms = clientsData.reduce((acc, client) => {
      const platform = client.platform || 'unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});

    setStats({ totalClients: total, activeClients: active, platforms });
  };

  // Generate new client
  const handleGenerate = async (values) => {
    try {
      const response = await request('/api/clients/generate', values);
      if (response.data.code === 0) {
        message.success('Client generated successfully');
        setGenerateModalVisible(false);
        generateForm.resetFields();
        loadClients();
      } else {
        message.error(response.data.msg || 'Failed to generate client');
      }
    } catch (error) {
      message.error('Failed to generate client');
      console.error('Error generating client:', error);
    }
  };

  // Delete client
  const handleDelete = async (clientId) => {
    try {
      const response = await request('/api/clients/delete', { id: clientId });
      if (response.data.code === 0) {
        message.success('Client deleted successfully');
        loadClients();
      } else {
        message.error(response.data.msg || 'Failed to delete client');
      }
    } catch (error) {
      message.error('Failed to delete client');
      console.error('Error deleting client:', error);
    }
  };

  // Download client
  const handleDownload = (client) => {
    const downloadUrl = getBaseURL(false, `/api/clients/download/${client.id}`);
    window.open(downloadUrl, '_blank');
  };

  // Get installation command
  const getInstallCommand = (client) => {
    const baseUrl = getBaseURL(false, '');
    switch (client.platform) {
      case 'windows':
        return `powershell -ExecutionPolicy Bypass -File install-windows.ps1`;
      case 'linux':
        return `curl -sSL ${baseUrl}/install-linux.sh | sudo bash`;
      case 'macos':
        return `curl -sSL ${baseUrl}/install-linux.sh | sudo bash`;
      default:
        return `Download and run: ${client.filename}`;
    }
  };

  // Columns for clients table
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <strong>{text}</strong>
          <Tag color={record.status === 'active' ? 'green' : 'red'}>
            {record.status}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform) => (
        <Tag color="blue">{platform?.toUpperCase() || 'Unknown'}</Tag>
      )
    },
    {
      title: 'Architecture',
      dataIndex: 'architecture',
      key: 'architecture',
      render: (arch) => <Tag>{arch || 'Unknown'}</Tag>
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size) => size ? `${(size / 1024 / 1024).toFixed(1)} MB` : 'Unknown'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Download">
            <Button 
              icon={<DownloadOutlined />} 
              size="small"
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Tooltip title="Install Command">
            <Button 
              icon={<CodeOutlined />} 
              size="small"
              onClick={() => {
                Modal.info({
                  title: 'Installation Command',
                  content: (
                    <div>
                      <p>Copy and run this command on the target system:</p>
                      <Input.TextArea
                        value={getInstallCommand(record)}
                        readOnly
                        rows={3}
                        style={{ fontFamily: 'monospace' }}
                      />
                    </div>
                  )
                });
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this client?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Load clients on component mount
  useEffect(() => {
    if (visible) {
      loadClients();
    }
  }, [visible]);

  return (
    <Modal
      title="Client Management"
      visible={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      className="client-manager-modal"
    >
      <Tabs defaultActiveKey="overview">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Clients"
                  value={stats.totalClients}
                  prefix={<CloudDownloadOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Clients"
                  value={stats.activeClients}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<DownloadOutlined />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Platform Distribution">
                <Space wrap>
                  {Object.entries(stats.platforms).map(([platform, count]) => (
                    <Tag key={platform} color="blue">
                      {platform.toUpperCase()}: {count}
                    </Tag>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>

          <Card
            title="Client Library"
            extra={
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={loadClients}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setGenerateModalVisible(true)}
                >
                  Generate Client
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={clients}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Quick Deploy" key="deploy">
          <QuickDeploy />
        </TabPane>

        <TabPane tab="Settings" key="settings">
          <Card title="Client Configuration">
            <Form layout="vertical">
              <Form.Item label="Default Server URL">
                <Input 
                  value={getBaseURL(false, '')} 
                  readOnly 
                  addonAfter={<Button size="small">Copy</Button>}
                />
              </Form.Item>
              <Form.Item label="WebSocket URL">
                <Input 
                  value={getBaseURL(true, '')} 
                  readOnly 
                  addonAfter={<Button size="small">Copy</Button>}
                />
              </Form.Item>
              <Form.Item label="Features Enabled">
                <Space wrap>
                  {Object.entries({
                    TERMINAL: 'Terminal Access',
                    DESKTOP: 'Desktop Control',
                    FILE_MANAGER: 'File Management',
                    PROCESS_MANAGER: 'Process Control',
                    SCREENSHOT: 'Screenshot',
                    SYSTEM_CONTROL: 'System Control'
                  }).map(([key, label]) => (
                    <Tag 
                      key={key} 
                      color={isFeatureEnabled(key) ? 'green' : 'red'}
                    >
                      {label}
                    </Tag>
                  ))}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>

      {/* Generate Client Modal */}
      <Modal
        title="Generate New Client"
        visible={generateModalVisible}
        onCancel={() => setGenerateModalVisible(false)}
        onOk={() => generateForm.submit()}
        okText="Generate"
        cancelText="Cancel"
      >
        <Form
          form={generateForm}
          layout="vertical"
          onFinish={handleGenerate}
        >
          <Form.Item
            name="name"
            label="Client Name"
            rules={[{ required: true, message: 'Please enter client name' }]}
          >
            <Input placeholder="e.g., Windows Client" />
          </Form.Item>
          
          <Form.Item
            name="platform"
            label="Platform"
            rules={[{ required: true, message: 'Please select platform' }]}
          >
            <Select placeholder="Select platform">
              <Option value="windows">Windows</Option>
              <Option value="linux">Linux</Option>
              <Option value="macos">macOS</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="architecture"
            label="Architecture"
            rules={[{ required: true, message: 'Please select architecture' }]}
          >
            <Select placeholder="Select architecture">
              <Option value="amd64">AMD64 (64-bit)</Option>
              <Option value="arm64">ARM64 (64-bit)</Option>
              <Option value="i386">i386 (32-bit)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default ClientManager;