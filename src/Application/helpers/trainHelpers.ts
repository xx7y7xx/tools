import { message } from 'antd';
import { getJsonFilesInFolder } from './filesApiHelpers';
import { files } from '../utils/gDriveFilesApi';

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
              // save to localStorage
              // localStorage.setItem(
              //   `PM_trainsMap_${f.name}`,
              //   JSON.stringify(resp)
              // );
              // file is too large to save in localStorage
              /**
               * ```
               * Failed to execute 'setItem' on 'Storage': Setting the value of 'PM_trainsMap_trainsFullInfoMap_20240722.json' exceeded the quota.
               * ```
               * try to save to sessionStorage
               */
              // sessionStorage.setItem(
              //   `PM_trainsMap_${f.name}`,
              //   JSON.stringify(resp)
              // );
              // the same error: Failed to execute 'setItem' on 'Storage': Setting the value of 'PM_trainsMap_trainsMap_20240722.json' exceeded the quota.
              // try to save to indexedDB
              //
              // const trainsFullInfoMap = resp;
              //
              // const db = indexedDB.open('PM_trainsFullInfoMap', 1);
              // db.onsuccess = function (event) {
              //   const db = event.target.result;
              //   const transaction = db.transaction(
              //     'trainsFullInfoMap',
              //     'readwrite'
              //   );
              //   const objectStore =
              //     transaction.objectStore('trainsFullInfoMap');
              //   // const request = objectStore.put(resp, f.name);
              //   // request.onsuccess = function () {
              //   //   console.log('save to indexedDB success');
              //   // };
              //   // loop resp and save to indexedDB
              //   Object.keys(resp).forEach((key) => {
              //     const request = objectStore.put(resp[key], key);
              //     request.onsuccess = function () {
              //       console.log('save to indexedDB success', key);
              //     };
              //   });
              // };
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
