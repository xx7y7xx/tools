import React, { useState, useMemo } from 'react';
import {
  List,
  Card,
  Alert,
  Spin,
  Input,
  Space,
  Tabs,
  Typography,
  Button,
  Tag,
} from 'antd';
import {
  DatabaseOutlined,
  SearchOutlined,
  LineChartOutlined,
  DownloadOutlined,
  FilterOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  fetchTrainsData,
  TrainInfo,
  TrainsDataResponse,
} from '../../services/trainsData';
import { recentDates } from './config';
import TrainNoAnalysis from './TrainNoAnalysis';
import TrendAnalysis from './TrendAnalysis';

const { Search } = Input;
const { Title, Paragraph } = Typography;

const Checi: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainsData, setTrainsData] = useState<TrainsDataResponse>({});
  const [loadedDate, setLoadedDate] = useState<string>('');
  const [stationFilter, setStationFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState('3');

  // Computed: filter trains based on station search
  const displayTrains = useMemo(() => {
    const allTrains = Object.values(trainsData);
    if (!stationFilter) return allTrains;
    return allTrains.filter(
      (train) =>
        train.from_station.includes(stationFilter) ||
        train.to_station.includes(stationFilter)
    );
  }, [trainsData, stationFilter]);

  const totalTrainsCount = Object.keys(trainsData).length;
  const hasData = totalTrainsCount > 0;

  // Fetch trains data by date
  const handleFetchTrainsByDate = async (dateString: string) => {
    if (!dateString.trim()) {
      setError('请输入日期 (YYYYMMDD格式)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchTrainsData(dateString);
      setTrainsData(result);
      setLoadedDate(dateString);
      setStationFilter(''); // Clear any previous search filter
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Search trains by station name (local filtering)
  const handleSearchByStation = (stationName: string) => {
    setStationFilter(stationName.trim());
  };

  // Clear station filter
  const handleClearFilter = () => {
    setStationFilter('');
  };

  // Tab items configuration
  const tabItems = [
    {
      key: '3',
      label: (
        <span>
          <BarChartOutlined />
          train_no变化分析
        </span>
      ),
      children: <TrainNoAnalysis />,
    },
    {
      key: '2',
      label: (
        <span>
          <LineChartOutlined />
          趋势分析
        </span>
      ),
      children: <TrendAnalysis onError={setError} />,
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
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Date Selection */}
          <div>
            <Title level={4}>
              <DownloadOutlined /> 选择日期并加载数据
            </Title>
            <Paragraph>
              输入日期一次性下载该日期的所有列车数据到本地 (格式: YYYYMMDD)
              <br />
              <strong>可用日期示例:</strong> 20250609, 20250608, 20250607,
              20250302, 20241120
            </Paragraph>
            <Space>
              <Search
                placeholder="输入日期 (如: 20250609)"
                allowClear
                enterButton="下载数据"
                size="large"
                onSearch={handleFetchTrainsByDate}
                loading={loading}
                style={{ width: '300px' }}
              />
              {hasData && (
                <Tag
                  color="success"
                  style={{ fontSize: '14px', padding: '4px 8px' }}
                >
                  已加载 {loadedDate} 的数据 ({totalTrainsCount} 趟列车)
                </Tag>
              )}
            </Space>
          </div>

          {/* Station Filtering - Only show when data is loaded */}
          {hasData && (
            <div>
              <Title level={4}>
                <FilterOutlined /> 按车站筛选 (本地搜索，无需重新下载)
              </Title>
              <Paragraph>
                从已下载的 <Tag color="blue">{loadedDate}</Tag>{' '}
                数据中搜索包含指定车站的列车
              </Paragraph>
              <Space>
                <Search
                  placeholder="输入车站名称 (如: 北京, 上海)"
                  allowClear
                  enterButton="筛选"
                  size="large"
                  onSearch={handleSearchByStation}
                  style={{ width: '300px' }}
                />
                {stationFilter && (
                  <Button onClick={handleClearFilter}>清除筛选</Button>
                )}
              </Space>
              {stationFilter && (
                <div style={{ marginTop: '10px' }}>
                  <Tag color="blue">当前筛选: {stationFilter}</Tag>
                  <Tag color="green">找到 {displayTrains.length} 趟列车</Tag>
                </div>
              )}
            </div>
          )}

          {/* No Data State for Tab 1 */}
          {!hasData && !loading && (
            <Card style={{ textAlign: 'center', padding: '40px' }}>
              <DatabaseOutlined
                style={{
                  fontSize: '48px',
                  color: '#ccc',
                  marginBottom: '16px',
                }}
              />
              <Title level={4} style={{ color: '#666' }}>
                暂无数据
              </Title>
              <Paragraph style={{ color: '#999' }}>
                请先选择日期并下载数据，然后即可进行车站搜索
              </Paragraph>
            </Card>
          )}
        </Space>
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

      {/* Trains Display - Only for Tab 1 */}
      {activeTab === '1' && displayTrains && displayTrains.length > 0 && (
        <Card
          title={
            <span>
              🚄 列车信息
              {stationFilter ? (
                <span>
                  {' '}
                  - 筛选结果: "{stationFilter}" (共 {displayTrains.length} 趟)
                </span>
              ) : (
                <span> (共 {displayTrains.length} 趟列车)</span>
              )}
            </span>
          }
          style={{ marginTop: '20px' }}
        >
          <List
            dataSource={displayTrains}
            renderItem={(train: TrainInfo) => (
              <List.Item>
                <Card size="small" style={{ width: '100%' }} hoverable>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Title
                        level={5}
                        style={{ margin: 0, marginBottom: '8px' }}
                      >
                        🚄 {train.station_train_code}
                      </Title>
                      <Space direction="vertical" size="small">
                        <div>
                          <strong>起点站:</strong> {train.from_station}
                        </div>
                        <div>
                          <strong>终点站:</strong> {train.to_station}
                        </div>
                        <div>
                          <strong>车次编号:</strong> {train.train_no}
                        </div>
                      </Space>
                    </div>
                    <div style={{ textAlign: 'right', color: '#666' }}>
                      <div>
                        <strong>总数:</strong>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {train.total_num}
                      </div>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
            pagination={{
              pageSize: 12,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} 共 ${total} 趟列车`,
            }}
          />
        </Card>
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
