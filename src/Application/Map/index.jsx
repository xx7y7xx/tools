import React, { Component } from 'react';
import { Button, message } from 'antd';
import PubSub from 'pubsub-js';

import { getJsonFilesInFolder } from '../helpers/filesListHelpers';
import Message from '../components/Message';
import MenuDrawer, { OPEN_DRAWER_TOPIC } from '../MenuDrawer';
import { files } from '../utils/gDriveFilesApi';

export default class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: 'Rendering Google login button on left side panel...',
    };
  }

  // GoogleLogin button render finished
  handleRenderFinish = () => {
    this.setState({ message: '' });
  };

  /**
   * User success signed in Google account.
   * @param {gapi.auth2.GoogleUser} user
   */
  handleLoginSuccess = async (user) => {
    // debug('handleLoginSuccess', user);

    // ReactGA.event({
    //   category: 'Auth',
    //   action: 'User login',
    // });

    this.setState({
      message: 'Login successfully, try to load photos in Google Drive...',
    });

    // // Load photos in private folder of login user's Google Drive
    // const privatePhotos = await getPrivatePhotos();

    this.setState({
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
  };

  handleSignedOut = () => {
    // ReactGA.event({
    //   category: 'Auth',
    //   action: 'User logout',
    // });
    message.success('Signed out');
  };

  handleDrawerOpen = () => {
    PubSub.publish(OPEN_DRAWER_TOPIC);
  };

  render() {
    const { selectedMap, message } = this.state;

    return (
      <div className='map-wrapper'>
        <Message message={message} />
        <div className='menu-btn-wrapper'>
          <Button onClick={this.handleDrawerOpen}>Menu</Button>
        </div>
        <MenuDrawer
          selectedMap={selectedMap}
          folders={this.state.folders}
          onRenderFinish={this.handleRenderFinish}
          onLoginSuccess={this.handleLoginSuccess}
          onSignedOut={this.handleSignedOut}
          onMapChange={this.handleMapChange}
        />
      </div>
    );
  }
}
