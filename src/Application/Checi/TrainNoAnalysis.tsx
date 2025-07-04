import React, { useState, useEffect } from 'react';
import { Card, Table, Statistic, Row, Col, Spin, Tag, Progress } from 'antd';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  fetchAllHistoricalData,
  HistoricalTrainsData,
} from '../services/trainsData';
import { recentDates } from './config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TrainNoVariation {
  trainCode: string;
  uniqueTrainNos: string[];
  variationCount: number;
  hasVariation: boolean;
  dateTrainNoMap: { [date: string]: string };
}

interface AnalysisStats {
  totalTrainCodes: number;
  trainsWithVariation: number;
  trainsWithoutVariation: number;
  variationRate: number;
  maxVariations: number;
  avgVariations: number;
}

interface TrainNoAnalysisProps {
  onError: (error: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
}

const TrainNoAnalysis: React.FC<TrainNoAnalysisProps> = ({
  onError,
  onLoadingChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<TrainNoVariation[]>(
    []
  );
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadAndAnalyzeData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAndAnalyzeData = async () => {
    setLoading(true);
    onLoadingChange(true);
    onError(null);
    setProgress(0);

    try {
      console.log('开始加载历史数据进行车次号变化分析...');

      // 加载所有历史数据
      const data = await fetchAllHistoricalData(recentDates);
      setProgress(50);

      // 分析车次号变化
      const results = analyzeTrainNoVariations(data);
      setAnalysisResults(results);

      // 计算统计信息
      const statistics = calculateStats(results);
      setStats(statistics);
      setProgress(100);

      console.log(
        `分析完成: ${results.length} 个车次，${statistics.trainsWithVariation} 个有变化`
      );
    } catch (err) {
      console.error('分析车次号变化时出错:', err);
      onError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  };

  const analyzeTrainNoVariations = (
    data: HistoricalTrainsData
  ): TrainNoVariation[] => {
    const trainCodeMap: { [trainCode: string]: { [date: string]: string } } =
      {};

    // 收集所有车次在各个日期的train_no
    Object.entries(data).forEach(([date, trains]) => {
      Object.entries(trains).forEach(([trainCode, trainInfo]) => {
        if (!trainCodeMap[trainCode]) {
          trainCodeMap[trainCode] = {};
        }
        trainCodeMap[trainCode][date] = trainInfo.train_no;
      });
    });

    // 分析每个车次的train_no变化
    const results: TrainNoVariation[] = Object.entries(trainCodeMap).map(
      ([trainCode, dateTrainNoMap]) => {
        const uniqueTrainNos = Array.from(
          new Set(Object.values(dateTrainNoMap))
        );
        const variationCount = uniqueTrainNos.length;
        const hasVariation = variationCount > 1;

        return {
          trainCode,
          uniqueTrainNos,
          variationCount,
          hasVariation,
          dateTrainNoMap,
        };
      }
    );

    // 按变化数量降序排序
    return results.sort((a, b) => b.variationCount - a.variationCount);
  };

  const calculateStats = (results: TrainNoVariation[]): AnalysisStats => {
    const totalTrainCodes = results.length;
    const trainsWithVariation = results.filter((r) => r.hasVariation).length;
    const trainsWithoutVariation = totalTrainCodes - trainsWithVariation;
    const variationRate =
      totalTrainCodes > 0 ? (trainsWithVariation / totalTrainCodes) * 100 : 0;
    const maxVariations = Math.max(...results.map((r) => r.variationCount));
    const avgVariations =
      results.reduce((sum, r) => sum + r.variationCount, 0) / totalTrainCodes;

    return {
      totalTrainCodes,
      trainsWithVariation,
      trainsWithoutVariation,
      variationRate,
      maxVariations,
      avgVariations,
    };
  };

  const getChartData = () => {
    if (!stats) return null;

    // 按变化数量分组统计
    const variationGroups: { [key: string]: number } = {};
    analysisResults.forEach((result) => {
      const key =
        result.variationCount === 1
          ? '无变化'
          : `${result.variationCount}种变化`;
      variationGroups[key] = (variationGroups[key] || 0) + 1;
    });

    return {
      labels: Object.keys(variationGroups),
      datasets: [
        {
          label: '车次数量',
          data: Object.values(variationGroups),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const tableColumns = [
    {
      title: '车次代码',
      dataIndex: 'trainCode',
      key: 'trainCode',
      width: 120,
      sorter: (a: TrainNoVariation, b: TrainNoVariation) =>
        a.trainCode.localeCompare(b.trainCode),
    },
    {
      title: '是否有变化',
      dataIndex: 'hasVariation',
      key: 'hasVariation',
      width: 120,
      render: (hasVariation: boolean) => (
        <Tag color={hasVariation ? 'red' : 'green'}>
          {hasVariation ? '有变化' : '无变化'}
        </Tag>
      ),
      filters: [
        { text: '有变化', value: true },
        { text: '无变化', value: false },
      ],
      onFilter: (value: boolean | React.Key, record: TrainNoVariation) =>
        record.hasVariation === value,
    },
    {
      title: '变化数量',
      dataIndex: 'variationCount',
      key: 'variationCount',
      width: 100,
      sorter: (a: TrainNoVariation, b: TrainNoVariation) =>
        a.variationCount - b.variationCount,
    },
    {
      title: '所有train_no值',
      dataIndex: 'uniqueTrainNos',
      key: 'uniqueTrainNos',
      render: (uniqueTrainNos: string[]) => (
        <div>
          {uniqueTrainNos.map((trainNo, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
              {trainNo}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '出现日期数',
      key: 'dateCount',
      width: 100,
      render: (record: TrainNoVariation) =>
        Object.keys(record.dateTrainNoMap).length,
      sorter: (a: TrainNoVariation, b: TrainNoVariation) =>
        Object.keys(a.dateTrainNoMap).length -
        Object.keys(b.dateTrainNoMap).length,
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h2>train_no变化分析</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>
        分析所有车次在不同日期间的train_no字段是否发生变化
      </p>

      {loading && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Progress percent={progress} />
              <p>正在分析车次号变化...</p>
            </div>
          </div>
        </Card>
      )}

      {stats && (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总车次数"
                  value={stats.totalTrainCodes}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="有变化车次"
                  value={stats.trainsWithVariation}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="无变化车次"
                  value={stats.trainsWithoutVariation}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="变化率"
                  value={stats.variationRate}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card>
                <Statistic
                  title="最大变化数"
                  value={stats.maxVariations}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="平均变化数"
                  value={stats.avgVariations}
                  precision={2}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Card>
            </Col>
          </Row>

          {getChartData() && (
            <Card title="变化分布图" style={{ marginBottom: 24 }}>
              <Bar
                data={getChartData()!}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: '车次train_no变化分布',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        maxTicksLimit: 10,
                      },
                    },
                  },
                }}
              />
            </Card>
          )}

          <Card title="详细分析结果">
            <Table
              columns={tableColumns}
              dataSource={analysisResults}
              rowKey="trainCode"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
              }}
              scroll={{ x: 800 }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default TrainNoAnalysis;
