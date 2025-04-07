import { createContext, useContext, ReactNode } from 'react';

import { TrainsFullInfoMapType } from '../searchTrain/types';

interface TrainsContextType {
  trainsFullInfoMap: TrainsFullInfoMapType;
  checis: string[];
  date: string;
}

const TrainsContext = createContext<TrainsContextType | undefined>(undefined);

export const useTrains = () => {
  const context = useContext(TrainsContext);
  if (context === undefined) {
    throw new Error('useTrains must be used within a TrainsProvider');
  }
  return context;
};

interface TrainsProviderProps {
  children: ReactNode;
  trainsFullInfoMap: TrainsFullInfoMapType;
  checis: string[];
  date: string;
}

export const TrainsProvider = ({
  children,
  trainsFullInfoMap,
  checis,
  date,
}: TrainsProviderProps) => {
  return (
    <TrainsContext.Provider value={{ trainsFullInfoMap, checis, date }}>
      {children}
    </TrainsContext.Provider>
  );
};
