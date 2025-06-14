import React, { useState, useEffect } from 'react';
import { Card, Space, Input, Typography, Spin, Alert, List } from 'antd';
import { DatabaseOutlined, LineChartOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
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
import {
  fetchAllHistoricalData,
  extractTrainTrendsFromHistoricalData,
  TrainInfo,
  HistoricalTrainsData,
} from '../../services/trainsData';
import { recentDates } from './config';

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

interface TrendAnalysisProps {
  onError: (error: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  onError,
  onLoadingChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalTrainsData>(
    {}
  );
  const [trendData, setTrendData] = useState<
    { date: string; total_num: number; trainInfo?: TrainInfo }[]
  >([]);
  const [selectedTrain, setSelectedTrain] = useState<string>('');

  const hasHistoricalData =
    historicalData && Object.keys(historicalData).length > 0;

  // Load historical data when component mounts
  useEffect(() => {
    loadHistoricalData();
  }, []);

  const loadHistoricalData = async () => {
    setLoading(true);
    onLoadingChange(true);
    onError(null);

    try {
      console.log('Loading historical data for trend analysis...');
      const data = await fetchAllHistoricalData(recentDates);
      setHistoricalData(data || {});
      console.log('Historical data loaded successfully');
    } catch (err) {
      console.error('Failed to load historical data:', err);
      onError(err instanceof Error ? err.message : '加载历史数据失败');
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  };

  const handleSearch = () => {
    if (!selectedTrain.trim()) {
      onError('请输入列车号');
      return;
    }

    if (!hasHistoricalData) {
      onError('历史数据未加载完成，请稍后再试');
      return;
    }

    // Analyze trends for the selected train
    const trends = handleAnalyzeTrainTrends(selectedTrain);
    setTrendData(trends);
  };

  // Analyze trends for a specific train (using preloaded historical data)
  const handleAnalyzeTrainTrends = (trainCode: string) => {
    if (!trainCode.trim()) {
      onError('请输入列车号');
      return [];
    }

    if (!hasHistoricalData) {
      onError('历史数据尚未加载完成，请稍候再试');
      return [];
    }

    const trends = extractTrainTrendsFromHistoricalData(
      trainCode,
      historicalData
    );
    setTrendData(trends);
    setSelectedTrain(trainCode);
    return trends;
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
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Historical Data Status */}
      <Card
        size="small"
        style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}
      >
        <Space>
          <DatabaseOutlined style={{ color: '#52c41a' }} />
          <span>
            {loading ? (
              <span>正在加载历史数据... ({recentDates.length} 个日期)</span>
            ) : hasHistoricalData ? (
              <span>
                历史数据已加载完成 ({Object.keys(historicalData).length}/
                {recentDates.length} 个日期) - 可进行即时趋势分析
              </span>
            ) : (
              <span>历史数据加载中...</span>
            )}
          </span>
        </Space>
      </Card>

      <div>
        <Title level={4}>列车趋势分析 (基于预加载数据)</Title>
        <Paragraph>
          输入列车号即可查看其在所有历史日期的 total_num 变化趋势 (如: 1461,
          1462)
          <br />
          <strong>数据范围:</strong> 2024年7月至2025年6月 (共
          {recentDates.length}个日期)
          <br />
          <strong>优势:</strong> 所有历史数据已预加载，趋势分析瞬间完成！
        </Paragraph>
        <Search
          placeholder="输入列车号 (如: 1461)"
          allowClear
          enterButton="分析趋势"
          size="large"
          onSearch={handleAnalyzeTrainTrends}
          disabled={!hasHistoricalData}
        />
      </div>

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
                <List.Item key={item.date}>
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
    </Space>
  );
};

export default TrendAnalysis;
