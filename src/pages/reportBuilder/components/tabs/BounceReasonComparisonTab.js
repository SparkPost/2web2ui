import React from 'react';
import { useSparkPostQuery } from 'src/hooks';
import { ApiErrorBanner, Loading } from 'src/components';
import { Panel } from 'src/components/matchbox';
import {
  DELIVERABILITY_BOUNCE_METRIC_KEYS,
  BOUNCE_BY_DOMAIN_METRIC_KEYS,
} from 'src/config/metrics';
import { getMetricsFromKeys, getFilterByComparison } from 'src/helpers/metrics';
import { getBounceReasonByDomain, getDeliverability } from 'src/helpers/api/metrics';
import { selectReasons, selectFormattedAggregates } from 'src/selectors/bounceReport';
import { BounceReasonTable } from '../tables';
import { usePrepareReportBuilderQuery } from 'src/hooks';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import { TAB_LOADING_HEIGHT } from '../../constants';

export default function BounceReasonComparisonTab({ comparison }) {
  const {
    aggregatesQuery,
    bounceReasonsQuery,
    isPending,
    isError,
    reasons,
    aggregates,
  } = useQueriesWithComparison(comparison);

  function handleReload() {
    bounceReasonsQuery.refetch();
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

  return <BounceReasonTable reasons={reasons} aggregates={aggregates} loading={false} />;
}

/**
 * Prepares request parameters using common hooks, then leverages helper functions to determine which `metrics` are passed as arguments to each request.
 *
 * @param {Object} comparison - passed in comparison set by the user via the "Compare By" feature
 *
 */
function useQueriesWithComparison(comparison) {
  const { state: reportOptions } = useReportBuilderContext();
  const deliverabilityMetrics = getMetricsFromKeys(DELIVERABILITY_BOUNCE_METRIC_KEYS);
  const bounceReasonMetrics = getMetricsFromKeys(BOUNCE_BY_DOMAIN_METRIC_KEYS);
  const existingFilters = reportOptions.filters ? reportOptions.filters : [];
  const comparisonFilter = getFilterByComparison(comparison);
  const aggregatesParams = usePrepareReportBuilderQuery({
    ...reportOptions,
    filters: [...existingFilters, comparisonFilter],
    metrics: deliverabilityMetrics,
  });
  const bounceReasonParams = usePrepareReportBuilderQuery({
    ...reportOptions,
    filters: [...existingFilters, comparisonFilter],
    metrics: bounceReasonMetrics,
  });
  const bounceReasonsQuery = useSparkPostQuery(() => getBounceReasonByDomain(bounceReasonParams));
  const aggregatesQuery = useSparkPostQuery(() => getDeliverability(aggregatesParams));

  return {
    aggregatesQuery,
    bounceReasonsQuery,
    isPending: bounceReasonsQuery.status === 'loading' || aggregatesQuery.status === 'loading',
    isError: bounceReasonsQuery.status === 'error' || aggregatesQuery.status === 'error',
    // This re-structuring using the `bounceReport` key is a holdover from Redux - could we refactor these selectors to be less opinionated?
    reasons:
      bounceReasonsQuery.status === 'success'
        ? selectReasons({ bounceReport: { reasons: bounceReasonsQuery.data } })
        : [],
    aggregates:
      aggregatesQuery.status === 'success'
        ? selectFormattedAggregates({
            bounceReport: { aggregates: aggregatesQuery.data[0] },
          })
        : [],
  };
}
