import React from 'react';
import * as Sentry from '@sentry/react';

// import { initGa } from './init';
import SearchTrain from './searchTrain';
import Setting from './Settings';

// Styles for application
import './index.css';

Sentry.init({
  dsn: 'https://f2bd9c0de1e6390cad39e357298557bd@o4507702515662848.ingest.us.sentry.io/4507702518874112',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.browserProfilingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/googleapis\.com\/api/],
  // Profiling
  profilesSampleRate: 1.0, // Profile 100% of the transactions. This value is relative to tracesSampleRate
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

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
              <a href="/tools?app=trainSearch">TrainSearch</a>
            </div>
          </div>
        );
    }
  };

  return <div className="application xx7y7xx-tools">{appSwitch()}</div>;
}
