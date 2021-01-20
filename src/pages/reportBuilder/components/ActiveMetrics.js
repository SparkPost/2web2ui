import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Inline, Tag } from 'src/components/matchbox';
import { LegendCircle } from 'src/components';
import { selectFeatureFlaggedMetrics } from 'src/selectors/metrics';
import getConfig from 'src/helpers/getConfig';
import { useReportBuilderContext } from '../context/ReportBuilderContext';

export default function ActiveMetrics({ metrics, removeMetric }) {
  const { state: reportOptions } = useReportBuilderContext();
  const featureFlaggedMetrics = useSelector(selectFeatureFlaggedMetrics);
  const { precision } = reportOptions;
  const { useMetricsRollup } = featureFlaggedMetrics;
  const metricsRollupPrecisionMap = getConfig('metricsRollupPrecisionMap');
  const precisionObj = metricsRollupPrecisionMap.find(p => p.value === precision);
  const uniqueLabel = precisionObj && useMetricsRollup ? precisionObj.uniqueLabel : '';

  if (!metrics) return null;

  return (
    <Box marginTop="100">
      <Inline space="300">
        {metrics.map(metric => {
          return (
            <MetricTag
              key={metric.name}
              metric={metric}
              uniqueLabel={uniqueLabel}
              onRemove={() => removeMetric(metric.name)}
            />
          );
        })}
      </Inline>
    </Box>
  );
}

export function MetricTag({ metric, uniqueLabel, onRemove }) {
  return (
    <Tag key={metric.name} onRemove={onRemove} data-id="metric-tag">
      <Box
        as="span"
        display="inline-flex"
        alignItems="center"
        data-id={`metric-tag-${metric.name}`}
      >
        <LegendCircle color={metric.stroke} right="9px" />
        <Box>
          {metric.isUniquePerTimePeriod && uniqueLabel
            ? `${metric.label} ${uniqueLabel}`
            : metric.label}
        </Box>
      </Box>
    </Tag>
  );
}
