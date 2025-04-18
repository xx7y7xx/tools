import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import dayjs from 'dayjs';
import { ParsedPocsagRow, TrainSignalRecord } from './types';

interface TimeRangeContextType {
  timeRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  setTimeRange: (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => void;
  filteredTrainSignalRecords: TrainSignalRecord[];
  filteredParsedPocsagRows: ParsedPocsagRow[];
  resetTimeRange: () => void;
  trainSignalRecords: TrainSignalRecord[];
}

const TimeRangeContext = createContext<TimeRangeContextType | undefined>(
  undefined
);

interface TimeRangeProviderProps {
  children: ReactNode;
  trainSignalRecords: TrainSignalRecord[];
  parsedPocsagRows: ParsedPocsagRow[];
}

export const TimeRangeProvider = ({
  children,
  trainSignalRecords,
  parsedPocsagRows,
}: TimeRangeProviderProps) => {
  const [timeRange, setTimeRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  const resetTimeRange = () => setTimeRange(null);

  const filteredTrainSignalRecords = useMemo(() => {
    if (!timeRange) return trainSignalRecords;
    const [start, end] = timeRange;
    if (!start || !end) return trainSignalRecords;

    return trainSignalRecords.filter((record) => {
      const recordTime = dayjs(record.timestamp);
      return recordTime.isSameOrAfter(start) && recordTime.isSameOrBefore(end);
    });
  }, [trainSignalRecords, timeRange]);

  const filteredParsedPocsagRows = useMemo(() => {
    if (!timeRange) return parsedPocsagRows;
    const [start, end] = timeRange;
    if (!start || !end) return parsedPocsagRows;

    return parsedPocsagRows.filter((row) => {
      const rowTime = dayjs(row.timestamp);
      return rowTime.isSameOrAfter(start) && rowTime.isSameOrBefore(end);
    });
  }, [parsedPocsagRows, timeRange]);

  const value = useMemo(
    () => ({
      timeRange,
      setTimeRange,
      filteredTrainSignalRecords,
      filteredParsedPocsagRows,
      resetTimeRange,
      trainSignalRecords,
    }),
    [
      timeRange,
      filteredTrainSignalRecords,
      filteredParsedPocsagRows,
      trainSignalRecords,
    ]
  );

  return (
    <TimeRangeContext.Provider value={value}>
      {children}
    </TimeRangeContext.Provider>
  );
};

export const useTimeRange = () => {
  const context = useContext(TimeRangeContext);
  if (context === undefined) {
    throw new Error('useTimeRange must be used within a TimeRangeProvider');
  }
  return context;
};
