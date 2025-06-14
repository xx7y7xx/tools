import React, { useState } from 'react';
import {
  Card,
  Space,
  DatePicker,
  Input,
  Typography,
  List,
  Tag,
  Alert,
} from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import { fetchTrainsData, TrainInfo } from '../../services/trainsData';
import dayjs from 'dayjs';

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
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [trains, setTrains] = useState<{ [key: string]: TrainInfo }>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleDateSelect = async (date: dayjs.Dayjs | null) => {
    if (!date) {
      setSelectedDate('');
      setTrains({});
      return;
    }

    const dateString = date.format('YYYYMMDD');
    setSelectedDate(dateString);
    setLoading(true);
    onLoadingChange(true);
    onError(null);

    try {
      const data = await fetchTrainsData(dateString);
      setTrains(data || {});
    } catch (err) {
      console.error('Failed to fetch trains data:', err);
      onError(err instanceof Error ? err.message : '获取列车数据失败');
      setTrains({});
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value.trim());
  };

  const filteredTrains = Object.entries(trains).filter(([trainCode, train]) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      trainCode.toLowerCase().includes(searchLower) ||
      train.from_station.toLowerCase().includes(searchLower) ||
      train.to_station.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4}>按日期浏览列车数据</Title>
        <Paragraph>
          选择日期查看当天的所有列车数据，可以使用搜索框按车次号或站点筛选
        </Paragraph>
        <Space>
          <DatePicker
            placeholder="选择日期"
            onChange={handleDateSelect}
            disabledDate={(date) => date && date > dayjs().endOf('day')}
            style={{ width: 200 }}
          />
          <Search
            placeholder="搜索车次号或站点"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            disabled={!selectedDate}
          />
        </Space>
      </div>

      {loading ? (
        <Card loading={true} />
      ) : selectedDate ? (
        filteredTrains.length > 0 ? (
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>{selectedDate} 列车数据</span>
                <Tag color="blue">{filteredTrains.length} 个车次</Tag>
              </Space>
            }
          >
            <List
              dataSource={filteredTrains}
              renderItem={([trainCode, train]) => (
                <List.Item
                  key={trainCode}
                  extra={
                    <Space>
                      <Tag color="green">{train.total_num}</Tag>
                      <Tag color="blue">{train.train_no}</Tag>
                    </Space>
                  }
                >
                  <List.Item.Meta
                    title={trainCode}
                    description={
                      <Space>
                        <span>{train.from_station}</span>
                        <span>→</span>
                        <span>{train.to_station}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        ) : (
          <Alert
            message="未找到数据"
            description={
              searchTerm
                ? '没有找到匹配的列车数据，请尝试其他搜索条件'
                : '该日期没有列车数据'
            }
            type="info"
            showIcon
          />
        )
      ) : (
        <Alert
          message="请选择日期"
          description="请先选择一个日期来查看列车数据"
          type="info"
          showIcon
        />
      )}
    </Space>
  );
};

export default DateBrowsing;
