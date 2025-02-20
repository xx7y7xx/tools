// import ReactGA from 'react-ga';

// import { gaTrackId } from './config';

// export const initGa = () => {
//   ReactGA.initialize(gaTrackId, {
//     // debug: true,
//   });
// };

declare global {
  interface Window {
    gapi: any;
  }
}

/**
 * After gapi.client is loaded by gapi.load('client'), then you could use method like:
 * ```
 * gapi.client.request()
 * ```
 * https://github.com/google/google-api-javascript-client/blob/master/samples/simpleRequest.html
 * In this project used to get files from Google Drive
 * @returns {Promise<undefined>}
 */
export const initGapiClient = () =>
  new Promise<void>((resolve, reject) => {
    window.gapi.load('client', () => {
      resolve();
    });
  });
