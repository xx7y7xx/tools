import React, { useState } from 'react';
import { Card, Alert, Spin, Tabs, Typography } from 'antd';
import {
  DatabaseOutlined,
  LineChartOutlined,
  BarChartOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import TrainNoAnalysis from './TrainNoAnalysis';
import TrendAnalysis from './TrendAnalysis';
import DateBrowsing from './DateBrowsing';
import TotalNumAnalysis from './TotalNumAnalysis';

const { Title, Paragraph } = Typography;

const Checi: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('4');

  // Tab items configuration
  const tabItems = [
    {
      key: '4',
      label: (
        <span>
          <NumberOutlined />
          total_num变化分析
        </span>
      ),
      children: (
        <TotalNumAnalysis onError={setError} onLoadingChange={setLoading} />
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <BarChartOutlined />
          train_no变化分析
        </span>
      ),
      children: (
        <TrainNoAnalysis onError={setError} onLoadingChange={setLoading} />
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <LineChartOutlined />
          趋势分析
        </span>
      ),
      children: (
        <TrendAnalysis onError={setError} onLoadingChange={setLoading} />
      ),
    },
    {
      key: '1',
      label: (
        <span>
          <DatabaseOutlined />
          按日期浏览
        </span>
      ),
      children: (
        <DateBrowsing onError={setError} onLoadingChange={setLoading} />
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Title level={2}>🚂 Checi - 中国铁路数据查询</Title>
        <Paragraph>
          Fetch and explore Chinese railway data using axios
        </Paragraph>
      </Card>

      {/* Main Interface */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* Error Display */}
      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginTop: '20px' }}
        />
      )}

      {/* Loading Spinner */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Paragraph>正在获取列车数据...</Paragraph>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <Card
        style={{
          marginTop: '20px',
          textAlign: 'center',
          background: '#fafafa',
        }}
      >
        <Paragraph style={{ margin: 0, color: '#666' }}>
          🚂 Checi 使用 axios 从各种数据源获取中国铁路数据 |
          优化版本：独立的数据浏览和趋势分析
        </Paragraph>
      </Card>
    </div>
  );
};

export default Checi;
