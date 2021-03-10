import React from 'react';
import { usePrepareReportBuilderQuery, useSparkPostQuery } from 'src/hooks';
import { DELIVERABILITY_DELAY_METRIC_KEYS } from 'src/config/metrics';
import { getDelayReasonByDomain, getDeliverability } from 'src/helpers/api/metrics';
import { ApiErrorBanner, Loading } from 'src/components';
import { Panel } from 'src/components/matchbox';
import { getMetricsFromKeys, getFilterByComparison } from 'src/helpers/metrics';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import { TAB_LOADING_HEIGHT } from '../../constants';
import { DelayReasonTable } from '../tables';

export default function DelayReasonsTab({ comparison }) {
  const { aggregatesQuery, delayReasonsQuery, isPending, isError } = useQueriesWithComparison(
    comparison,
  );

  function handleReload() {
    aggregatesQuery.refetch();
    delayReasonsQuery.refetch();
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

  const reasons = delayReasonsQuery.data;
  const totalAccepted = aggregatesQuery.data ? aggregatesQuery.data.count_accepted : 1;
  return <DelayReasonTable reasons={reasons} totalAccepted={totalAccepted} loading={false} />;
}

/**
 * Prepares request parameters using common hooks, then leverages helper functions to determine which `metrics` are passed as arguments to each request.
 *
 * @param {Object} comparison - passed in comparison set by the user via the "Compare By" feature
 *
 */
function useQueriesWithComparison(comparison) {
  const { state: reportOptions } = useReportBuilderContext();
  const deliverabilityMetrics = getMetricsFromKeys(DELIVERABILITY_DELAY_METRIC_KEYS);
  const existingFilters = reportOptions.filters ? reportOptions.filters : [];
  const comparisonFilter = comparison ? [getFilterByComparison(comparison)] : [];
  const aggregatesParams = usePrepareReportBuilderQuery({
    ...reportOptions,
    filters: [...existingFilters, ...comparisonFilter],
    metrics: deliverabilityMetrics,
  });
  const delayReasonsParams = usePrepareReportBuilderQuery({
    ...reportOptions,
    filters: [...existingFilters, ...comparisonFilter],
    metrics: reportOptions.metrics,
  });
  const delayReasonsQuery = useSparkPostQuery(() => getDelayReasonByDomain(delayReasonsParams));
  const aggregatesQuery = useSparkPostQuery(() => getDeliverability(aggregatesParams), {
    select: data => data[0],
  });

  return {
    aggregatesQuery,
    delayReasonsQuery,
    isPending: aggregatesQuery.status === 'loading' || delayReasonsQuery.status === 'loading',
    isError: aggregatesQuery.status === 'error' || delayReasonsQuery.status === 'error',
  };
}
