import { message } from 'antd';
import { getJsonFilesInFolder } from './filesApiHelpers';
import { files } from '../utils/gDriveFilesApi';

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
