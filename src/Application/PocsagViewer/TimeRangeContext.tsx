import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect,
} from 'react';

import dayjs from 'dayjs';

import { ParsedPocsagRow, TrainSignalRecord } from './types';

interface TimeRange {
  start: dayjs.Dayjs | null;
  end: dayjs.Dayjs | null;
}

interface ToolParams {
  timeRange?: [string, string];
  [key: string]: any;
}

interface TimeRangeContextType {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  resetTimeRange: () => void;
  filteredTrainSignalRecords: TrainSignalRecord[];
  filteredParsedPocsagRows: ParsedPocsagRow[];
}

const TimeRangeContext = createContext<TimeRangeContextType | null>(null);

export const useTimeRange = () => {
  const context = useContext(TimeRangeContext);
  if (!context) {
    throw new Error('useTimeRange must be used within a TimeRangeProvider');
  }
  return context;
};

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
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: null,
    end: null,
  });

  // Initialize timeRange from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const toolParams = urlParams.get('toolParams');
    if (toolParams) {
      try {
        const params = JSON.parse(toolParams) as ToolParams;
        if (params.timeRange) {
          const [start, end] = params.timeRange;
          setTimeRange({
            start: dayjs(start),
            end: dayjs(end),
          });
        }
      } catch (error) {
        console.error('Failed to parse toolParams:', error);
      }
    }
  }, []);

  // Update URL parameters when timeRange changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let toolParams: ToolParams = { timeRange: undefined };
    try {
      const currentParams = urlParams.get('toolParams');
      if (currentParams) {
        toolParams = JSON.parse(currentParams) as ToolParams;
      }
    } catch (error) {
      console.error('Failed to parse current toolParams:', error);
    }

    if (timeRange.start && timeRange.end) {
      toolParams = {
        ...toolParams,
        timeRange: [
          timeRange.start.format('YYYY-MM-DD HH:mm:ss'),
          timeRange.end.format('YYYY-MM-DD HH:mm:ss'),
        ],
      };
    } else {
      toolParams.timeRange = undefined;
    }

    urlParams.set('toolParams', JSON.stringify(toolParams));
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${urlParams.toString()}`
    );
  }, [timeRange]);

  const resetTimeRange = () => {
    setTimeRange({ start: null, end: null });
  };

  const filteredTrainSignalRecords = useMemo(() => {
    if (!timeRange.start || !timeRange.end) {
      return trainSignalRecords;
    }
    return trainSignalRecords.filter((record) => {
      const timestamp = dayjs(record.timestamp);
      return (
        timestamp.isSameOrAfter(timeRange.start) &&
        timestamp.isSameOrBefore(timeRange.end)
      );
    });
  }, [trainSignalRecords, timeRange]);

  const filteredParsedPocsagRows = useMemo(() => {
    if (!timeRange.start || !timeRange.end) {
      return parsedPocsagRows;
    }
    return parsedPocsagRows.filter((row) => {
      const timestamp = dayjs(row.timestamp);
      return (
        timestamp.isSameOrAfter(timeRange.start) &&
        timestamp.isSameOrBefore(timeRange.end)
      );
    });
  }, [parsedPocsagRows, timeRange]);

  return (
    <TimeRangeContext.Provider
      value={{
        timeRange,
        setTimeRange,
        resetTimeRange,
        filteredTrainSignalRecords,
        filteredParsedPocsagRows,
      }}
    >
      {children}
    </TimeRangeContext.Provider>
  );
};
