import {
  files,
  filesGet,
  filesList,
  FilesListResponse,
} from '../utils/gDriveFilesApi';

const filesFields = [
  'files/imageMediaMetadata/location',
  'files/thumbnailLink',
  'files/webContentLink', // original photo link, can used in <img> tag
  'files/webViewLink', // Google Drive link to preview this photo.
].join(',');

// Sample response:
// {
//   id: "1nem5ZFB1xj3NuLT3aknYs7z4KTk6Cya6"
//   kind: "drive#file"
//   mimeType: "application/vnd.google-apps.folder"
//   name: "2020-05-21 莲石湖公园"
// }
export const getFolderInfo = async (folderId: string) =>
  await filesGet({
    fileId: folderId,
  });

/**
 * Get all photos in a folder
 * @todo Filter out the response, leave only the photos with GPS locations,
 *       maybe popup some warning about photos without GPS locations.
 * @return {Promise<import("../utils/gDriveFilesApi").FilesListResponse>}
 */
export const getPhotosInFolder = async (folderId: string) =>
  await filesList({
    q: `'${folderId}' in parents and (mimeType='image/jpeg' or mimeType='image/png')`, // get files in this folder
    // fields: "files/*", // debug
    fields: filesFields, // location and photo link
  });

/**
 * Get private "Photo Map" folder in Google Drive
 * resp = {
 *   files: [{
 *     "kind": "drive#file",
 *     "id": "1Kv...MF",
 *     "name": "Photo Map",
 *     "mimeType": "application/vnd.google-apps.folder"
 *   }]
 * }
 */
const getPhotoMapFolder = async () =>
  await filesList({
    // Find resource name is "Photo Map", type is folder
    q: "name='Photo Map' and mimeType='application/vnd.google-apps.folder'",
  });

/**
 * Get photos in private "Photo Map" folder in Google Drive
 * @export
 * @returns {Promise<import("../utils/gDriveFilesApi").File[]>} Definition for this type: https://developers.google.com/drive/api/v3/reference/files
 */
export const getPrivatePhotos = async (setMediaItems: any) => {
  const foldersResp = await getPhotoMapFolder();
  if (!foldersResp.files) {
    // Maybe there is no "Photo Map" folder in users' Google Drive
    return [];
  }
  const folderId = foldersResp.files[0].id;
  const resp = await getPhotosInFolder(folderId);
  return resp.files;
};

export const getJsonFilesInFolder = async (
  folderId: string
): Promise<FilesListResponse> =>
  await files.list({
    q: `'${folderId}' in parents and mimeType='application/json'`,
    fields: `${filesFields},files/id,files/name`,
  });

export const getJsonFileContent = async (
  folderId: string,
  fileName: string
) => {
  const response = await getJsonFilesInFolder(folderId);

  const targetFile = response.files.find((f) => f.name === fileName);

  if (!targetFile) {
    throw new Error(`File ${fileName} not found in folder`);
  }

  const fileData = await files.get({
    fileId: targetFile.id, // '1tK...74I',
    alt: 'media',
  });

  return fileData;
};

export const getAllJsonFileContentInFolder = async (folderId: string) => {
  const resp = await getJsonFilesInFolder(folderId);
  const promises = resp.files.map((file) =>
    filesGet({
      fileId: file.id,
    })
  );
  return await Promise.all(promises);
};
