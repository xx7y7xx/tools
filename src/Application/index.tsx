import React, { useEffect, useState } from 'react';

import {
  // initGa,
  initGapiClient,
} from './init';
import Warning from './Warning';
import SearchTrain from './searchTrain';

// Styles for application
import './index.css';
import GoogleLogin from './components/GoogleLogin';
import { getTrainsData } from './helpers/trainHelpers';

export default function Application() {
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gapiClientLoading, setGapiClientLoading] = useState(false);

  useEffect(() => {
    initApplication();
  }, []);

  const initApplication = () => {
    // initGa();

    // window.gapiLoadedFlag is defined in public/index.html
    // This flag is true only when Google API's platform.js is loaded, then we can use window.gapi
    if ((window as any).gapiLoadedFlag) {
      setGapiLoaded(true);
      loadGapiClient();
    }
  };

  const loadGapiClient = () => {
    setGapiClientLoading(true);
    initGapiClient().then(() => {
      setGapiClientLoading(false);
    });
  };

  /**
   * User success signed in Google account.
   * @param {gapi.auth2.GoogleUser} user
   */
  async function handleLoginSuccess(user: gapi.auth2.GoogleUser) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('app') === 'trainSearch') {
      getTrainsData(
        urlParams.get('folderId') || '',
        urlParams.get('date') || ''
      );
    }
  }

  if (!gapiLoaded) {
    return <Warning />;
  }

  if (gapiClientLoading) {
    return <div>gapi client lib is loading</div>;
  }

  const urlParams = new URLSearchParams(window.location.search);

  return (
    <div className='application xx7y7xx-tools'>
      <GoogleLogin onLoginSuccess={handleLoginSuccess} />
      {urlParams.get('app') === 'trainSearch' ? (
        <SearchTrain date={urlParams.get('date') || ''} />
      ) : (
        <div>
          <div>
            <a href='/tools?app=trainSearch'>TrainSearch</a>
          </div>
        </div>
      )}
    </div>
  );
}
