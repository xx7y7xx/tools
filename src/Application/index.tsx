import React, { useEffect, useState } from 'react';

import {
  // initGa,
  initGapiClient,
} from './init';
import Warning from './Warning';
import SearchTrain from './searchTrain';
import GoogleLogin from './components/GoogleLogin';
import Setting from './Setting';
import { getTrainsData } from './helpers/trainHelpers';

// Styles for application
import './index.css';

export default function Application() {
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gapiClientLoading, setGapiClientLoading] = useState(false);

  useEffect(() => {
    // initGa();

    // window.gapiLoadedFlag is defined in public/index.html
    // This flag is true only when Google API's platform.js is loaded, then we can use window.gapi
    if ((window as any).gapiLoadedFlag) {
      setGapiLoaded(true);
      loadGapiClient();
    }
  }, []);

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

  const appSwitch = () => {
    switch (urlParams.get('app')) {
      case 'trainSearch':
        return <SearchTrain date={urlParams.get('date') || ''} />;
      case 'setting':
        return <Setting />;
      default:
        return (
          <div>
            <div>
              <a href='/tools?app=trainSearch'>TrainSearch</a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className='application xx7y7xx-tools'>
      <GoogleLogin onLoginSuccess={handleLoginSuccess} />
      {appSwitch()}
    </div>
  );
}
