import { useEffect, useState } from 'react';

import { Button, Slider } from 'antd';

import { TrainInfo } from './types';

/**
 * Show the detail of a train's checi
 * Show an animation of the handler on slider
 */
const CheciDetail = ({ trainInfos }: { trainInfos: TrainInfo[] }) => {
  const [arrIndexValue, setArrIndexValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Find the min and max mileage values
  const minMileage = Math.min(...trainInfos.map((info) => info.mileage));
  const maxMileage = Math.max(...trainInfos.map((info) => info.mileage));

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setArrIndexValue((prevValue) => {
          const nextValue = prevValue + 1;
          if (nextValue > trainInfos.length - 1) {
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
  }, [isPlaying, trainInfos.length]);

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
        value={trainInfos[arrIndexValue].mileage}
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

export default CheciDetail;
