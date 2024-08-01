import { message } from 'antd';

import { getJsonFilesInFolder } from './filesApiHelpers';
import { files } from '../utils/gDriveFilesApi';
import { TrainFullInfoType, TrainsFullInfoMapType } from '../searchTrain/types';
import {
  deleteDatabaseAsync,
  getAllRecordsAsync,
  openAsync,
} from './indexedDBHelpers';

const saveAsync = async (trainsFullInfoMap: TrainsFullInfoMapType) => {
  // remove dt_trainDb if exists
  console.log('deleteDatabase dt_trainDb');
  await deleteDatabaseAsync('dt_trainDb');
  console.log('deleteDatabase dt_trainDb done');

  // const request = indexedDB.open('dt_trainDb', 1);

  const onupgradeneeded = (event: any) => {
    // Save the IDBDatabase interface
    const db = event.target.result;

    // Create an objectStore to hold information about our trains. We're
    // going to use "trainNumber" as our key path because it's guaranteed to be
    // unique - or at least that's what I was told during the kickoff meeting.
    const objectStore = db.createObjectStore('trains', {
      keyPath: 'trainNumber',
    });

    // Create an index to search trains by trainCategory. We may have duplicates
    // so we can't use a unique index.
    objectStore.createIndex('trainCategory', 'trainCategory', {
      unique: false,
    });

    // // Create an index to search trains by email. We want to ensure that
    // // no two trains have the same email, so use a unique index.
    // objectStore.createIndex('email', 'email', { unique: true });

    // Use transaction oncomplete to make sure the objectStore creation is
    // finished before adding data into it.
    objectStore.transaction.oncomplete = () => {
      // Store values in the newly created objectStore.
      const customerObjectStore = db
        .transaction('trains', 'readwrite')
        .objectStore('trains');
      Object.keys(trainsFullInfoMap).forEach((trainNumber) => {
        customerObjectStore.add(trainsFullInfoMap[trainNumber]);
      });

      console.log('All trains added successfully');
    };
  };

  const db = await openAsync('dt_trainDb', 1, {
    onupgradeneeded,
  });

  console.log('db', db);
};

/**
 * Get all trains from indexedDB
 */
export const getAllTrainsAsync = async (): Promise<TrainFullInfoType[]> => {
  const db = await openAsync('dt_trainDb', 1);

  if (!db.objectStoreNames.contains('trains')) {
    // throw new Error('Object store "trains" does not exist in the database.');
    message.error('Object store "trains" does not exist in the database.');
  }

  const trains = (await getAllRecordsAsync(
    db,
    'trains'
  )) as TrainFullInfoType[];
  return trains;
};

/**
 * `trainsMap_20240716.json` example:
 * ```json
 * {
 *   "G1": {
 *     "date": "20240716",
 *     "from_station": "北京南",
 *     "station_train_code": "G1",
 *     "to_station": "上海",
 *     "total_num": "4",
 *     "train_no": "24000000G10I"
 *   },
 *   ...
 * }
 * ```
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
 *     "distance": "1325 "
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
      .filter(
        (f) =>
          f.name === `trainsMap_${date}.json` ||
          f.name === `trainsFullInfoMap_${date}.json`
      )
      .forEach((f) => {
        files
          .get({
            fileId: f.id, // '1tK...74I',
            alt: 'media',
          })
          .then((resp) => {
            console.log('[TrainSearch] files.get resp', f.name, resp);
            message.success(`Load ${f.name} successfully`);
            (window as any).PM_trainsMap[f.name] = resp;

            if (f.name === `trainsMap_${date}.json`) {
              // save to localStorage
              localStorage.setItem(
                `PM_trainsMap_${f.name}`,
                JSON.stringify(resp)
              );
            } else if (f.name === `trainsFullInfoMap_${date}.json`) {
              saveAsync(resp as TrainsFullInfoMapType);
            }
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
