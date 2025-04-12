import { useEffect, useState } from 'react';

import { Button, Slider } from 'antd';

import { TrainSignalRecord } from './types';
import MileageChart from './MileageChart';
import SpeedChart from './SpeedChart';

/**
 * Show the detail of a train's checi
 * Show an animation of the handler on slider
 */
const CheciDetail = ({
  trainSignalRecords,
}: {
  trainSignalRecords: TrainSignalRecord[];
}) => {
  const [arrIndexValue, setArrIndexValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Find the min and max mileage values
  const minMileage = Math.min(
    ...trainSignalRecords.map((record) => record.payload.mileage)
  );
  const maxMileage = Math.max(
    ...trainSignalRecords.map((record) => record.payload.mileage)
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setArrIndexValue((prevValue) => {
          const nextValue = prevValue + 1;
          if (nextValue > trainSignalRecords.length - 1) {
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
  }, [isPlaying, trainSignalRecords.length]);

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
      <Slider
        value={trainSignalRecords[arrIndexValue].payload.mileage}
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
      <MileageChart trainSignalRecords={trainSignalRecords} />
      <SpeedChart trainSignalRecords={trainSignalRecords} />
    </div>
  );
};

export default CheciDetail;
