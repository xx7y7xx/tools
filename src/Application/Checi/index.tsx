import React, { useState, useMemo } from 'react';
import { List, Card, Alert, Spin, Input, Space, Tabs, Typography } from 'antd';
import {
  DatabaseOutlined,
  SearchOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  fetchTrainsData,
  fetchTrainTrends,
  TrainInfo,
  TrainsDataResponse,
} from '../../services/trainsData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const { Search } = Input;
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const Checi: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainsData, setTrainsData] = useState<TrainsDataResponse>({});
  const [stationFilter, setStationFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState('1');
  const [trendData, setTrendData] = useState<
    { date: string; total_num: number; trainInfo?: TrainInfo }[]
  >([]);
  const [selectedTrain, setSelectedTrain] = useState<string>('');

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
      setStationFilter(''); // Clear any previous search filter
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Search trains by station name
  const handleSearchByStation = async (stationName: string) => {
    if (!stationName.trim()) {
      setError('Please enter a station name');
      return;
    }

    setError(null);
    // If we don't have data yet, show error
    if (Object.keys(trainsData).length === 0) {
      setError('请先通过日期查询获取数据，然后再进行车站搜索');
      return;
    }

    setStationFilter(stationName.trim());
  };

  // Fetch trends for a specific train
  const handleFetchTrainTrends = async (trainCode: string) => {
    if (!trainCode.trim()) {
      setError('请输入列车号');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // All available dates from the trains-data directory (verified to exist)
      const recentDates = [
        '20240722',
        '20241120',
        '20241121',
        '20241221',
        '20250302',
        '20250303',
        '20250320',
        '20250321',
        '20250322',
        '20250323',
        '20250324',
        '20250325',
        '20250330',
        '20250331',
        '20250401',
        '20250402',
        '20250403',
        '20250404',
        '20250405',
        '20250406',
        '20250407',
        '20250408',
        '20250409',
        '20250410',
        '20250411',
        '20250412',
        '20250413',
        '20250414',
        '20250415',
        '20250416',
        '20250417',
        '20250418',
        '20250419',
        '20250420',
        '20250421',
        '20250422',
        '20250423',
        '20250424',
        '20250425',
        '20250426',
        '20250427',
        '20250428',
        '20250601',
        '20250605',
        '20250606',
        '20250607',
        '20250608',
        '20250609',
      ];

      const trends = await fetchTrainTrends(trainCode, recentDates);
      setTrendData(trends);
      setSelectedTrain(trainCode);
      setStationFilter(''); // Clear search filter when showing trends
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: trendData.map((item) => {
      const date = item.date;
      return `${date.slice(4, 6)}/${date.slice(6, 8)}`;
    }),
    datasets: [
      {
        label: `列车 ${selectedTrain} 的 total_num 趋势`,
        data: trendData.map((item) => item.total_num),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `列车 ${selectedTrain} 数据趋势分析`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Number',
        },
      },
      x: {
        title: {
          display: true,
          text: '日期 (MM/DD)',
        },
      },
    },
  };

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
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <DatabaseOutlined />
                列车数据
              </span>
            }
            key="1"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>按日期查询列车数据</Title>
                <Paragraph>
                  输入日期获取特定日期的列车数据 (格式: YYYYMMDD)
                  <br />
                  <strong>可用日期示例:</strong> 20250609, 20250608, 20250607,
                  20250302, 20241120
                </Paragraph>
                <Search
                  placeholder="输入日期 (如: 20250609)"
                  allowClear
                  enterButton="查询列车数据"
                  size="large"
                  onSearch={handleFetchTrainsByDate}
                  loading={loading}
                />
              </div>
            </Space>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SearchOutlined />
                车站搜索
              </span>
            }
            key="2"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>按车站搜索</Title>
                <Paragraph>
                  输入车站名称搜索相关列车 (如: 北京、上海、广州)
                  <br />
                  <strong>注意:</strong>{' '}
                  请先在"列车数据"标签页按日期查询数据，然后再进行车站搜索
                </Paragraph>
                <Search
                  placeholder="输入车站名称 (如: 北京, 上海)"
                  allowClear
                  enterButton="搜索列车"
                  size="large"
                  onSearch={handleSearchByStation}
                  loading={loading}
                />
              </div>
            </Space>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LineChartOutlined />
                趋势分析
              </span>
            }
            key="3"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>列车趋势分析</Title>
                <Paragraph>
                  输入列车号查看其在不同日期的 total_num 变化趋势 (如: 1461,
                  1462)
                  <br />
                  <strong>数据范围:</strong> 2024年7月至2025年6月 (共46个日期)
                </Paragraph>
                <Search
                  placeholder="输入列车号 (如: 1461)"
                  allowClear
                  enterButton="分析趋势"
                  size="large"
                  onSearch={handleFetchTrainTrends}
                  loading={loading}
                />
              </div>
            </Space>
          </TabPane>
        </Tabs>
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

      {/* Trains Display */}
      {displayTrains && displayTrains.length > 0 && (
        <Card
          title={`🚄 列车信息 (共找到 ${displayTrains.length} 趟列车)`}
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

      {/* Trend Chart Display */}
      {trendData.length > 0 && selectedTrain && (
        <Card
          title={`📈 列车 ${selectedTrain} 趋势分析`}
          style={{ marginTop: '20px' }}
        >
          <div style={{ marginBottom: '20px' }}>
            <Paragraph>
              <strong>路线:</strong>{' '}
              {trendData.find((t) => t.trainInfo)?.trainInfo?.from_station}→{' '}
              {trendData.find((t) => t.trainInfo)?.trainInfo?.to_station}
            </Paragraph>
            <Paragraph>
              <strong>数据范围:</strong> {trendData.length} 个日期 (有效数据:{' '}
              {trendData.filter((t) => t.total_num > 0).length} 个)
            </Paragraph>
            <Paragraph>
              <strong>最大值:</strong>{' '}
              {Math.max(...trendData.map((t) => t.total_num))} |{' '}
              <strong>最小值:</strong>{' '}
              {Math.min(...trendData.map((t) => t.total_num))} |{' '}
              <strong>平均值:</strong>{' '}
              {(
                trendData.reduce((sum, t) => sum + t.total_num, 0) /
                trendData.length
              ).toFixed(1)}
            </Paragraph>
          </div>
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Data Table */}
          <div style={{ marginTop: '20px' }}>
            <Title level={5}>详细数据</Title>
            <List
              size="small"
              dataSource={trendData.filter((t) => t.total_num > 0)}
              renderItem={(item) => (
                <List.Item>
                  <span>
                    <strong>{item.date}:</strong> total_num = {item.total_num}
                    {item.trainInfo && (
                      <span style={{ marginLeft: '10px', color: '#666' }}>
                        (车次: {item.trainInfo.train_no})
                      </span>
                    )}
                  </span>
                </List.Item>
              )}
              pagination={{ pageSize: 10, size: 'small' }}
            />
          </div>
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
          🚂 Checi 使用 axios 从各种数据源获取中国铁路数据
        </Paragraph>
      </Card>
    </div>
  );
};

export default Checi;
