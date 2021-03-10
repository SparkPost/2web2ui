import React from 'react';
import { REJECTIONS_BY_DOMAIN_METRIC_KEYS } from 'src/config/metrics';
import { usePrepareReportBuilderQuery, useSparkPostQuery } from 'src/hooks';
import { getRejectionReasonByDomain } from 'src/helpers/api/metrics';
import { getFilterByComparison, getMetricsFromKeys } from 'src/helpers/metrics';
import { ApiErrorBanner, Loading } from 'src/components';
import { Panel } from 'src/components/matchbox';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import { TAB_LOADING_HEIGHT } from '../../constants';
import { RejectionReasonsTable } from '../tables';

export default function RejectionReasonsTab({ comparison }) {
  const { status, data: reasons, refetch } = useQueryWithComparison(comparison);

  if (status === 'loading') {
    return <Loading minHeight={TAB_LOADING_HEIGHT} />;
  }

  if (status === 'error') {
    return (
      <Panel.Section>
        <ApiErrorBanner reload={refetch} status="muted" />
      </Panel.Section>
    );
  }

  return <RejectionReasonsTable reasons={reasons} loading={false} />;
}

/**
 * Prepares request parameters using common hooks, then leverages helper functions to determine which `metrics` are passed as arguments to each request.
 *
 * @param {Object} comparison - passed in comparison set by the user via the "Compare By" feature
 *
 */
function useQueryWithComparison(comparison) {
  const { state: reportOptions } = useReportBuilderContext();
  const existingFilters = reportOptions.filters ? reportOptions.filters : [];
  const comparisonFilter = comparison ? [getFilterByComparison(comparison)] : [];
  const rejectionMetrics = getMetricsFromKeys(REJECTIONS_BY_DOMAIN_METRIC_KEYS);
  const rejectionReasonsParams = usePrepareReportBuilderQuery({
    ...reportOptions,
    filters: [...existingFilters, ...comparisonFilter],
    metrics: rejectionMetrics,
  });
  const rejectionReasonsQuery = useSparkPostQuery(() =>
    getRejectionReasonByDomain(rejectionReasonsParams),
  );

  return rejectionReasonsQuery;
}
