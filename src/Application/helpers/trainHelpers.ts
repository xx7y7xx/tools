import { message } from 'antd';

import { TrainFullInfoType } from '../searchTrain/types';
import {
  dbName,
  trainsMetaDataTableName,
  trainsTableName,
  version,
} from '../trainsDbCfg';
import { getAllRecordsAsync, openAsync } from './indexedDBHelpers';

/**
 * Get all trains from indexedDB
 */
export const getAllTrainsAsync = async (): Promise<TrainFullInfoType[]> => {
  const db = await openAsync(dbName, version);

  if (!db.objectStoreNames.contains(trainsTableName)) {
    // throw new Error('Object store "trains" does not exist in the database.');
    message.error('Object store "trains" does not exist in the database.');
    return [];
  }

  const trains = (await getAllRecordsAsync(
    db,
    trainsTableName
  )) as TrainFullInfoType[];
  return trains;
};

/**
 * Get trains db meta data from indexedDB
 */
export const getTrainsMetaDataAsync = async () => {
  const db = await openAsync(dbName, version);

  if (!db.objectStoreNames.contains(trainsMetaDataTableName)) {
    // throw new Error('Object store "trains_meta_data" does not exist in the database.');
    message.error(
      'Object store "trains_meta_data" does not exist in the database.'
    );
    return;
  }

  const metaData = (await getAllRecordsAsync(db, trainsMetaDataTableName)) as {
    trainsDownloadedDate: string;
  }[];
  return metaData;
};

export const searchTrainByNum = (
  isExactMatch: boolean,
  trainNumber: string, // e.g. K1331
  trainNum: string // e.g. 1331
) => {
  if (!isExactMatch) {
    // "1" will match "G1" and "G12"
    return trainNumber.includes(trainNum);
  }
  // "1" will match "G1" or "K1", but not match "G12"
  const regex = new RegExp(`^[A-Z]${trainNum}$`);
  return regex.test(trainNumber);
};
