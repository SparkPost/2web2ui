import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import {
  getInboxPlacementTest,
  getInboxPlacementByProvider,
  getInboxPlacementByRegion,
  getInboxPlacementBySendingIp,
  getInboxPlacementTestContent,
} from 'src/actions/inboxPlacement';
import { Loading } from 'src/components';
import { RedirectAndAlert } from 'src/components/globalAlert';
import { PageLink } from 'src/components/links';
import { Box, Page, Tabs } from 'src/components/matchbox';
import useTabs from 'src/hooks/useTabs';
import {
  selectTestDetailsPageError,
  selectTestDetailsPageLoading,
} from 'src/selectors/inboxPlacement';
import TestDetails from './components/TestDetails';
import TestContent from './components/TestContent';

export const TestDetailsPage = props => {
  const {
    history,
    id,
    tabIndex,
    loading,
    details,
    placementsByProvider,
    placementsByRegion,
    placementsBySendingIp,
    content,
    error,
    getInboxPlacementTest,
    getInboxPlacementByProvider,
    getInboxPlacementByRegion,
    getInboxPlacementBySendingIp,
    getInboxPlacementTestContent,
  } = props;

  const [selectedTabIndex, tabs] = useTabs(TABS, tabIndex);

  const loadTestData = useCallback(() => {
    getInboxPlacementTest(id);
    getInboxPlacementByProvider(id);
    getInboxPlacementTestContent(id);
    getInboxPlacementByRegion(id);
    getInboxPlacementBySendingIp(id);
  }, [
    getInboxPlacementTest,
    getInboxPlacementByProvider,
    getInboxPlacementTestContent,
    getInboxPlacementByRegion,
    getInboxPlacementBySendingIp,
    id,
  ]);

  useEffect(() => {
    loadTestData();
  }, [getInboxPlacementTest, id, loadTestData]);

  useEffect(() => {
    history.replace(`/inbox-placement/details/${id}/${TABS[selectedTabIndex].key}`);
  }, [history, id, selectedTabIndex]);

  const renderTabContent = () => {
    const selectedTabKey = tabs[selectedTabIndex].key;
    switch (selectedTabKey) {
      case 'content':
        return <TestContent content={content} details={details} />;
      default:
        return (
          <TestDetails
            details={details}
            placementsByProvider={placementsByProvider}
            placementsByRegion={placementsByRegion}
            placementsBySendingIp={placementsBySendingIp}
          />
        );
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <RedirectAndAlert to="/inbox-placement" alert={{ type: 'error', message: error.message }} />
    );
  }

  return (
    <Page
      breadcrumbAction={{
        as: PageLink,
        content: 'All Tests',
        to: '/inbox-placement',
      }}
      title="Inbox Placement Test Results"
    >
      <Box marginBottom="400">
        <Tabs selected={selectedTabIndex} connectBelow tabs={tabs} />
      </Box>
      {renderTabContent(selectedTabIndex)}
    </Page>
  );
};

const TABS = [
  { content: 'Test Details', key: 'details' },
  { content: 'Test Content', key: 'content' },
];

function mapStateToProps(state, props) {
  const id = props.match.params.id;
  const currentTabIndex = TABS.findIndex(({ key }) => key === props.match.params.tab);

  return {
    tabIndex: currentTabIndex > 0 ? currentTabIndex : 0,
    id,
    loading: selectTestDetailsPageLoading(state),
    error: selectTestDetailsPageError(state),
    details: state.inboxPlacement.currentTestDetails,
    placementsByProvider: state.inboxPlacement.placementsByProvider || [],
    placementsByRegion: state.inboxPlacement.placementsByRegion || [],
    placementsBySendingIp: state.inboxPlacement.placementsBySendingIp || [],
    content: state.inboxPlacement.currentTestContent || {},
  };
}

const mapDispatchToProps = {
  getInboxPlacementTest,
  getInboxPlacementByProvider,
  getInboxPlacementByRegion,
  getInboxPlacementBySendingIp,
  getInboxPlacementTestContent,
};

export default connect(mapStateToProps, mapDispatchToProps)(TestDetailsPage);
