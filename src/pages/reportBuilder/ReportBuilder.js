import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Error } from '@sparkpost/matchbox-icons';
import { refreshReportBuilder } from 'src/actions/summaryChart';
import { getSubscription } from 'src/actions/billing';
import { list as listSendingDomains } from 'src/actions/sendingDomains';
import { list as getSubaccountsList } from 'src/actions/subaccounts';
import { getReports } from 'src/actions/reports';
// QUESTION: What's the difference between the src/components Tabs and src/components/matchbox Tabs?
// Should one be used over the other?
import {
  Empty,
  Tabs,
  Loading,
  AggregatedMetrics,
  CompareByAggregatedMetrics,
} from 'src/components';
import { Box, Button, Tabs as MatchboxTabs, Page, Panel, Tooltip } from 'src/components/matchbox';
import {
  bounceTabMetrics,
  rejectionTabMetrics,
  delayTabMetrics,
  linksTabMetrics,
} from 'src/config/metrics';
import { parseSearchNew as parseSearch } from 'src/helpers/reports';
import { getFormattedDateRangeForAggregateData } from 'src/helpers/date';
import { selectVerifiedDomains } from 'src/selectors/sendingDomains';
import {
  Charts,
  ReportOptions,
  GroupByTable,
  SaveReportModal,
  CompareByGroupByTable,
  ReportBuilderEmptyState,
} from './components';
import {
  BounceReasonTab,
  BounceReasonComparisonTab,
  DelayReasonsTab,
  DelayReasonsComparisonTab,
  LinksTab,
  LinksComparisonTab,
  RejectionReasonsTab,
  RejectionReasonsComparisonTab,
} from './components/tabs';
import { useReportBuilderContext } from './context/ReportBuilderContext';
import { PRESET_REPORT_CONFIGS } from './constants';
import { TrackingEngagementTab, InvestigatingProblemsTab } from './components/EmptyTabs';
import { InfoBanner } from './components';
import { Heading } from 'src/components/text';

// Enable for EMPTY_STATE_TABS when SD is released
// {
//   content: (
//     <>
//       Deliverability Metrics <Rocket color={tokens.color_brand_orange} size="25" />
//     </>
//   ),
//   hashKey: 'empty-tab-deliverability',
//   onClick: () => {
//     setEmptyStateTab('empty-tab-deliverability');
//     history.push('/signals/analytics#empty-tab-deliverability'); // NOTE: Forces the <Page /> to re-render and segment gets called with the # param for the empty state
//   },
// },

export function ReportBuilder({
  chart,
  getSubscription,
  refreshReportBuilder,
  subscription,
  reports,
  reportsStatus,
  getReports,
  getSubaccountsList,
  subaccountsReady,
  listSendingDomains,
  sendingDomains,
  sendingDomainsListLoading,
}) {
  const history = useHistory();
  const showReportBuilderEmptyState = sendingDomains.length === 0;
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [showTable, setShowTable] = useState(true); // TODO: Incorporate in to the context reducer due to state interaction
  const [selectedReport, setReport] = useState(null); // TODO: Incorporate in to the context reducer due to state interaction
  const [showSaveNewReportModal, setShowSaveNewReportModal] = useState(false); // TODO: Incorporate in to the context reducer due to state interaction
  const { state: reportOptions, selectors, actions } = useReportBuilderContext();
  const location = useLocation();
  const { refreshReportOptions } = actions;
  const processedMetrics = selectors.selectSummaryMetricsProcessed;
  const summarySearchOptions = selectors.selectSummaryChartSearchOptions || {};
  const hasActiveComparisons = Boolean(reportOptions.comparisons.length);
  const isEmpty = useMemo(() => {
    return !Boolean(reportOptions.metrics && reportOptions.metrics.length);
  }, [reportOptions.metrics]);

  const showInfoBanner = !showReportBuilderEmptyState;
  const emptyStateUrlHash = location.hash.replace('#', '');
  let emptyStateTabFromUrl;

  switch (emptyStateUrlHash) {
    case 'empty-tab-tracking':
    case 'empty-tab-investigating':
      emptyStateTabFromUrl = emptyStateUrlHash;
      break;
    default:
      emptyStateTabFromUrl = 'empty-tab-tracking';
      break;
  } // safety net for invalid hash values
  const [emptyStateTab, setEmptyStateTab] = useState(emptyStateTabFromUrl);
  const EMPTY_STATE_TABS = [
    {
      content: 'Tracking Engagement',
      hashKey: 'empty-tab-tracking',
      onClick: () => {
        setEmptyStateTab('empty-tab-tracking');
        history.push('/signals/analytics#empty-tab-tracking'); // NOTE: Forces the <Page /> to re-render and segment gets called with the # param for the empty state
      },
    },
    {
      content: 'Investigating Problems',
      hashKey: 'empty-tab-investigating',
      onClick: () => {
        setEmptyStateTab('empty-tab-investigating');
        history.push('/signals/analytics#empty-tab-investigating'); // NOTE: Forces the <Page /> to re-render and segment gets called with the # param for the empty state
      },
    },
  ];
  const tabIndex = EMPTY_STATE_TABS.findIndex(tab => tab.hashKey === emptyStateTab);

  useEffect(() => {
    listSendingDomains();
    setIsFirstRender(false);
  }, [listSendingDomains]);

  useEffect(() => {
    if (reportOptions.isReady && !isEmpty) {
      refreshReportBuilder({
        ...reportOptions,
        filters: reportOptions.filters,
      });
    }
  }, [refreshReportBuilder, reportOptions, isEmpty]);

  useEffect(() => {
    getSubscription();
    //Updates subscription with reports to make sure product count is up to date
  }, [getSubscription, reports]);

  useEffect(() => {
    getSubaccountsList();
  }, [getSubaccountsList]);

  useEffect(() => {
    getReports();
  }, [getReports]);

  // Grabs report options from the URL query params (as well as report ID)
  useEffect(() => {
    const { report: reportId, ...urlOptions } = parseSearch(location.search);

    // Looks for report with report ID
    const allReports = [...reports, ...PRESET_REPORT_CONFIGS];
    const report = allReports.find(({ id }) => id === reportId);

    // Waiting on reports to load (if enabled) to finish initializing
    // Waiting on subaccounts (if using comparators) to finish initializing
    if (
      (reportId && reportsStatus !== 'success') ||
      !subaccountsReady ||
      reportOptions.isReady // Already ran once
    ) {
      return;
    }

    // If report is found from ID, consolidates reportOptions from URL and report
    if (report) {
      const reportOptions = parseSearch(report.query_string);

      setReport(report); // TODO: This needs to be incorporated in to the reducer since this causes state interaction
      refreshReportOptions({
        ...reportOptions,
        ...urlOptions,
      });
    } else {
      // Initializes w/ just URL options
      refreshReportOptions(urlOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportsStatus, reports, subaccountsReady]);

  const isMaxReports = useMemo(() => {
    const reportsProduct = subscription?.products?.find(({ product }) => product === 'reports');

    if (!reportsProduct) {
      return true;
    }
    const { limit, quantity = 0 } = reportsProduct;
    return quantity >= limit;
  }, [subscription]);

  const hasBounceMetrics = processedMetrics.some(({ key }) => {
    return bounceTabMetrics.map(({ key }) => key).includes(key);
  });
  const hasBounceTab = hasBounceMetrics && !hasActiveComparisons;
  const hasRejectionMetrics = processedMetrics.some(({ key }) => {
    return rejectionTabMetrics.map(({ key }) => key).includes(key);
  });
  const hasRejectionTab = hasRejectionMetrics && !hasActiveComparisons;
  const hasDelayMetrics = processedMetrics.some(({ key }) => {
    return delayTabMetrics.map(({ key }) => key).includes(key);
  });
  const hasDelayTab = hasDelayMetrics && !hasActiveComparisons;
  const hasLinksMetrics = processedMetrics.some(({ key }) => {
    return linksTabMetrics.map(({ key }) => key).includes(key);
  });
  const hasLinksTab = hasLinksMetrics && !hasActiveComparisons;

  const tabs = useMemo(() => {
    /**
     * For each type of relevant metrics that could render a tab,
     * loop through active comparisons and add rendered tabs depending on the metrics selected by the end user
     */
    function getComparisonTabs() {
      let comparisonTabs = [];

      if (hasBounceMetrics) {
        reportOptions.comparisons.forEach(comparison => {
          comparisonTabs.push({
            content: `Bounce Reason ${comparison.value}`,
            onClick: () => setShowTable(false),
          });
        });
      }

      if (hasRejectionMetrics) {
        reportOptions.comparisons.forEach(comparison => {
          comparisonTabs.push({
            content: `Rejection Reason ${comparison.value}`,
            onClick: () => setShowTable(false),
          });
        });
      }

      if (hasDelayMetrics) {
        reportOptions.comparisons.forEach(comparison => {
          comparisonTabs.push({
            content: `Delay Reason ${comparison.value}`,
            onClick: () => setShowTable(false),
          });
        });
      }

      if (hasLinksMetrics) {
        reportOptions.comparisons.forEach(comparison => {
          comparisonTabs.push({
            content: `Links ${comparison.value}`,
            onClick: () => setShowTable(false),
          });
        });
      }

      return comparisonTabs;
    }

    return [
      { content: 'Report', onClick: () => setShowTable(true) },
      hasBounceTab && { content: 'Bounce Reason', onClick: () => setShowTable(false) },
      hasRejectionTab && { content: 'Rejection Reason', onClick: () => setShowTable(false) },
      hasDelayTab && { content: 'Delay Reason', onClick: () => setShowTable(false) },
      hasLinksTab && { content: 'Links', onClick: () => setShowTable(false) },
      ...getComparisonTabs(),
    ].filter(Boolean);
  }, [
    hasBounceMetrics,
    hasRejectionMetrics,
    hasDelayMetrics,
    hasLinksMetrics,
    hasBounceTab,
    hasRejectionTab,
    hasDelayTab,
    hasLinksTab,
    reportOptions.comparisons,
  ]);

  useEffect(() => {
    setShowTable(true);
  }, [tabs]);

  const { to, from } = summarySearchOptions;
  const dateValue = getFormattedDateRangeForAggregateData(from, to);

  if (!reportOptions.isReady) {
    return <Loading />;
  }

  function getPrimaryArea() {
    return (
      <Box display="flex" alignItems="center">
        {isMaxReports && (
          <Tooltip
            id="reports_limit_tooltip"
            content="Your account has reached its limit on custom saved reports. You either need to delete a report or upgrade your plan."
          >
            <div tabIndex="0" data-id="reports-limit-tooltip-icon">
              <Error color="gray.700" />
            </div>
          </Tooltip>
        )}
        <Button
          ml="300"
          disabled={isMaxReports}
          variant="primary"
          onClick={() => setShowSaveNewReportModal(true)}
        >
          Save New Report
        </Button>
      </Box>
    );
  }

  return (
    <Page
      title={!showReportBuilderEmptyState ? 'Analytics Report' : null}
      primaryArea={!showReportBuilderEmptyState ? getPrimaryArea() : null}
      empty={{
        trackingOnly: showReportBuilderEmptyState,
      }}
      loading={sendingDomainsListLoading && isFirstRender}
    >
      {/* EMPTY STATE */}
      {showReportBuilderEmptyState && (
        <>
          <ReportBuilderEmptyState />
          <Heading as="h2" mb="400" mt="100">
            Example Analytics
          </Heading>
          <MatchboxTabs selected={tabIndex} tabs={EMPTY_STATE_TABS} keyboardActivation="auto" />
          {tabIndex === 0 && <TrackingEngagementTab />}
          {tabIndex === 1 && <InvestigatingProblemsTab />}
          {/* {selectedEmptyStateTab === 2 && <DeliverabilityMetricsTab />} */}
        </>
      )}

      {showInfoBanner && <InfoBanner />}

      {/* NON-EMPTY STATE */}
      {!showReportBuilderEmptyState && (
        <>
          <Panel>
            <ReportOptions
              selectedReport={selectedReport}
              setReport={setReport}
              reportLoading={chart.chartLoading}
              searchOptions={summarySearchOptions}
            />
          </Panel>
          <Panel>
            {isEmpty ? (
              <Empty message="No Data" description="Must select at least one metric." />
            ) : (
              <div data-id="summary-chart">
                <Tabs defaultTabIndex={0} forceRender tabs={tabs}>
                  <Tabs.Item>
                    <Charts {...chart} metrics={processedMetrics} to={to} yScale="linear" />

                    {hasActiveComparisons ? (
                      <CompareByAggregatedMetrics date={dateValue} reportOptions={reportOptions} />
                    ) : (
                      <AggregatedMetrics
                        date={dateValue}
                        processedMetrics={selectors.selectSummaryMetricsProcessed}
                      />
                    )}
                  </Tabs.Item>

                  {hasBounceTab && (
                    <Tabs.Item>
                      <BounceReasonTab />
                    </Tabs.Item>
                  )}

                  {hasRejectionTab && (
                    <Tabs.Item>
                      <RejectionReasonsTab />
                    </Tabs.Item>
                  )}

                  {hasDelayTab && (
                    <Tabs.Item>
                      <DelayReasonsTab />
                    </Tabs.Item>
                  )}

                  {hasLinksTab && (
                    <Tabs.Item>
                      <LinksTab />
                    </Tabs.Item>
                  )}

                  {hasBounceMetrics &&
                    hasActiveComparisons &&
                    reportOptions.comparisons.map((comparison, index) => {
                      return (
                        <Tabs.Item key={`tab-bounce-${comparison.value}-${index}`}>
                          <BounceReasonComparisonTab comparison={comparison} />
                        </Tabs.Item>
                      );
                    })}

                  {hasLinksMetrics &&
                    hasActiveComparisons &&
                    reportOptions.comparisons.map((comparison, index) => {
                      return (
                        <Tabs.Item key={`tab-links-${comparison.value}-${index}`}>
                          <LinksComparisonTab comparison={comparison} />
                        </Tabs.Item>
                      );
                    })}

                  {hasDelayMetrics &&
                    hasActiveComparisons &&
                    reportOptions.comparisons.map((comparison, index) => {
                      return (
                        <Tabs.Item key={`tab-delay-${comparison.value}-${index}`}>
                          <DelayReasonsComparisonTab comparison={comparison} />
                        </Tabs.Item>
                      );
                    })}

                  {hasRejectionMetrics &&
                    hasActiveComparisons &&
                    reportOptions.comparisons.map((comparison, index) => {
                      return (
                        <Tabs.Item key={`tab-rejection-${comparison.value}-${index}`}>
                          <RejectionReasonsComparisonTab comparison={comparison} />
                        </Tabs.Item>
                      );
                    })}

                  {/* TODO: compare by rejections, delays, and links tabs can go here */}
                </Tabs>
              </div>
            )}
          </Panel>
        </>
      )}
      {!showReportBuilderEmptyState && showTable && (
        <div data-id="summary-table">
          {hasActiveComparisons ? <CompareByGroupByTable /> : <GroupByTable />}
        </div>
      )}
      <SaveReportModal
        create
        open={showSaveNewReportModal}
        setReport={setReport}
        onCancel={() => setShowSaveNewReportModal(false)}
      />
    </Page>
  );
}

// Redux
const mapStateToProps = state => ({
  chart: state.summaryChart,
  reports: state.reports.list,
  reportsStatus: state.reports.status,
  subaccountsReady: state.subaccounts.ready,
  subscription: state.billing.subscription,
  sendingDomains: selectVerifiedDomains(state),
  sendingDomainsListLoading: state.sendingDomains.listLoading,
});

const mapDispatchToProps = {
  refreshReportBuilder,
  getSubscription,
  getReports,
  getSubaccountsList,
  listSendingDomains,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportBuilder);
