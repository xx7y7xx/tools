import { Github } from '@db-man/github';
import { message } from 'antd';

import { getJsonFileContent } from '../helpers/filesApiHelpers';
import { TrainsFullInfoMapType } from '../RailwayTool/types';
import { deleteDatabaseAsync, openAsync } from '../helpers/indexedDBHelpers';
import {
  dbName,
  trainsMetaDataTableName,
  trainsTableName,
  trainsTableKeyPath,
  trainsMetaDataTableKeyPath,
  version,
  trainsFullInfoMapFileName,
} from '../trainsDbCfg';
import {
  LS_GITHUB_OWNER_KEY,
  LS_GITHUB_REPO_KEY,
  LS_PERSONAL_ACCESS_TOKEN_KEY,
} from '../RailwayTool/constants';

export const deleteAndCreateDatabaseAsync = async (dbName: string) => {
  await deleteDatabaseAsync(dbName);
  await createDatabaseAsync(dbName);
};

const createDatabaseAsync = async (dbName: string) => {
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

    // create `checis` table
    db.createObjectStore('checis', {
      keyPath: 'checi',
    });
  };

  const db = await openAsync(dbName, version, {
    onupgradeneeded,
  });

  return db;
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
  if (!date.match(/^\d{8}$/)) {
    throw new Error('Date must be in YYYYMMDD format');
  }

  message.info(`Downloading trains data from Google Drive for date ${date}`);

  try {
    const fileName = `trainsFullInfoMap_${date}.json`;
    const fileData = await getJsonFileContent(folderId, fileName);

    console.debug('[TrainSearch] Downloaded file data:', fileName, fileData);
    message.success(`Successfully downloaded ${fileName}`);

    return fileData as TrainsFullInfoMapType;
  } catch (error) {
    console.error('Error downloading train data:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    message.error(`Failed to download train data: ${errorMessage}`);
    throw error;
  }
};

export const downloadTrainsDataFromGithub = async (date: string) => {
  const github = new Github({
    personalAccessToken: localStorage.getItem(LS_PERSONAL_ACCESS_TOKEN_KEY),
    owner: localStorage.getItem(LS_GITHUB_OWNER_KEY),
    repoName: localStorage.getItem(LS_GITHUB_REPO_KEY),
  });

  const files = await github.getContentByPath(`/${date}`);

  // when calling getContentByPath with a file as path param, it returns an object instead of an array
  if (!Array.isArray(files)) {
    throw new Error(
      `downloadTrainsDataFromGithub: Expected an array of files for the path "/${date}", but received an object. Please check if the provided path is a directory.`
    );
  }

  let sha;
  files.forEach((file) => {
    if (file.name === trainsFullInfoMapFileName) {
      sha = file.sha;
    }
  });

  if (!sha) {
    throw new Error(
      `downloadTrainsDataFromGithub: Expected to find ${trainsFullInfoMapFileName} in the path "/${date}", but did not find it.`
    );
  }

  const res = await github.getBlobContentAndSha(sha);
  return res.content as unknown as TrainsFullInfoMapType;
};

export const saveTrainsToIndexedDBAsync = async (
  date: string,
  trainsFullInfoMap: TrainsFullInfoMapType
) => {
  const db = await openAsync(dbName, version);

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

const saveChecisToIndexedDBAsync = async (checis: string[]) => {
  const db = await openAsync(dbName, version);
  const dataObjectStore = db
    .transaction('checis', 'readwrite')
    .objectStore('checis');
  checis.forEach((checi) => {
    dataObjectStore.add({ checi });
  });
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

export const downloadAndSaveWholeTimeRangeCheciListOnlyCheciData = async (
  folderId: string
) => {
  message.info('Downloading checis from Google Drive');
  const fileData = (await getJsonFileContent(
    folderId,
    'wholeTimeRangeCheciListOnlyCheci.json'
  )) as string[];
  message.success(`Downloaded ${fileData.length} checis`);

  message.info('Saving checis to indexeddb');
  await saveChecisToIndexedDBAsync(fileData);
  message.success('All checis added to indexeddb successfully');
};
