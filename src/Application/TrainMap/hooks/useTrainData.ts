import { useEffect, useState } from 'react';
import { trainDataService } from '../services/trainDataService';
import { TrainPosition } from '../services/types';

export const useTrainData = () => {
  const [trains, setTrains] = useState<TrainPosition[]>([]);

  // Listen for train updates
  useEffect(() => {
    const unsubscribe = trainDataService.onTrainUpdate((train) => {
      setTrains((prevTrains) => {
        const existingIndex = prevTrains.findIndex((t) => t.id === train.id);
        if (existingIndex >= 0) {
          const updatedTrains = [...prevTrains];
          updatedTrains[existingIndex] = train;
          return updatedTrains;
        } else {
          return [...prevTrains, train];
        }
      });
    });

    return unsubscribe;
  }, []);

  // Listen for all trains updates
  useEffect(() => {
    const unsubscribe = trainDataService.onAllTrainsUpdate((trains) => {
      setTrains(trains);
    });

    return unsubscribe;
  }, []);

  const handleRefresh = () => {
    trainDataService.requestAllTrains();
  };

  return {
    trains,
    handleRefresh,
  };
};
