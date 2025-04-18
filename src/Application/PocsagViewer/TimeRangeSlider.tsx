import { ReactNode } from 'react';

import { Slider } from 'antd';
import dayjs from 'dayjs';

import { TrainSignalRecord } from './types';
import { useTimeRange } from './TimeRangeContext';

const TimeRangeSlider = () => {
  const {
    timeRange,
    setTimeRange,
    filteredTrainSignalRecords,
    trainSignalRecords,
  } = useTimeRange();

  if (filteredTrainSignalRecords.length === 0) {
    return null;
  }

  // Get the time range of all records (not just filtered ones)
  const allTimes = trainSignalRecords.map((record: TrainSignalRecord) =>
    dayjs(record.timestamp).valueOf()
  );
  const minTime = Math.min(...allTimes);
  const maxTime = Math.max(...allTimes);

  // Convert current timeRange to slider values
  const sliderValue = timeRange
    ? [dayjs(timeRange[0]).valueOf(), dayjs(timeRange[1]).valueOf()]
    : [minTime, maxTime];

  const handleSliderChange = (value: number[]) => {
    setTimeRange([dayjs(value[0]), dayjs(value[1])]);
  };

  const formatTooltip = (value?: number): ReactNode => {
    if (value === undefined) return '';
    return dayjs(value).format('MMM D, HH:mm');
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <Slider
        range
        value={sliderValue}
        onChange={handleSliderChange}
        min={minTime}
        max={maxTime}
        tooltip={{
          formatter: formatTooltip,
        }}
        marks={{
          [minTime]: dayjs(minTime).format('HH:mm'),
          [maxTime]: dayjs(maxTime).format('HH:mm'),
        }}
      />
    </div>
  );
};

export default TimeRangeSlider;
