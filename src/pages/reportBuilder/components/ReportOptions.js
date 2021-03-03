import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Drawer,
  Expandable,
  Inline,
  Panel,
  ScreenReaderOnly,
  Stack,
} from 'src/components/matchbox';
import { Tabs, Loading } from 'src/components';
import { ActiveFilters } from 'src/components/reportBuilder';
import { useReportBuilderContext } from '../context/ReportBuilderContext';
import { parseSearchNew as parseSearch } from 'src/helpers/reports';
import { ActiveMetrics, ActiveComparisons, CompareByForm, FiltersForm, MetricsForm } from './index';
import SavedReportsSection from './SavedReportsSection';
import DateTimeSection from './DateTimeSection';
import { usePageFilters } from 'src/hooks';
import { dehydrateFilters } from '../helpers';

const drawerTabs = [{ content: 'Metrics' }, { content: 'Filters' }, { content: 'Compare' }];
const initFilters = {
  from: {},
  to: {},
  range: {},
  timezone: {},
  precision: {},
  filters: {},
  metrics: {},
  query_filters: {},
  comparisons: {},
  report: {},
};

export function ReportOptions(props) {
  const { reportLoading, selectedReport, setReport } = props;
  const { state: reportOptions, actions, selectors } = useReportBuilderContext();
  const { refreshReportOptions, removeFilter, removeComparisonFilter } = actions;
  const {
    selectSummaryMetricsProcessed: processedMetrics,
    selectSummaryChartSearchOptions,
  } = selectors;
  const { updateFilters } = usePageFilters(initFilters);

  // Updates the query params with incoming search option changes
  useEffect(() => {
    if (reportOptions.isReady) {
      const { filters: selectedFilters, ...update } = selectSummaryChartSearchOptions;
      const { filters } = reportOptions;

      update.query_filters = Boolean(filters.length)
        ? JSON.stringify(dehydrateFilters(filters))
        : null; //Explicitly unsetting filters

      if (update.range !== 'custom') {
        update.to = null;
        update.from = null;
      }

      updateFilters({ ...update, report: selectedReport?.id }, { arrayFormat: 'indices' });
    }
  }, [
    selectSummaryChartSearchOptions,
    updateFilters,
    reportOptions.isReady,
    selectedReport,
    reportOptions,
  ]);

  const { getActivatorProps, getDrawerProps, openDrawer, closeDrawer } = Drawer.useDrawer({
    id: 'report-drawer',
  });
  const [drawerTab, setDrawerTab] = useState(0);

  const handleReportChange = report => {
    if (report) {
      const options = parseSearch(report.query_string);
      //Keep time range and filters when changing to preset report from another preset report.
      if (report.type === 'preset' && (!selectedReport || selectedReport.type === 'preset')) {
        const { from, to, relativeRange, timezone, precision, filters } = reportOptions;
        const mergedOptions = { ...options, from, to, relativeRange, timezone, precision, filters };
        refreshReportOptions(mergedOptions);
      } else {
        refreshReportOptions(options);
      }
    }
    setReport(report);
  };

  const handleDrawerOpen = index => {
    setDrawerTab(index);
    openDrawer();
  };

  const handleFilterRemove = ({ groupingIndex, filterIndex, valueIndex }) => {
    return removeFilter({ groupingIndex, filterIndex, valueIndex });
  };

  const handleComparisonRemove = ({ index }) => {
    return removeComparisonFilter({ index });
  };

  const handleTimezoneSelect = useCallback(
    timezone => {
      refreshReportOptions({ timezone: timezone.value });
    },
    [refreshReportOptions],
  );

  const handleRemoveMetric = selectedMetric => {
    const updatedMetrics = reportOptions.metrics.filter(key => key !== selectedMetric);
    refreshReportOptions({ metrics: updatedMetrics });
  };

  const handleSubmit = props => {
    refreshReportOptions(props);
    closeDrawer();
  };

  if (!reportOptions.isReady) {
    return <Loading />;
  }

  return (
    <div data-id="report-options">
      <Panel.Section>
        <SavedReportsSection
          selectedReport={selectedReport}
          handleReportChange={handleReportChange}
        />
      </Panel.Section>

      <Panel.Section>
        <DateTimeSection
          reportOptions={reportOptions}
          handleTimezoneSelect={handleTimezoneSelect}
          reportLoading={reportLoading}
          refreshReportOptions={refreshReportOptions}
        />
      </Panel.Section>

      <Drawer {...getDrawerProps()} portalId="drawer-portal">
        <Drawer.Header showCloseButton>
          <ScreenReaderOnly>Report Options</ScreenReaderOnly>
        </Drawer.Header>
        <Drawer.Content p="0">
          <Tabs defaultTabIndex={drawerTab} forceRender fitted tabs={drawerTabs}>
            <Tabs.Item>
              <MetricsForm selectedMetrics={processedMetrics} handleSubmit={handleSubmit} />
            </Tabs.Item>
            <Tabs.Item>
              <FiltersForm handleSubmit={handleSubmit} />
            </Tabs.Item>
            <Tabs.Item>
              <CompareByForm handleSubmit={handleSubmit} />
            </Tabs.Item>
          </Tabs>
        </Drawer.Content>
      </Drawer>

      <Panel.Section p="0">
        <Expandable
          id="report-options-metrics-expandable"
          defaultOpen
          title="Metrics"
          variant="borderless"
        >
          <Stack>
            {Boolean(reportOptions.metrics.length) && (
              <Inline>
                <ActiveMetrics metrics={processedMetrics} removeMetric={handleRemoveMetric} />
              </Inline>
            )}

            <Box>
              <Button
                {...getActivatorProps()}
                onClick={() => handleDrawerOpen(0)}
                variant="secondary"
              >
                Add Metrics
              </Button>
            </Box>
          </Stack>
        </Expandable>
      </Panel.Section>

      <Panel.Section p="0">
        <Expandable
          id="report-options-filters-expandable"
          defaultOpen
          title="Filters"
          variant="borderless"
        >
          <Stack>
            {Boolean(reportOptions.filters.length) && (
              <ActiveFilters
                filters={reportOptions.filters}
                handleFilterRemove={handleFilterRemove}
              />
            )}
            <Box>
              <Button
                {...getActivatorProps()}
                onClick={() => {
                  handleDrawerOpen(1);
                }}
                variant="secondary"
              >
                Add Filters
              </Button>
            </Box>
          </Stack>
        </Expandable>
      </Panel.Section>

      <Panel.Section p="0">
        <Expandable
          id="report-options-comparisons-expandable"
          defaultOpen
          title="Comparisons"
          variant="borderless"
        >
          <Stack>
            {Boolean(reportOptions.comparisons.length) && (
              <ActiveComparisons
                comparisons={reportOptions.comparisons}
                handleFilterRemove={handleComparisonRemove}
              />
            )}
            <Box>
              <Button
                {...getActivatorProps()}
                onClick={() => {
                  handleDrawerOpen(2);
                }}
                variant="secondary"
              >
                Add Comparison
              </Button>
            </Box>
          </Stack>
        </Expandable>
      </Panel.Section>
    </div>
  );
}

export default ReportOptions;
