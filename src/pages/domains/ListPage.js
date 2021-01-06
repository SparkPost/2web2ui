import React, { useEffect, useState } from 'react';
import { Page, Stack, Tabs } from 'src/components/matchbox';
import { PageLink } from 'src/components/links';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import Domains from './components';
// import useDomains from './hooks/useDomains';
import { SENDING_DOMAINS_URL, BOUNCE_DOMAINS_URL, TRACKING_DOMAINS_URL } from './constants';
import BounceDomainsEmptyState from './components/BounceDomainsEmptyState';
import SendingDomainsEmptyState from './components/SendingDomainsEmptyState';

function DomainsPageContent() {
  // const { sendingDomains, bounceDomains, trackingDomains } = useDomains();
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
    listTrackingDomains();
    setIsFirstRender(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasSubaccounts && subaccounts?.length === 0) {
      listSubaccounts();
    }
  }, [hasSubaccounts, listSubaccounts, subaccounts]);

  const matchesSendingTab = useRouteMatch(SENDING_DOMAINS_URL);
  const matchesBounceTab = useRouteMatch(BOUNCE_DOMAINS_URL);
  const matchesTrackingTab = useRouteMatch(TRACKING_DOMAINS_URL);

  const showSendingDomainsEmptyState =
    !listPending &&
    matchesSendingTab &&
    isEmptyStateEnabled &&
    sendingDomains.length === 0 &&
    !sendingDomainsListError;

  const showBounceDomainsEmptyState =
    !listPending &&
    matchesBounceTab &&
    isEmptyStateEnabled &&
    bounceDomains.length === 0 &&
    !sendingDomainsListError;

  const showSendingInfoBanner =
    !listPending &&
    !showSendingDomainsEmptyState &&
    matchesSendingTab &&
    isEmptyStateEnabled &&
    sendingDomains.length > 0;

  const showBounceInfoBanner =
    !listPending &&
    !showBounceDomainsEmptyState &&
    matchesBounceTab &&
    isEmptyStateEnabled &&
    sendingDomains.length > 0;

  const renderInfoBanner = () => {
    if (showSendingInfoBanner) {
      return <SendingInfoBanner />;
    }

    if (showBounceInfoBanner) {
      return <BounceInfoBanner />;
    }
  };

  const renderTab = () => {
    if (matchesSendingTab) {
      if (true) {
        return <SendingDomainsEmptyState />;
      }

      // TODO: probably best to load data here and pass it into the tab, downside is sending, bounce, and tracking calls will always fire no matter what tab the user is on.
      return <Domains.SendingDomainsTab />;
    }

    if (matchesBounceTab) {
      if (true) {
        return <BounceDomainsEmptyState />;
      }

      // TODO: probably best to load data here and pass it into the tab, downside is sending, bounce, and tracking calls will always fire no matter what tab the user is on.
      return <Domains.SendingDomainsTab renderBounceOnly />;
    }

    // TODO: Get this moved through and rebase FE-1241 with master after the merge/deploy
    // https://sparkpost.atlassian.net/browse/FE-1241
    // https://github.com/SparkPost/2web2ui/pull/1990
    if (matchesTrackingTab) {
      // TODO: probably best to load data here and pass it into the tab, downside is sending, bounce, and tracking calls will always fire no matter what tab the user is on.
      return <Domains.TrackingDomainsTab />;
    }
  };

  // todo: set trackingOnly prop assignment & make sure segment only gets call once, and only when the empty states are displaying
  return (
    <Page
      title="Domains"
      primaryAction={{
        to: '/domains/create',
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
          <TabPanel>{renderTab()}</TabPanel>
        </div>
      </Stack>
    </Page>
  );
}

export default function DomainsPage() {
  return (
    <Domains.Container>
      <DomainsPageContent />
    </Domains.Container>
  );
}

function TabPanel({ children }) {
  return <div role="tabpanel">{children}</div>;
}
