import React from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';
import { AuthenticationGate, SuspensionAlerts } from 'src/components/auth';
import { CookieConsent, GlobalAlertWrapper, BoomerangBanner, SiftScience } from 'src/components';
import VisualWebsiteOptimizer from './components/vwo/VisualWebsiteOptimizer';
import Segment from './components/segment/Segment';
import Support from 'src/components/support/Support';
import GoogleTagManager from 'src/components/googleTagManager/GoogleTagManager';
import Layout from 'src/components/layout/Layout';
import AppRoutes from 'src/components/appRoutes';
import GlobalBanner from 'src/context/GlobalBanner';

import config from 'src/config';

import { BrowserRouter } from 'react-router-dom';
const isbot = require('isbot');
const App = ({ RouterComponent = BrowserRouter }) => (
  <>
    <RouterComponent>
      <div>
        {config.siftScience && <SiftScience config={config.siftScience} />}
        <BoomerangBanner />
        {config.gtmId && <GoogleTagManager id={config.gtmId} />}
        <VisualWebsiteOptimizer />
        {!isbot(window.navigator.userAgent) && <Segment />}
        <AuthenticationGate />
        <SuspensionAlerts />
        <CookieConsent />
        <GlobalBanner>
          <Layout>
            <AppRoutes />
          </Layout>
        </GlobalBanner>
        <Support />
        <GlobalAlertWrapper />
      </div>
    </RouterComponent>

    <ReactQueryDevtools initialIsOpen={false} />
  </>
);

export default App;
