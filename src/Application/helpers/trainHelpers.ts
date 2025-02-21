import { message } from 'antd';

import { getJsonFilesInFolder } from './filesApiHelpers';
import { files } from '../utils/gDriveFilesApi';
import { TrainFullInfoType, TrainsFullInfoMapType } from '../searchTrain/types';
import {
  deleteDatabaseAsync,
  getAllRecordsAsync,
  openAsync,
} from './indexedDBHelpers';

const dbName = 'dt_trainDb';
const trainsTableName = 'trains';
const trainsTableKeyPath = 'trainNumber';
const trainsMetaDataTableName = 'trains_meta_data';
const trainsMetaDataTableKeyPath = 'createdAt';
const version = 1;

const saveTrainsToIndexedDBAsync = async (
  date: string,
  trainsFullInfoMap: TrainsFullInfoMapType
) => {
  // before save, delete the old database
  console.log('deleteDatabase start');
  await deleteDatabaseAsync(dbName);
  console.log('deleteDatabase end');

  const onupgradeneeded: IDBOpenDBRequest['onupgradeneeded'] = (event) => {
    // Save the IDBDatabase interface
    // There's not enough type information in handler callback type provided by `dom` Typescript library. (https://stackoverflow.com/questions/75953640/how-to-get-event-target-result-in-javascript-indexdb-typescript-working)
    const db = (event.target as IDBOpenDBRequest).result;

    // Create an objectStore to hold information about our trains. We're
    // going to use "trainNumber" as our key path because it's guaranteed to be
    // unique - or at least that's what I was told during the kickoff meeting.
    const schemaObjectStore = db.createObjectStore(trainsTableName, {
      keyPath: trainsTableKeyPath,
    });

    // Create an index to search trains by trainCategory. We may have duplicates
    // so we can't use a unique index.
    schemaObjectStore.createIndex('trainCategory', 'trainCategory', {
      unique: false,
    });

    // // Create an index to search trains by email. We want to ensure that
    // // no two trains have the same email, so use a unique index.
    // schemaObjectStore.createIndex('email', 'email', { unique: true });

    // Create an objectStore to hold metadata about our trains.
    db.createObjectStore(trainsMetaDataTableName, {
      keyPath: trainsMetaDataTableKeyPath,
    });
  };

  const db = await openAsync(dbName, version, {
    onupgradeneeded,
  });

  // Store values in the newly created objectStore.
  const dataObjectStore = db
    .transaction(trainsTableName, 'readwrite')
    .objectStore(trainsTableName);
  Object.keys(trainsFullInfoMap).forEach((trainNumber) => {
    dataObjectStore.add(trainsFullInfoMap[trainNumber]);
  });

  // Store metadata in the newly created objectStore.
  db.transaction(trainsMetaDataTableName, 'readwrite')
    .objectStore(trainsMetaDataTableName)
    .add({
      [trainsMetaDataTableKeyPath]: new Date(),
      trainsDownloadedDate: date,
    });

  console.log('All trains added to indexeddb successfully');
  message.success('All trains added to indexeddb successfully');
};

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

/**
 * Downloads train data from Google Drive
 *
 * `trainsFullInfoMap_20240716.json` example:
 * ```json
 * {
 *   "G1": {
 *     "operateGroup": "上海局",
 *     "trainCategory": "复兴号(CR400BF-B型)",
 *     "trainNumber": "G1",
 *     "runTime": "4小时29分",
 *     "fromStation": "北京南站",
 *     "toStation": "上海站",
 *     "departureTime": "07:00",
 *     "arrivalTime": "11:29",
 *     "trainType": "高速动车组列车(高铁)",
 *     "distance": "1325 ",
 *
 *     "total_num": "4",
 *     "train_no": "24000000G10I"
 *   },
 *   ...
 * }
 * ```
 *
 * @param folderId - The Google Drive folder ID containing the train data files
 * @param date - The date string in YYYYMMDD format to load data for
 * @returns Promise that resolves with the downloaded train data
 * @throws Error if folder ID or date is invalid
 */
export const downloadTrainsDataFromGoogleDrive = async (
  folderId: string,
  date: string
): Promise<TrainsFullInfoMapType> => {
  if (!folderId) {
    throw new Error('Folder ID is required');
  }

  if (!date.match(/^\d{8}$/)) {
    throw new Error('Date must be in YYYYMMDD format');
  }

  message.info(
    `Downloading trains data from Google Drive folder ${folderId} for date ${date}`
  );

  try {
    const response = await getJsonFilesInFolder(folderId);
    console.log('Found files in folder:', response);

    const targetFileName = `trainsFullInfoMap_${date}.json`;
    const targetFile = response.files.find((f) => f.name === targetFileName);

    if (!targetFile) {
      throw new Error(`File ${targetFileName} not found in folder`);
    }

    const fileData = await files.get({
      fileId: targetFile.id, // '1tK...74I',
      alt: 'media',
    });

    console.debug(
      '[TrainSearch] Downloaded file data:',
      targetFile.name,
      fileData
    );
    message.success(`Successfully downloaded ${targetFile.name}`);

    return fileData as TrainsFullInfoMapType;
  } catch (error) {
    console.error('Error downloading train data:', error);
    // @ts-ignore
    message.error(`Failed to download train data: ${error.message}`);
    throw error;
  }
};

/**
 * Downloads train data from Google Drive and saves it to IndexedDB
 *
 * @param folderId - The Google Drive folder ID containing the train data files
 * @param date - The date string in YYYYMMDD format to load data for
 */
export const downloadAndSaveTrainsData = async (
  folderId: string,
  date: string
): Promise<void> => {
  const trainsData = await downloadTrainsDataFromGoogleDrive(folderId, date);
  await saveTrainsToIndexedDBAsync(date, trainsData);
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
