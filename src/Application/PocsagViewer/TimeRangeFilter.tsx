import { DatePicker } from 'antd';
import dayjs from 'dayjs';

import { useTimeRange } from './TimeRangeContext';
import TimeRangeSlider from './TimeRangeSlider';

const { RangePicker } = DatePicker;

const TimeRangeFilter = () => {
  const { timeRange, setTimeRange } = useTimeRange();

  const handleChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      setTimeRange({
        start: dates[0],
        end: dates[1],
      });
    } else {
      setTimeRange({
        start: null,
        end: null,
      });
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <RangePicker
          showTime
          value={
            timeRange.start && timeRange.end
              ? [timeRange.start, timeRange.end]
              : null
          }
          onChange={handleChange}
          placeholder={['Start Time', 'End Time']}
          allowClear
        />
      </div>
      <TimeRangeSlider />
    </div>
  );
};

export default TimeRangeFilter;
