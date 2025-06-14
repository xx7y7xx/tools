import React, { useState, useMemo } from 'react';
import { List, Card, Input, Space, Typography, Button, Tag } from 'antd';
import {
  DatabaseOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  fetchTrainsData,
  TrainInfo,
  TrainsDataResponse,
} from '../services/trainsData';

const { Search } = Input;
const { Title, Paragraph } = Typography;

interface DateBrowsingProps {
  onError: (error: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
}

const DateBrowsing: React.FC<DateBrowsingProps> = ({
  onError,
  onLoadingChange,
}) => {
  const [trainsData, setTrainsData] = useState<TrainsDataResponse>({});
  const [loadedDate, setLoadedDate] = useState<string>('');
  const [stationFilter, setStationFilter] = useState<string>('');

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
      onError('请输入日期 (YYYYMMDD格式)');
      return;
    }

    onLoadingChange(true);
    onError(null);
    try {
      const result = await fetchTrainsData(dateString);
      setTrainsData(result);
      setLoadedDate(dateString);
      setStationFilter(''); // Clear any previous search filter
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      onLoadingChange(false);
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

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Date Selection */}
      <div>
        <Title level={4}>
          <DownloadOutlined /> 选择日期并加载数据
        </Title>
        <Paragraph>
          输入日期一次性下载该日期的所有列车数据到本地 (格式: YYYYMMDD)
          <br />
          <strong>可用日期示例:</strong> 20250609, 20250608, 20250607, 20250302,
          20241120
        </Paragraph>
        <Space>
          <Search
            placeholder="输入日期 (如: 20250609)"
            allowClear
            enterButton="下载数据"
            size="large"
            onSearch={handleFetchTrainsByDate}
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

      {/* No Data State */}
      {!hasData && (
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

      {/* Trains Display */}
      {displayTrains && displayTrains.length > 0 && (
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
    </Space>
  );
};

export default DateBrowsing;
