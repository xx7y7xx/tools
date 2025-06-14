import axios, { AxiosResponse } from 'axios';

// Configuration for the trains-data API
const TRAINS_DATA_BASE_URL = 'http://localhost:3000/trains-data';

// Interface for train data from checiMap.json
export interface TrainInfo {
  from_station: string;
  station_train_code: string;
  to_station: string;
  total_num: string;
  train_no: string;
}

// Interface for the complete trains data response
export interface TrainsDataResponse {
  [trainCode: string]: TrainInfo;
}

// Interface for historical data across all dates
export interface HistoricalTrainsData {
  [date: string]: TrainsDataResponse;
}

/**
 * Fetches trains data from checiMap.json for a specific date
 * @param dateString - Date in YYYYMMDD format (e.g., '20250609'). Required since there's no root checiMap.json
 * @returns Promise containing trains data
 */
export const fetchTrainsData = async (
  dateString: string
): Promise<TrainsDataResponse> => {
  try {
    const response: AxiosResponse = await axios.get(
      `${TRAINS_DATA_BASE_URL}/${dateString}/checiMap.json`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching trains data:', error);
    throw new Error(
      `Failed to fetch trains data for ${dateString}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Fetches all historical trains data across multiple dates
 * @param dates - Array of dates in YYYYMMDD format
 * @returns Promise containing all historical data organized by date
 */
export const fetchAllHistoricalData = async (
  dates: string[]
): Promise<HistoricalTrainsData> => {
  console.log(`Fetching historical data for ${dates.length} dates...`);

  const results = await Promise.allSettled(
    dates.map(async (date) => {
      try {
        const data = await fetchTrainsData(date);
        return { date, data };
      } catch (error) {
        console.warn(`Failed to fetch data for ${date}:`, error);
        return { date, data: {} };
      }
    })
  );

  const historicalData: HistoricalTrainsData = {};

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      historicalData[result.value.date] = result.value.data;
    }
  });

  console.log(
    `Successfully loaded data for ${Object.keys(historicalData).length} dates`
  );
  return historicalData;
};

/**
 * Fetches data for a specific train across multiple dates
 * @param trainCode - Train code (e.g., '1461')
 * @param dates - Array of dates in YYYYMMDD format
 * @returns Promise containing train data trends (only includes dates with actual data)
 */
export const fetchTrainTrends = async (
  trainCode: string,
  dates: string[]
): Promise<{ date: string; total_num: number; trainInfo: TrainInfo }[]> => {
  const results = await Promise.allSettled(
    dates.map(async (date) => {
      try {
        const data = await fetchTrainsData(date);
        const trainInfo = data[trainCode];
        if (trainInfo) {
          return {
            date,
            total_num: parseInt(trainInfo.total_num),
            trainInfo,
          };
        }
        return null;
      } catch (error) {
        return null;
      }
    })
  );

  return results
    .filter(
      (result): result is PromiseFulfilledResult<any> =>
        result.status === 'fulfilled' && result.value !== null
    )
    .map((result) => result.value)
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Extract trend data for a specific train from preloaded historical data
 * @param trainCode - Train code (e.g., '1461')
 * @param historicalData - Preloaded historical data
 * @returns Array containing train data trends (only includes dates with actual data)
 */
export const extractTrainTrendsFromHistoricalData = (
  trainCode: string,
  historicalData: HistoricalTrainsData
): { date: string; total_num: number; trainInfo: TrainInfo }[] => {
  const trends = Object.entries(historicalData)
    .map(([date, data]) => {
      const trainInfo = data[trainCode];
      if (trainInfo) {
        return {
          date,
          total_num: parseInt(trainInfo.total_num),
          trainInfo,
        };
      }
      return null;
    })
    .filter(
      (
        item
      ): item is { date: string; total_num: number; trainInfo: TrainInfo } =>
        item !== null
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  return trends;
};
