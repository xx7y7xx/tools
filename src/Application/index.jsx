import React, { Component } from 'react';

import {
  // initGa,
  initGapiClient,
} from './init';
import Warning from './Warning';
import Map from './Map';
import SearchTrain from './searchTrain';

// Styles for application
import './index.css';

export default class Application extends Component {
  state = {
    gapiLoaded: false, // Google API loaded or not
    gapiClientLoading: false,
  };

  componentDidMount() {
    this.initApplication();
  }

  initApplication = () => {
    // initGa();

    // window.gapiLoadedFlag is defined in public/index.html
    // This flag is true only when Google API's platform.js is loaded, then we can use window.gapi
    if (window.gapiLoadedFlag) {
      this.setState({
        gapiLoaded: true,
      });
      this.loadGapiClient();
    }
  };

  loadGapiClient = () => {
    this.setState({
      gapiClientLoading: true,
    });
    initGapiClient().then(() => {
      this.setState({
        gapiClientLoading: false,
      });
    });
  };

  render() {
    if (!this.state.gapiLoaded) {
      return <Warning />;
    }

    if (this.state.gapiClientLoading) {
      return <div>gapi client lib is loading</div>;
    }

    const urlParams = new URLSearchParams(window.location.search);

    return (
      <div className='application xx7y7xx-tools'>
        <Map />
        {urlParams.get('app') === 'trainSearch' ? (
          <SearchTrain date={urlParams.get('date')} />
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
}
