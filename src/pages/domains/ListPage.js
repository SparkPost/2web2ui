import React, { useEffect } from 'react';
import { Page, Stack, Tabs } from 'src/components/matchbox';
import { PageLink } from 'src/components/links';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import Domains from './components';
import useDomains from './hooks/useDomains';
import { SENDING_DOMAINS_URL, BOUNCE_DOMAINS_URL, TRACKING_DOMAINS_URL } from './constants';
import BounceDomainsEmptyState from './components/BounceDomainsEmptyState';
import SendingDomainsEmptyState from './components/SendingDomainsEmptyState';
import SendingInfoBanner from 'src/pages/sendingDomains/components/SendingInfoBanner.js';
import BounceInfoBanner from 'src/pages/sendingDomains/components/BounceInfoBanner.js';

function DomainsPageContent(props) {
  // trackingDomains,
  // listTrackingDomains,
  // trackingDomainsListError
  const { isHibanaEnabled, isEmptyStateEnabled } = props;
  const {
    listPending,
    listSendingDomains,
    sendingDomainsListError,
    sendingDomains,
    bounceDomains,
  } = useDomains();
  const history = useHistory();
  const location = useLocation();
  // Note - passing in `PageLink` as a component here was possible, however, focus handling was breaking.
  // Additionally, the `role="tab"` works ideally with a button - so better to just do this so keyboard users
  // have some level of control over this UI. Unfortunately things are still a little funky with focus
  // handling with this component - we'll need to address this via Matchbox rather than the app!
  const TABS = [
    {
      content: 'Sending Domains',
      'data-to': SENDING_DOMAINS_URL, // Using a `data-` attribute to store the value to compare against since this ends up rendering to the DOM.
      onClick: () => history.push(SENDING_DOMAINS_URL),
    },
    {
      content: 'Bounce Domains',
      'data-to': BOUNCE_DOMAINS_URL,
      onClick: () => history.push(BOUNCE_DOMAINS_URL),
    },
    {
      content: 'Tracking Domains',
      'data-to': TRACKING_DOMAINS_URL,
      onClick: () => history.push(TRACKING_DOMAINS_URL),
    },
  ];
  const tabIndex = TABS.findIndex(tab => tab['data-to'] === location.pathname);

  useEffect(() => {
    listSendingDomains();
    // listTrackingDomains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const matchesSendingTab = useRouteMatch(SENDING_DOMAINS_URL);
  const matchesBounceTab = useRouteMatch(BOUNCE_DOMAINS_URL);
  const matchesTrackingTab = useRouteMatch(TRACKING_DOMAINS_URL);

  const renderInfoBanner = () => {
    if (listPending || !isEmptyStateEnabled || !isHibanaEnabled) {
      return;
    }

    if (matchesSendingTab && sendingDomains.length > 0) {
      return <SendingInfoBanner />;
    }

    if (matchesBounceTab && bounceDomains.length > 0) {
      return <BounceInfoBanner />;
    }
  };

  const renderTab = () => {
    if (matchesSendingTab) {
      if (isEmptyStateEnabled && sendingDomains.length === 0 && !sendingDomainsListError) {
        return <SendingDomainsEmptyState />;
      }

      return <Domains.SendingDomainsTab />;
    }

    if (matchesBounceTab) {
      if (
        isEmptyStateEnabled &&
        bounceDomains.length === 0 &&
        sendingDomains.length === 0 &&
        !sendingDomainsListError
      ) {
        return <BounceDomainsEmptyState />;
      }

      return <Domains.SendingDomainsTab renderBounceOnly />;
    }

    if (matchesTrackingTab) {
      return <Domains.TrackingDomainsTab />;
    }
  };

  const getTabType = () => {
    if (matchesSendingTab) {
      return 'sending';
    }

    if (matchesBounceTab) {
      return 'bounce';
    }

    if (matchesTrackingTab) {
      return 'tracking';
    }
  };

  return (
    <Page
      title="Domains"
      primaryAction={{
        to: `/domains/create?type=${getTabType()}`,
        content: 'Add a Domain',
        component: PageLink,
      }}
      empty={{
        trackingOnly: true,
      }}
    >
      <Stack>
        <Tabs selected={tabIndex} tabs={TABS} />
        <div>
          {/* TODO: Only show banners if not showing empty states */}
          {renderInfoBanner()}
          <TabPanel>{renderTab()}</TabPanel>
        </div>
      </Stack>
    </Page>
  );
}

export function ListPage(props) {
  return (
    <Domains.Container>
      <DomainsPageContent {...props} />
    </Domains.Container>
  );
}

function TabPanel({ children }) {
  return <div role="tabpanel">{children}</div>;
}
