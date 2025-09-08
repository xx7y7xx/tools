import { useEffect, useState } from 'react';

import { Warning } from '@db-man/components';
import { Card, Divider } from 'antd';

// import Warning from '../Warning';
import { initGapiClient } from '../init';
import Container from './Container';
import SetGitHub from './SetGitHub';

const Settings = () => {
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gapiClientLoading, setGapiClientLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const date = urlParams.get('date');
  const folderId = urlParams.get('folderId');

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
  }, []);

  if (!gapiLoaded) {
    return <Warning />;
  }

  if (gapiClientLoading) {
    return <div>Loading Google API client...</div>;
  }

  if (!date || !folderId) {
    return <div>params.date or params.folderId is missing</div>;
  }

  return (
    <div className="xytool-settings-page">
      <Card title="Download data from Google Drive">
        <Container date={date} folderId={folderId} />
      </Card>
      <Divider />
      <Card title="Download data from GitHub">
        <SetGitHub date={date} />
      </Card>
    </div>
  );
};

export default Settings;
