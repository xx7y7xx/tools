import { useEffect, useState } from 'react';

import GoogleLogin from './components/GoogleLogin';
import {
  downloadAndSaveTrainsData,
  getTrainsMetaDataAsync,
} from './helpers/trainHelpers';
import Warning from './Warning';
import { initGapiClient } from './init';
import { Button } from 'antd';

const Setting = () => {
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gapiClientLoading, setGapiClientLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [metaData, setMetaData] = useState({});

  const urlParams = new URLSearchParams(window.location.search);

  const loadGapiClient = () => {
    setGapiClientLoading(true);
    initGapiClient().then(() => {
      setGapiClientLoading(false);
    });
  };

  useEffect(() => {
    // window.gapiLoadedFlag is defined in public/index.html
    // This flag is true only when Google API's platform.js is loaded, then we can use window.gapi
    if ((window as any).gapiLoadedFlag) {
      setGapiLoaded(true);
      loadGapiClient();
    }

    // get data date from meta data
    getTrainsMetaDataAsync().then((metaData) => {
      if (metaData && metaData.length > 0) {
        setMetaData(metaData[0]);
      }
    });
  }, []);

  /**
   * User success signed in Google account.
   * @param {gapi.auth2.GoogleUser} user
   */
  async function handleLoginSuccess(user: gapi.auth2.GoogleUser) {
    setDisabled(false);
  }

  const handleGetData = () => {
    downloadAndSaveTrainsData(
      urlParams.get('folderId') || '',
      urlParams.get('date') || ''
    );
  };

  if (!gapiLoaded) {
    return <Warning />;
  }

  if (gapiClientLoading) {
    return <div>gapi client lib is loading</div>;
  }

  return (
    <div>
      <GoogleLogin onLoginSuccess={handleLoginSuccess} />
      <Button disabled={disabled} onClick={handleGetData}>
        Save {urlParams.get('date')} to indexedDB
      </Button>
      <div>Meta data: {JSON.stringify(metaData)}</div>
    </div>
  );
};

export default Setting;
