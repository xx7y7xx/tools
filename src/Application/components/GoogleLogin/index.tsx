import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import renderGoogleLoginBtn from './renderGoogleLoginBtn';
import { gapiOAuthClientId } from '../../config';
import { message } from 'antd';
import Message from '../Message';

const scopeNeeded = [
  'profile',
  'email',
  'https://www.googleapis.com/auth/drive',
  // "https://www.googleapis.com/auth/photoslibrary.readonly",
].join(' ');

const renderLoginBtn = () => {
  const googleAuth = window.gapi.auth2.getAuthInstance();

  if (googleAuth && googleAuth.isSignedIn.get()) {
    // Already signed in, hide login button.
    return null;
  }

  // TODO need to call gapi to render the button again on this empty tag
  return <div id='custom-google-login-button' />;
};

/**
 * Google Login Button
 * ## References
 * - https://developers.google.com/identity/sign-in/web/build-button#customizing_the_automatically_rendered_sign-in_button_recommended
 * - https://stackoverflow.com/questions/31610461/using-google-sign-in-button-with-react
 * - https://developers.google.com/identity/sign-in/web/reference#gapisignin2renderid_options
 */
const GoogleLogin = ({
  onLoginSuccess,
}: {
  onLoginSuccess: (user: gapi.auth2.GoogleUser) => void;
}) => {
  const [gapiAuth2Loaded, setGapiAuth2Loaded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [msg, setMsg] = useState(
    'Rendering Google login button on left side panel...'
  );

  useEffect(() => {
    let mounted = true;

    const onGapiAuth2Loaded = () => {
      console.debug('[GoogleLogin] auth2 loaded');

      if (!mounted) {
        // For example, this component loaded, but then page crashs, so this component is umounted
        console.warn('GoogleLogin is unmounted when onGapiAuth2Loaded()!');
        return;
      }

      setGapiAuth2Loaded(true);

      const auth2 = window.gapi.auth2.init({
        client_id: gapiOAuthClientId,
        scope: scopeNeeded,
      });

      renderGoogleLoginBtn(
        {
          /**
           * User success signed in Google account.
           * @param {gapi.auth2.GoogleUser} user
           */
          onLoginSuccess: (user: gapi.auth2.GoogleUser) => {
            // ReactGA.event({
            //   category: 'Auth',
            //   action: 'User login',
            // });
            if (!mounted) {
              console.warn('GoogleLogin is unmounted when onLoginSuccess()!');
            }
            setSignedIn(true);
            setMsg('');
            onLoginSuccess(user);
          },
          // GoogleLogin button render finished
          onRenderFinish: () => {
            setMsg('');
          },
        },
        auth2
      );
    };

    // https://github.com/google/google-api-javascript-client/blob/master/docs/reference.md#----gapiloadlibraries-callbackorconfig------
    window.gapi.load('auth2', onGapiAuth2Loaded);

    return () => {
      mounted = false;
    };
  }, [onLoginSuccess]);

  const handleSignOutBtnClick = () => {
    // https://developers.google.com/identity/sign-in/web/reference#gapiauth2getauthinstance
    const googleAuth = window.gapi.auth2.getAuthInstance();
    googleAuth.signOut().then(() => {
      console.debug('[GoogleLogin] User signed out by clicking button.');
      message.success('Signed out');
      // ReactGA.event({
      //   category: 'Auth',
      //   action: 'User logout',
      // });
      setSignedIn(false);
    });
  };

  const renderSignOutBtn = () => {
    if (!signedIn) {
      return null;
    }
    return (
      <button type='button' onClick={handleSignOutBtnClick}>
        Sign out
      </button>
    );
  };

  if (!gapiAuth2Loaded) {
    return (
      <div>The &quot;auth2&quot; gapi library doesn&apos;t loaded yet.</div>
    );
  }

  return (
    <div>
      <Message message={msg} />
      <span>Google Login: </span>
      {renderLoginBtn()}
      {renderSignOutBtn()}
    </div>
  );
};

GoogleLogin.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
};

export default GoogleLogin;
