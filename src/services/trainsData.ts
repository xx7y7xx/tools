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
 * Fetches data for a specific train across multiple dates
 * @param trainCode - Train code (e.g., '1461')
 * @param dates - Array of dates in YYYYMMDD format
 * @returns Promise containing train data trends
 */
export const fetchTrainTrends = async (
  trainCode: string,
  dates: string[]
): Promise<{ date: string; total_num: number; trainInfo?: TrainInfo }[]> => {
  const results = await Promise.allSettled(
    dates.map(async (date) => {
      try {
        const data = await fetchTrainsData(date);
        const trainInfo = data[trainCode];
        return {
          date,
          total_num: trainInfo ? parseInt(trainInfo.total_num) : 0,
          trainInfo: trainInfo || undefined,
        };
      } catch (error) {
        return {
          date,
          total_num: 0,
          trainInfo: undefined,
        };
      }
    })
  );

  return results
    .filter(
      (result): result is PromiseFulfilledResult<any> =>
        result.status === 'fulfilled'
    )
    .map((result) => result.value)
    .sort((a, b) => a.date.localeCompare(b.date));
};
