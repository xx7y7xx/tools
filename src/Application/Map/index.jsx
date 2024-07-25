import React, { useState } from 'react';
import { Button, message } from 'antd';
import PubSub from 'pubsub-js';

import { getJsonFilesInFolder } from '../helpers/filesListHelpers';
import Message from '../components/Message';
import MenuDrawer, { OPEN_DRAWER_TOPIC } from '../MenuDrawer';
import { files } from '../utils/gDriveFilesApi';

export default function Map(props) {
  const [state, setState] = useState({
    message: 'Rendering Google login button on left side panel...',
  });

  // GoogleLogin button render finished
  function handleRenderFinish() {
    setState({ message: '' });
  }

  /**
   * User success signed in Google account.
   * @param {gapi.auth2.GoogleUser} user
   */
  async function handleLoginSuccess(user) {
    // ReactGA.event({
    //   category: 'Auth',
    //   action: 'User login',
    // });

    setState({
      message: '',
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('app') === 'trainSearch') {
      getJsonFilesInFolder(urlParams.get('folderId')).then((resp) => {
        console.log('getJsonFilesInFolder resp', resp);
        return resp.files
          .filter(
            (f) =>
              f.name === `trainsMap_${urlParams.get('date')}.json` ||
              f.name === `trainsFullInfoMap_${urlParams.get('date')}.json`
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
                window.PM_trainsMap[f.name] = resp;
              });
          });
      });
    }
  }

  function handleSignedOut() {
    // ReactGA.event({
    //   category: 'Auth',
    //   action: 'User logout',
    // });
    message.success('Signed out');
  }

  function handleDrawerOpen() {
    PubSub.publish(OPEN_DRAWER_TOPIC);
  }

  return (
    <div className='map-wrapper'>
      <Message message={state.message} />
      <div className='menu-btn-wrapper'>
        <Button onClick={handleDrawerOpen}>Menu</Button>
      </div>
      <MenuDrawer
        selectedMap={state.selectedMap}
        onRenderFinish={handleRenderFinish}
        onLoginSuccess={handleLoginSuccess}
        onSignedOut={handleSignedOut}
      />
    </div>
  );
}
