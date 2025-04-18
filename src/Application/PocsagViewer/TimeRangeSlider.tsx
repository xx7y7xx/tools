import { ReactNode } from 'react';

import { Slider } from 'antd';
import dayjs from 'dayjs';

import { TrainSignalRecord } from './types';
import { useTimeRange } from './TimeRangeContext';

const TimeRangeSlider = () => {
  const { timeRange, setTimeRange, trainSignalRecords } = useTimeRange();

  if (trainSignalRecords.length === 0) {
    return null;
  }

  // Calculate min and max times from all records (not just filtered ones)
  const allTimes = trainSignalRecords.map((record: TrainSignalRecord) =>
    dayjs(record.timestamp).valueOf()
  );
  const minTime = Math.min(...allTimes);
  const maxTime = Math.max(...allTimes);

  // Convert current timeRange to slider values
  const sliderValue =
    timeRange.start && timeRange.end
      ? [timeRange.start.valueOf(), timeRange.end.valueOf()]
      : [minTime, maxTime];

  const handleSliderChange = (value: number[]) => {
    setTimeRange({
      start: dayjs(value[0]),
      end: dayjs(value[1]),
    });
  };

  const formatTooltip = (value?: number): ReactNode => {
    if (!value) return null;
    return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
  };

  return (
    <div style={{ margin: '16px 0' }}>
      <Slider
        range
        value={sliderValue}
        min={minTime}
        max={maxTime}
        onChange={handleSliderChange}
        tooltip={{ formatter: formatTooltip }}
      />
    </div>
  );
};

export default TimeRangeSlider;
