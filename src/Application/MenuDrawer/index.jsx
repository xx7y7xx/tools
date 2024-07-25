import React, { Component } from 'react';
import { Drawer } from 'antd';
import PubSub from 'pubsub-js';

import GoogleLogin from '../components/GoogleLogin';
import { gapiOAuthClientId } from '../config';

// Open it
export const OPEN_DRAWER_TOPIC = 'menudrawer.open';
// Open or close it according to the state
export const OPEN_CLOSE_DRAWER_TOPIC = 'menudrawer.openclose';

export default class MenuDrawer extends Component {
  state = {
    drawerVisible: false,
  };

  componentDidMount() {
    this.addSubscribers();
  }

  componentWillUnmount() {
    this.removeSubscribers();
  }

  handleDrawerClose = () => {
    this.setVisible(false);
  };

  setVisible = (visible) => {
    this.setState({ drawerVisible: visible });
  };

  openDrawerSubscriber = (msg) => {
    this.setVisible(true);
  };

  openCloseDrawerSubscriber = (msg) => {
    this.setVisible(!this.state.drawerVisible);
  };

  addSubscribers = () => {
    this.openDrawerToken = PubSub.subscribe(
      OPEN_DRAWER_TOPIC,
      this.openDrawerSubscriber
    );
    this.openCloseDrawerToken = PubSub.subscribe(
      OPEN_CLOSE_DRAWER_TOPIC,
      this.openCloseDrawerSubscriber
    );
  };

  removeSubscribers = () => {
    PubSub.unsubscribe(this.openDrawerToken);
  };

  render() {
    const { drawerVisible } = this.state;

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
          onClose={this.handleDrawerClose}
        >
          <GoogleLogin
            clientId={gapiOAuthClientId}
            onLoginSuccess={this.props.onLoginSuccess}
            onRenderFinish={this.props.onRenderFinish}
            onSignedOut={this.props.onSignedOut}
          />
        </Drawer>
      </div>
    );
  }
}
