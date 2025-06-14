import React, { useState, useEffect, useCallback } from 'react';
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
  FullTrainInfo,
} from '../services/trainsData';
import { recentDates } from './config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

type FieldType = keyof Pick<
  FullTrainInfo,
  'operateGroup' | 'trainNumber' | 'fromStation' | 'toStation' | 'trainType'
>;

interface TrainNoRelation {
  trainNo: string;
  fieldValue: string;
  count: number;
  percentage: number;
}

interface AnalysisStats {
  totalTrains: number;
  uniqueTrainNos: number;
  uniqueFieldValues: number;
  mostCommonFieldValue: string;
  mostCommonTrainNo: string;
}

interface TrainNoRelationAnalysisProps {
  onError: (error: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
}

const TrainNoRelationAnalysis: React.FC<TrainNoRelationAnalysisProps> = ({
  onError,
  onLoadingChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<TrainNoRelation[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedField, setSelectedField] = useState<FieldType>('operateGroup');

  const loadAndAnalyzeData = useCallback(async () => {
    try {
      setLoading(true);
      onLoadingChange(true);
      setProgress(0);
      onError(null);

      console.log('开始加载历史数据用于train_no关系分析...');
      const historicalData = await fetchAllHistoricalData(recentDates);
      console.log('历史数据加载完成，开始加载完整列车信息...');
      setProgress(50);

      const trainsFullInfo = await fetchTrainsFullInfo();
      console.log('完整列车信息加载完成，开始分析关系...');
      setProgress(75);

      const analyzeTrainNoRelations = (
        historicalData: HistoricalTrainsData,
        trainsFullInfo: Record<string, FullTrainInfo>
      ): TrainNoRelation[] => {
        const relationMap: Record<string, number> = {};
        let totalCount = 0;

        // 遍历所有历史数据
        Object.entries(historicalData).forEach(([date, trains]) => {
          Object.entries(trains).forEach(([trainCode, trainInfo]) => {
            const trainNo = trainInfo.train_no;
            const fieldValue =
              trainsFullInfo[trainCode]?.[selectedField] || '未知';
            const key = `${trainNo}-${fieldValue}`;
            relationMap[key] = (relationMap[key] || 0) + 1;
            totalCount++;
          });
        });

        // 转换为数组并计算百分比
        return Object.entries(relationMap).map(([key, count]) => {
          const [trainNo, fieldValue] = key.split('-');
          return {
            trainNo,
            fieldValue,
            count,
            percentage: (count / totalCount) * 100,
          };
        });
      };

      const results = analyzeTrainNoRelations(historicalData, trainsFullInfo);
      setAnalysisResults(results);
      setStats(calculateStats(results));
      console.log('关系分析完成');
      setProgress(100);
    } catch (error) {
      console.error('加载或分析数据时出错:', error);
      onError(error instanceof Error ? error.message : '加载数据时出错');
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  }, [onError, onLoadingChange, selectedField]);

  useEffect(() => {
    loadAndAnalyzeData();
  }, [loadAndAnalyzeData]);

  const calculateStats = (results: TrainNoRelation[]): AnalysisStats => {
    const uniqueTrainNos = new Set(results.map((r) => r.trainNo));
    const uniqueFieldValues = new Set(results.map((r) => r.fieldValue));

    // 找出最常见的字段值
    const fieldValueCounts = results.reduce((acc, curr) => {
      acc[curr.fieldValue] = (acc[curr.fieldValue] || 0) + curr.count;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonFieldValue = Object.entries(fieldValueCounts).reduce(
      (a, b) => (a[1] > b[1] ? a : b)
    )[0];

    // 找出最常见的车次号
    const trainNoCounts = results.reduce((acc, curr) => {
      acc[curr.trainNo] = (acc[curr.trainNo] || 0) + curr.count;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonTrainNo = Object.entries(trainNoCounts).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    return {
      totalTrains: results.length,
      uniqueTrainNos: uniqueTrainNos.size,
      uniqueFieldValues: uniqueFieldValues.size,
      mostCommonFieldValue,
      mostCommonTrainNo,
    };
  };

  const generateChartData = () => {
    // 按计数排序并只取前20个
    const sortedResults = [...analysisResults]
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return {
      labels: sortedResults.map((r) => r.fieldValue),
      datasets: [
        {
          label: '车次数量',
          data: sortedResults.map((r) => r.count),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const columns = [
    {
      title: '车次号',
      dataIndex: 'trainNo',
      key: 'trainNo',
      sorter: (a: TrainNoRelation, b: TrainNoRelation) =>
        a.trainNo.localeCompare(b.trainNo),
    },
    {
      title: '字段值',
      dataIndex: 'fieldValue',
      key: 'fieldValue',
      sorter: (a: TrainNoRelation, b: TrainNoRelation) =>
        a.fieldValue.localeCompare(b.fieldValue),
    },
    {
      title: '出现次数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: TrainNoRelation, b: TrainNoRelation) => a.count - b.count,
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => `${percentage.toFixed(2)}%`,
      sorter: (a: TrainNoRelation, b: TrainNoRelation) =>
        a.percentage - b.percentage,
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
                title="总车次数量"
                value={stats.totalTrains}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="唯一车次号数量"
                value={stats.uniqueTrainNos}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="唯一字段值数量"
                value={stats.uniqueFieldValues}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="最常见的字段值"
                value={stats.mostCommonFieldValue}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="最常见的车次号"
                value={stats.mostCommonTrainNo}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
          </Row>
        )}
      </Card>

      <Card title="字段值分布" style={{ marginBottom: 16 }}>
        <div style={{ height: 400 }}>
          <Bar
            data={generateChartData()}
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
        </div>
      </Card>

      <Card title="详细数据">
        <Table
          dataSource={analysisResults}
          columns={columns}
          rowKey={(record) => `${record.trainNo}-${record.fieldValue}`}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default TrainNoRelationAnalysis;
