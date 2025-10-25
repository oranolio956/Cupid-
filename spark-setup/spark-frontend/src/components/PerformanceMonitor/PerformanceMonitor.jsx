import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Statistic, Progress, Alert, Button, Table, Tag } from 'antd';
import { 
  DashboardOutlined, 
  ThunderboltOutlined, 
  MemoryOutlined, 
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { PerformanceContext } from '../../optimizations/performance';

const PerformanceMonitor = () => {
  const { metrics } = useContext(PerformanceContext);
  const [webVitals, setWebVitals] = useState({});
  const [performanceData, setPerformanceData] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errorCount: 0
  });

  // Monitor Web Vitals
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        setWebVitals(prev => ({
          ...prev,
          [entry.name]: entry.value
        }));
      });
    });

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    return () => observer.disconnect();
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryUsage = () => {
      if (performance.memory) {
        setPerformanceData(prev => ({
          ...prev,
          memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) // MB
        }));
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, []);

  // Monitor network requests
  useEffect(() => {
    let requestCount = 0;
    let errorCount = 0;

    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      requestCount++;
      setPerformanceData(prev => ({
        ...prev,
        networkRequests: requestCount
      }));

      return originalFetch(...args)
        .then(response => {
          if (!response.ok) {
            errorCount++;
            setPerformanceData(prev => ({
              ...prev,
              errorCount
            }));
          }
          return response;
        })
        .catch(error => {
          errorCount++;
          setPerformanceData(prev => ({
            ...prev,
            errorCount
          }));
          throw error;
        });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Calculate performance score
  const calculatePerformanceScore = () => {
    let score = 100;
    
    // Deduct points for slow metrics
    if (webVitals['first-contentful-paint'] > 2000) score -= 20;
    if (webVitals['largest-contentful-paint'] > 4000) score -= 20;
    if (webVitals['first-input-delay'] > 100) score -= 20;
    if (webVitals['cumulative-layout-shift'] > 0.1) score -= 20;
    if (performanceData.memoryUsage > 100) score -= 10;
    if (performanceData.errorCount > 0) score -= 10;

    return Math.max(0, score);
  };

  const performanceScore = calculatePerformanceScore();
  const scoreColor = performanceScore >= 80 ? 'green' : performanceScore >= 60 ? 'orange' : 'red';

  // Performance metrics data
  const metricsData = [
    {
      key: '1',
      metric: 'First Contentful Paint',
      value: webVitals['first-contentful-paint'] ? `${Math.round(webVitals['first-contentful-paint'])}ms` : 'N/A',
      status: webVitals['first-contentful-paint'] < 2000 ? 'good' : 'warning',
      threshold: '2000ms'
    },
    {
      key: '2',
      metric: 'Largest Contentful Paint',
      value: webVitals['largest-contentful-paint'] ? `${Math.round(webVitals['largest-contentful-paint'])}ms` : 'N/A',
      status: webVitals['largest-contentful-paint'] < 4000 ? 'good' : 'warning',
      threshold: '4000ms'
    },
    {
      key: '3',
      metric: 'First Input Delay',
      value: webVitals['first-input-delay'] ? `${Math.round(webVitals['first-input-delay'])}ms` : 'N/A',
      status: webVitals['first-input-delay'] < 100 ? 'good' : 'warning',
      threshold: '100ms'
    },
    {
      key: '4',
      metric: 'Cumulative Layout Shift',
      value: webVitals['cumulative-layout-shift'] ? webVitals['cumulative-layout-shift'].toFixed(3) : 'N/A',
      status: webVitals['cumulative-layout-shift'] < 0.1 ? 'good' : 'warning',
      threshold: '0.1'
    }
  ];

  const columns = [
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Threshold',
      dataIndex: 'threshold',
      key: 'threshold',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'good' ? 'green' : 'orange'}>
          {status === 'good' ? <CheckCircleOutlined /> : <WarningOutlined />}
          {status === 'good' ? 'Good' : 'Needs Improvement'}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2>
        <DashboardOutlined /> Performance Monitor
      </h2>

      {/* Performance Score */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Performance Score"
                  value={performanceScore}
                  suffix="/100"
                  valueStyle={{ color: scoreColor === 'green' ? '#3f8600' : scoreColor === 'orange' ? '#faad14' : '#cf1322' }}
                />
                <Progress
                  percent={performanceScore}
                  strokeColor={scoreColor === 'green' ? '#3f8600' : scoreColor === 'orange' ? '#faad14' : '#cf1322'}
                  showInfo={false}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Memory Usage"
                  value={performanceData.memoryUsage}
                  suffix="MB"
                  prefix={<MemoryOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Network Requests"
                  value={performanceData.networkRequests}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Web Vitals */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="Core Web Vitals" extra={<ClockCircleOutlined />}>
            <Table
              columns={columns}
              dataSource={metricsData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Alerts */}
      {performanceScore < 80 && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Alert
              message="Performance Issues Detected"
              description="Your application performance is below optimal levels. Consider implementing performance optimizations."
              type="warning"
              showIcon
              action={
                <Button size="small" type="primary">
                  View Recommendations
                </Button>
              }
            />
          </Col>
        </Row>
      )}

      {/* Component Metrics */}
      {Object.keys(metrics).length > 0 && (
        <Row gutter={16}>
          <Col span={24}>
            <Card title="Component Performance">
              <Row gutter={16}>
                {Object.entries(metrics).map(([component, data]) => (
                  <Col span={8} key={component}>
                    <Card size="small">
                      <Statistic
                        title={component}
                        value={data.averageRenderTime}
                        suffix="ms"
                        precision={2}
                      />
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Renders: {data.renderCount}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Performance Tips */}
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Performance Tips">
            <ul>
              <li>Use React.memo for components that don't need to re-render frequently</li>
              <li>Implement lazy loading for large components</li>
              <li>Optimize images and use appropriate formats (WebP, AVIF)</li>
              <li>Minimize bundle size by removing unused code</li>
              <li>Use CDN for static assets</li>
              <li>Implement service workers for caching</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceMonitor;