import { useEffect, useState } from 'react';
import { Button } from 'antd';

import GoogleLogin from './components/GoogleLogin';
import {
  downloadAndSaveTrainsData,
  getTrainsMetaDataAsync,
} from './helpers/trainHelpers';
import Warning from './Warning';
import { initGapiClient } from './init';

const Setting = () => {
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gapiClientLoading, setGapiClientLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [metaData, setMetaData] = useState<Record<string, any>>({});

  const urlParams = new URLSearchParams(window.location.search);
  const date = urlParams.get('date') || '';
  const folderId = urlParams.get('folderId') || '';

  const loadGapiClient = async () => {
    try {
      setGapiClientLoading(true);
      await initGapiClient();
    } catch (err) {
      console.error('Failed to load GAPI client:', err);
    } finally {
      setGapiClientLoading(false);
    }
  };

  useEffect(() => {
    // window.gapiLoadedFlag is defined in public/index.html
    // This flag is true only when Google API's platform.js is loaded, then we can use window.gapi
    // Check if Google API platform.js is loaded
    if ((window as any).gapiLoadedFlag) {
      setGapiLoaded(true);
      loadGapiClient();
    }

    // Load trains metadata
    const loadMetaData = async () => {
      try {
        const data = await getTrainsMetaDataAsync();
        // @ts-ignore
        if (data?.length > 0) {
          // @ts-ignore
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

  const handleGetData = () => {
    if (!date || !folderId) {
      console.error('Date or folder ID is missing');
      return;
    }
    downloadAndSaveTrainsData(folderId, date);
  };

  if (!gapiLoaded) {
    return <Warning />;
  }

  if (gapiClientLoading) {
    return <div>Loading Google API client...</div>;
  }

  return (
    <div>
      <GoogleLogin onLoginSuccess={handleLoginSuccess} />
      <Button disabled={disabled} onClick={handleGetData} type="primary">
        Save {date} to IndexedDB
      </Button>
      <div>
        <h3>Metadata:</h3>
        <pre>{JSON.stringify(metaData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Setting;
