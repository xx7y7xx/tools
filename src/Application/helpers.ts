import { message } from 'antd';
import { getJsonFilesInFolder } from './helpers/filesListHelpers';
import { files } from './utils/gDriveFilesApi';

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
