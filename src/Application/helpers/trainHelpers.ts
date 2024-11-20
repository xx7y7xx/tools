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

const saveAsync = async (
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

  console.log('All trains added successfully');
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
 * @param folderId
 * @param date
 */
export const getTrainsData = async (folderId: string, date: string) => {
  getJsonFilesInFolder(folderId).then((resp) => {
    console.log('getJsonFilesInFolder resp', resp);
    resp.files
      .filter((f) => f.name === `trainsFullInfoMap_${date}.json`)
      .forEach((f) => {
        files
          .get({
            fileId: f.id, // '1tK...74I',
            alt: 'media',
          })
          .then((resp) => {
            console.log('[TrainSearch] files.get resp', f.name, resp);
            message.success(`Load ${f.name} successfully`);
            saveAsync(date, resp as TrainsFullInfoMapType);
          });
      });
  });
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
