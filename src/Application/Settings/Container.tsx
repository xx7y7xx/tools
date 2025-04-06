import { useEffect, useState } from 'react';
import { Button, message, Space } from 'antd';

import { dbName } from '../trainsDbCfg';
import GoogleLogin from '../components/GoogleLogin';
import { getTrainsMetaDataAsync } from '../helpers/trainHelpers';
import {
  deleteAndCreateDatabaseAsync,
  downloadAndSaveTrainsData,
  downloadAndSaveWholeTimeRangeCheciListOnlyCheciData,
} from './helpers';

const Settings = ({ date, folderId }: { date: string; folderId: string }) => {
  const [disabled, setDisabled] = useState(true);
  const [metaData, setMetaData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load trains metadata
    const loadMetaData = async () => {
      try {
        const data = await getTrainsMetaDataAsync();
        if (Array.isArray(data) && data.length > 0) {
          setMetaData(data[0]);
        }
      } catch (err) {
        console.error('Failed to load trains metadata:', err);
      }
    };

    loadMetaData();
  }, []);

  /**
   * User success signed in Google account.
   * @param {gapi.auth2.GoogleUser} user
   */
  const handleLoginSuccess = (user: gapi.auth2.GoogleUser) => {
    setDisabled(false);
  };

  const handleDownloadAndSaveTrainsData = () => {
    downloadAndSaveTrainsData(folderId, date);
  };

  const handleDeleteAndCreateDatabase = async () => {
    await deleteAndCreateDatabaseAsync(dbName);
    message.success('Database deleted and created successfully');
  };

  const handleDownloadAndSaveWholeTimeRangeCheciListOnlyCheciData = () => {
    downloadAndSaveWholeTimeRangeCheciListOnlyCheciData(folderId);
  };

  return (
    <Space direction="vertical">
      <GoogleLogin onLoginSuccess={handleLoginSuccess} />
      <Button
        disabled={disabled}
        onClick={handleDeleteAndCreateDatabase}
        type="primary"
      >
        Delete and create database
      </Button>
      <Button
        disabled={disabled}
        onClick={handleDownloadAndSaveTrainsData}
        type="primary"
      >
        Save {date} to IndexedDB
      </Button>
      <Button
        disabled={disabled}
        onClick={handleDownloadAndSaveWholeTimeRangeCheciListOnlyCheciData}
        type="primary"
      >
        Save wholeTimeRangeCheciListOnlyCheci.json to IndexedDB
      </Button>
      <div>
        <h3>Metadata:</h3>
        <pre>{JSON.stringify(metaData, null, 2)}</pre>
      </div>
    </Space>
  );
};

export default Settings;
