import React, { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import PubSub from 'pubsub-js';

import GoogleLogin from '../components/GoogleLogin';
import { gapiOAuthClientId } from '../config';

// Open it
export const OPEN_DRAWER_TOPIC = 'menudrawer.open';
// Open or close it according to the state
export const OPEN_CLOSE_DRAWER_TOPIC = 'menudrawer.openclose';

const MenuDrawer = (props) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const openDrawerSubscriber = (msg) => {
      setDrawerVisible(true);
    };

    const openCloseDrawerSubscriber = (msg) => {
      setDrawerVisible(!drawerVisible);
    };

    const openDrawerToken = PubSub.subscribe(
      OPEN_DRAWER_TOPIC,
      openDrawerSubscriber
    );
    const openCloseDrawerToken = PubSub.subscribe(
      OPEN_CLOSE_DRAWER_TOPIC,
      openCloseDrawerSubscriber
    );

    return () => {
      PubSub.unsubscribe(openDrawerToken);
      PubSub.unsubscribe(openCloseDrawerToken);
    };
  }, [drawerVisible]);

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  return (
    <div className='menu-drawer'>
      <Drawer
        className='menu-drawer'
        width={'50%'}
        title='This is a drawer'
        placement='left'
        closable={false}
        forceRender
        open={drawerVisible}
        onClose={handleDrawerClose}
      >
        <GoogleLogin
          clientId={gapiOAuthClientId}
          onLoginSuccess={props.onLoginSuccess}
          onRenderFinish={props.onRenderFinish}
          onSignedOut={props.onSignedOut}
        />
      </Drawer>
    </div>
  );
};

export default MenuDrawer;
