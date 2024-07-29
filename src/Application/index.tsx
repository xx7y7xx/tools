import React from 'react';

// import { initGa } from './init';
import SearchTrain from './searchTrain';
import Setting from './Setting';

// Styles for application
import './index.css';

export default function Application() {
  const urlParams = new URLSearchParams(window.location.search);

  // useEffect(() => {
  //   // initGa();
  // }, []);

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

  return <div className='application xx7y7xx-tools'>{appSwitch()}</div>;
}
