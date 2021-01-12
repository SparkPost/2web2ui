import React from 'react';
import { EmptyState, Tabs, Page } from 'src/components/matchbox';
import useTabs from 'src/hooks/useTabs';
// import { Rocket } from '@sparkpost/matchbox-icons';
import AnalyticsWebp from '@sparkpost/matchbox-media/images/Analytics.webp';
import { useHistory, useLocation } from 'react-router-dom';
import { LINKS } from 'src/constants';
import { Heading } from 'src/components/text';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';
import { TrackingEngagementTab, InvestigatingProblemsTab } from './emptyTabs';

const TABS = [
  {
    content: 'Tracking Engagement',
    trackingUrl: '/empty/tracking-engagement',
    onClick: function noRefCheck() {},
  },
  {
    content: 'Investigating Problems',
    trackingUrl: '/empty/investigating-problems',
    onClick: function noRefCheck() {},
  },
  // Enable when SD is launched
  // {
  //   content: (
  //     <>
  //       Deliverability Metrics <Rocket color="#fa6423" size="25" />
  //     </>
  //   ),
  //   trackingUrl: '/empty/deliverability-metrics',
  //   onClick: function noRefCheck() {},
  // },
];

export default function ReportBuilderEmptyState() {
  const history = useHistory();
  const location = useLocation();

  const [selectedTabIndex, tabs] = useTabs(TABS, 0);

  React.useEffect(() => {
    const trackingUrl = location.pathname + TABS[selectedTabIndex].trackingUrl;

    const trackingLocation = {
      ...location,
      pathname: trackingUrl,
    };

    segmentTrack(SEGMENT_EVENTS.EMPTY_STATE_LOADED, {
      location: trackingLocation,
    });
  }, [location, selectedTabIndex]);

  return (
    <Page>
      <EmptyState>
        <EmptyState.Header>Analytics Report</EmptyState.Header>
        <EmptyState.Content>
          <p>
            Build and save custom reports with SparkPost's easy to use dashboard. Apply unlimited
            metrics across delivery and deliverability data. To learn how to unlock the full
            potential of SparkPost's Analytics Report, visit the documentation link below.
          </p>
        </EmptyState.Content>
        <EmptyState.Image src={AnalyticsWebp} />
        <EmptyState.Action onClick={() => history.push('/domains/create')}>
          Add Sending Domain
        </EmptyState.Action>
        <EmptyState.Action variant="outline" to={LINKS.ANALYTICS_DOCS} external>
          Analytics Documentation
        </EmptyState.Action>
      </EmptyState>
      <Heading as="h2">Example Analytics</Heading>
      <Tabs selected={selectedTabIndex} tabs={tabs} keyboardActivation="auto" />
      {selectedTabIndex === 0 && <TrackingEngagementTab />}
      {selectedTabIndex === 1 && <InvestigatingProblemsTab />}
      {/* {selectedTabIndex === 2 && <DeliverabilityMetricsTab />} */}
    </Page>
  );
}
