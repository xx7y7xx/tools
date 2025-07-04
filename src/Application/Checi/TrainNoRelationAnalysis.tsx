import React, { useState, useEffect } from 'react';
import { Card, Table, Statistic, Row, Col, Spin, Progress, Select } from 'antd';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  fetchAllHistoricalData,
  HistoricalTrainsData,
  fetchTrainsFullInfo,
} from '../services/trainsData';
import { recentDates } from './config';
import {
  aggregateTrainsByField,
  summarizeAggregationStats,
  generateChartData,
  FieldType,
  FieldAggregationStats,
  AggregationSummaryStats,
  FullTrainInfoMap,
} from './utils/trainNoRelationUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

interface TrainNoRelationAnalysisProps {
  onError: (error: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
}

const TrainNoRelationAnalysis: React.FC<TrainNoRelationAnalysisProps> = ({
  onError,
  onLoadingChange,
}) => {
  const [selectedField, setSelectedField] = useState<FieldType>('operateGroup');
  const [analysisResults, setAnalysisResults] = useState<
    FieldAggregationStats[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [historicalData, setHistoricalData] = useState<HistoricalTrainsData>(
    {}
  );
  const [stats, setStats] = useState<AggregationSummaryStats>({
    totalGroups: 0,
    uniqueTrainNumbers: 0,
    uniqueGroups: 0,
    mostCommonGroup: '',
    mostCommonTrainNumber: '',
  });

  // Cache the full train info data
  const [fullTrainInfo, setFullTrainInfo] = useState<FullTrainInfoMap>({});
  const [isFullTrainInfoLoaded, setIsFullTrainInfoLoaded] = useState(false);

  // Load full train info data only once
  useEffect(() => {
    const loadFullTrainInfo = async () => {
      try {
        const data = await fetchTrainsFullInfo();
        setFullTrainInfo(data);
        setIsFullTrainInfoLoaded(true);
      } catch (err) {
        onError('Failed to load full train info');
        console.error('Error loading full train info:', err);
      }
    };

    if (!isFullTrainInfoLoaded) {
      loadFullTrainInfo();
    }
  }, [onError, isFullTrainInfoLoaded]);

  // Load historical data only once
  useEffect(() => {
    const loadHistoricalData = async () => {
      setLoading(true);
      onError(null);
      setProgress(0);

      try {
        console.log('开始加载历史数据...');
        const data = await fetchAllHistoricalData(recentDates);
        setHistoricalData(data);
        setProgress(50);
      } catch (err) {
        onError('Failed to load historical data');
        console.error('Error loading historical data:', err);
      } finally {
        setLoading(false);
        onLoadingChange(false);
      }
    };

    loadHistoricalData();
  }, [onError, onLoadingChange]);

  // Update analysis when historical data, full train info, or selected field changes
  useEffect(() => {
    if (!historicalData || !isFullTrainInfoLoaded) return;

    setLoading(true);
    onError(null);

    try {
      const results = aggregateTrainsByField(
        historicalData,
        fullTrainInfo,
        selectedField
      );
      setAnalysisResults(results);
      setStats(summarizeAggregationStats(results));
    } catch (err) {
      onError('Failed to analyze train number relations');
      console.error('Error analyzing train number relations:', err);
    } finally {
      setLoading(false);
    }
  }, [
    historicalData,
    selectedField,
    fullTrainInfo,
    isFullTrainInfoLoaded,
    onError,
  ]);

  const columns = [
    {
      title: '字段值',
      dataIndex: 'fieldValue',
      key: 'fieldValue',
      sorter: (a: FieldAggregationStats, b: FieldAggregationStats) =>
        a.fieldValue.localeCompare(b.fieldValue),
    },
    {
      title: '出现次数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: FieldAggregationStats, b: FieldAggregationStats) =>
        a.count - b.count,
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => `${percentage.toFixed(2)}%`,
      sorter: (a: FieldAggregationStats, b: FieldAggregationStats) =>
        a.percentage - b.percentage,
    },
    {
      title: '唯一车次数量',
      dataIndex: 'uniqueTrainCodes',
      key: 'uniqueTrainCodes',
      sorter: (a: FieldAggregationStats, b: FieldAggregationStats) =>
        a.uniqueTrainCodes - b.uniqueTrainCodes,
    },
    {
      title: '总列车数',
      dataIndex: 'totalNum',
      key: 'totalNum',
      sorter: (a: FieldAggregationStats, b: FieldAggregationStats) =>
        a.totalNum - b.totalNum,
    },
  ];

  const fieldOptions = [
    { value: 'operateGroup', label: 'operateGroup' },
    { value: 'trainNumber', label: 'trainNumber' },
    { value: 'fromStation', label: 'fromStation' },
    { value: 'toStation', label: 'toStation' },
    { value: 'trainType', label: 'trainType' },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>
          <Progress percent={progress} status="active" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200, marginBottom: 16 }}
          value={selectedField}
          onChange={(value: FieldType) => setSelectedField(value)}
          options={fieldOptions}
        />
        {stats && (
          <Row gutter={16}>
            <Col span={4}>
              <Statistic
                title="Number of Groups"
                value={stats.totalGroups}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Unique Train Numbers"
                value={stats.uniqueTrainNumbers}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Unique Groups"
                value={stats.uniqueGroups}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Most Common Group"
                value={stats.mostCommonGroup}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Most Common Train Number"
                value={stats.mostCommonTrainNumber}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
          </Row>
        )}
      </Card>

      <Card title="字段值分布" style={{ marginBottom: 16 }}>
        <div style={{ height: 400 }}>
          {(() => {
            const chartData = generateChartData(analysisResults);
            return (
              <Bar
                data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: '出现次数',
                      data: chartData.data.count,
                      backgroundColor: 'rgba(54, 162, 235, 0.5)',
                      borderColor: 'rgba(54, 162, 235, 1)',
                      borderWidth: 1,
                    },
                    {
                      label: '唯一车次数量',
                      data: chartData.data.uniqueTrainCodes,
                      backgroundColor: 'rgba(255, 99, 132, 0.5)',
                      borderColor: 'rgba(255, 99, 132, 1)',
                      borderWidth: 1,
                    },
                    {
                      label: '总列车数',
                      data: chartData.data.totalNum,
                      backgroundColor: 'rgba(75, 192, 192, 0.5)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: '字段值分布（前20个）',
                    },
                  },
                }}
              />
            );
          })()}
        </div>
      </Card>

      <Card title="详细数据">
        <Table
          dataSource={analysisResults}
          columns={columns}
          rowKey={(record) => `${record.fieldValue}`}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default TrainNoRelationAnalysis;
