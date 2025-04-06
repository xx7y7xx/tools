import { message } from 'antd';

import { TrainFullInfoType } from '../searchTrain/types';
import {
  checisTableName,
  dbName,
  trainsMetaDataTableName,
  trainsTableName,
} from '../trainsDbCfg';
import { getTableRecordsAsync } from './db';

/**
 * Get all trains from indexedDB
 */
export const getAllTrainsAsync = async (): Promise<TrainFullInfoType[]> => {
  try {
    const trains = (await getTableRecordsAsync(
      dbName,
      trainsTableName
    )) as TrainFullInfoType[];
    return trains;
  } catch (err) {
    message.error(`Failed to get all trains: ${err}`);
    return [];
  }
};

/**
 * Get trains db meta data from indexedDB
 */
export const getTrainsMetaDataAsync = async () => {
  try {
    const metaData = (await getTableRecordsAsync(
      dbName,
      trainsMetaDataTableName
    )) as {
      trainsDownloadedDate: string;
    }[];
    return metaData;
  } catch (err) {
    message.error(`Failed to get trains meta data: ${err}`);
    return [];
  }
};

export const getAllChecisAsync = async () => {
  try {
    /**
     * Example:
     * ```json
     * [
     *   { checi: '1461' },
     *   { checi: '1462' },
     *   ...
     * ]
     * ```
     */
    const checis = await getTableRecordsAsync(dbName, checisTableName);

    return checis.map((checi) => checi.checi) as string[];
  } catch (error) {
    message.error(`Failed to get all checis: ${error}`);
    return [];
  }
};

export const searchTrainByNum = (
  isExactMatch: boolean,
  trainNumber: string, // e.g. K1331
  trainNum: string // e.g. 1331
) => {
  if (!isExactMatch) {
    // "123" will match "G123" and "G1234"
    return trainNumber.includes(trainNum);
  }
  // "123" will match "G123" or "K123" or "123", but not match "G1234"
  const regex = new RegExp(`^([A-Z])?${trainNum}$`);
  return regex.test(trainNumber);
};
