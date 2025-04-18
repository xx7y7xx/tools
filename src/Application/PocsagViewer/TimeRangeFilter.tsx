import { DatePicker, Space, Button } from 'antd';
import dayjs from 'dayjs';

import { useTimeRange } from './TimeRangeContext';

const { RangePicker } = DatePicker;

const TimeRangeFilter = () => {
  const { timeRange, setTimeRange, resetTimeRange } = useTimeRange();

  const handleChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    if (dates) {
      // Ensure both dates are set
      if (dates[0] && dates[1]) {
        setTimeRange(dates);
      }
    } else {
      setTimeRange(null);
    }
  };

  return (
    <Space direction="vertical" style={{ marginBottom: 16, width: '100%' }}>
      <RangePicker
        showTime
        format="YYYY-MM-DD HH:mm:ss"
        value={timeRange}
        onChange={handleChange}
        style={{ width: '100%' }}
        placeholder={['Start Time', 'End Time']}
        allowClear
      />
      {timeRange && (
        <Button onClick={resetTimeRange} type="link">
          Clear Time Range
        </Button>
      )}
    </Space>
  );
};

export default TimeRangeFilter;
