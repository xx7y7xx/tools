import * as Sentry from '@sentry/react';
import { Alert } from 'antd';

// import { initGa } from './init';
import SearchTrain from './RailwayTool';
import Setting from './Settings';
import PocsagViewer from './PocsagViewer';

// Styles for application
import './index.css';

console.debug('process.env.NODE_ENV', process.env.NODE_ENV);

Sentry.init({
  dsn: 'https://f2bd9c0de1e6390cad39e357298557bd@o4507702515662848.ingest.us.sentry.io/4507702518874112',
  environment: process.env.NODE_ENV, // 'production' or 'development'
  integrations: [
    /**
     * We disable profiling because this is served on Github Pages which the custom headers are not supported (Document-Policy: js-profiling)
     * There is a discussion about migrating to Cloudflare Pages which supports custom headers, then we can enable profiling: https://github.com/orgs/community/discussions/54257#discussioncomment-9798851
     */
    // Sentry.browserTracingIntegration(),
    // Sentry.browserProfilingIntegration(),
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

// use alert in antd
const DeprecatedAlert = () => {
  return (
    <Alert
      message="We will deprecate ?app=, and replace with ?tool="
      type="warning"
    />
  );
};

export default function Application() {
  const urlParams = new URLSearchParams(window.location.search);

  // useEffect(() => {
  //   // initGa();
  // }, []);

  const appSwitch = () => {
    /**
     * We will deprecate ?app=, and replace with ?tool=
     * When user still access with ?app=, we will show a warning message
     */
    let tool = urlParams.get('app');
    if (urlParams.get('tool')) {
      tool = urlParams.get('tool');
    }

    switch (tool) {
      case 'trainSearch':
        return (
          <>
            {urlParams.get('app') && <DeprecatedAlert />}
            <SearchTrain />
          </>
        );
      case 'pocsagViewer':
        return <PocsagViewer />;
      case 'setting':
        return (
          <>
            {urlParams.get('app') && <DeprecatedAlert />}
            <Setting />
          </>
        );
      default:
        return (
          <div>
            {urlParams.get('tool') && <DeprecatedAlert />}
            <div>
              <a href="/tools?tool=trainSearch">TrainSearch</a>
            </div>
            <div>
              <a href="/tools?tool=pocsagViewer">PocsagViewer</a>
            </div>
          </div>
        );
    }
  };

  return <div className="application xxtools">{appSwitch()}</div>;
}
