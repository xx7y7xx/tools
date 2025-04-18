import { useEffect, useState } from 'react';

import { Button, Slider } from 'antd';

import { useTimeRange } from './TimeRangeContext';

/**
 * Show an animation of the handler on slider
 */
const TrainSlider = () => {
  const { filteredTrainSignalRecords } = useTimeRange();
  const [arrIndexValue, setArrIndexValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset slider state when filtered records change
  useEffect(() => {
    setArrIndexValue(0);
    setIsPlaying(false);
  }, [filteredTrainSignalRecords]);

  // Find the min and max mileage values
  const minMileage = Math.min(
    ...filteredTrainSignalRecords.map((record) => record.payload.mileage)
  );
  const maxMileage = Math.max(
    ...filteredTrainSignalRecords.map((record) => record.payload.mileage)
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setArrIndexValue((prevValue) => {
          const nextValue = prevValue + 1;
          if (nextValue > filteredTrainSignalRecords.length - 1) {
            setIsPlaying(false);
            return prevValue;
          }
          return nextValue;
        });
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, filteredTrainSignalRecords.length]);

  const handlePlay = () => {
    setArrIndexValue(0);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleSlideChange = (value: number) => {
    setArrIndexValue(value);
  };

  return (
    <div>
      <h3>Train Mileage Over Time</h3>
      <Slider
        value={filteredTrainSignalRecords[arrIndexValue]?.payload.mileage}
        onChange={handleSlideChange}
        min={minMileage}
        max={maxMileage}
        step={0.1}
        tooltip={{
          open: true,
          formatter: (value) => `${value} km`,
        }}
      />
      <Button onClick={handlePlay}>Play</Button>
      <Button onClick={handlePause}>Pause</Button>
    </div>
  );
};

export default TrainSlider;
