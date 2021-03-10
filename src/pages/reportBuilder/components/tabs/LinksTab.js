import React from 'react';
import { useSparkPostQuery, usePrepareReportBuilderQuery } from 'src/hooks';
import { DELIVERABILITY_LINKS_METRIC_KEYS, LINKS_BY_DOMAIN_METRIC_KEYS } from 'src/config/metrics';
import { ApiErrorBanner, Loading } from 'src/components';
import { Panel } from 'src/components/matchbox';
import { getMetricsFromKeys, getFilterByComparison } from 'src/helpers/metrics';
import { getEngagement, getDeliverability } from 'src/helpers/api/metrics';
import { LinksTable } from '../tables';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import { TAB_LOADING_HEIGHT } from '../../constants';

export default function LinksTab({ comparison }) {
  const { aggregatesQuery, linksQuery, isPending, isError } = useQueriesWithComparison(comparison);

  function handleReload() {
    linksQuery.refetch();
    aggregatesQuery.refetch();
  }

  if (isPending) {
    return <Loading minHeight={TAB_LOADING_HEIGHT} />;
  }

  if (isError) {
    return (
      <Panel.Section>
        <ApiErrorBanner reload={handleReload} status="muted" />
      </Panel.Section>
    );
  }

  return (
    <LinksTable
      links={linksQuery.data}
      totalClicks={aggregatesQuery.data.count_clicked}
      loading={false}
    />
  );
}

/**
 * Prepares request parameters using common hooks, then leverages helper functions to determine which `metrics` are passed as arguments to each request.
 *
 * @param {Object} comparison - passed in comparison set by the user via the "Compare By" feature
 *
 */
function useQueriesWithComparison(comparison) {
  const { state: reportOptions } = useReportBuilderContext();
  const deliverabilityMetrics = getMetricsFromKeys(DELIVERABILITY_LINKS_METRIC_KEYS);
  const linkMetrics = getMetricsFromKeys(LINKS_BY_DOMAIN_METRIC_KEYS);
  const existingFilters = reportOptions.filters ? reportOptions.filters : [];
  const comparisonFilter = comparison ? [getFilterByComparison(comparison)] : [];
  const aggregatesArgs = usePrepareReportBuilderQuery({
    ...reportOptions,
    filters: [...existingFilters, ...comparisonFilter],
    metrics: deliverabilityMetrics,
  });
  const linkArgs = usePrepareReportBuilderQuery({
    ...reportOptions,
    filters: [...existingFilters, ...comparisonFilter],
    metrics: linkMetrics,
  });
  const linksQuery = useSparkPostQuery(() => getEngagement(linkArgs));
  const aggregatesQuery = useSparkPostQuery(() => getDeliverability(aggregatesArgs));

  return {
    aggregatesQuery,
    linksQuery,
    isPending: linksQuery.status === 'loading' || aggregatesQuery.status === 'loading',
    isError: linksQuery.status === 'error' || aggregatesQuery.status === 'error',
  };
}
