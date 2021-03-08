import React, { useMemo } from 'react';
import styled from 'styled-components';
import { getDeliverability } from 'src/helpers/api/metrics';
import { getMetricsFromKeys, getFilterByComparison, transformData } from 'src/helpers/metrics';
import { getFilterTypeLabel } from 'src/pages/reportBuilder/helpers';
import { LegendCircle, Unit } from 'src/components';
import Divider from 'src/components/divider';
import { Box, Columns, Column, Text, LabelValue, Stack } from 'src/components/matchbox';
import { useSparkPostQuery, usePrepareReportBuilderQuery } from 'src/hooks';
import TextTooltip from 'src/components/TextTooltip/TextTooltip';
import { useIndustryBenchmark } from 'src/hooks/reportBuilder';
import { INDUSTRY_BENCHMARK_METRICS_MAP } from 'src/config/metrics';

const MetricsGrid = styled.div`
  display: inline-grid;
  width: 100%;
  grid-gap: ${props => props.theme.space['200']};
  grid-template-columns: 1fr;

  @media (min-width: ${props => props.theme.breakpoints[0]}) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: ${props => props.theme.breakpoints[1]}) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`;

export default function CompareByAggregatedRow({ comparison, reportOptions, hasDivider }) {
  const { metrics } = reportOptions;
  const aggregatedMetrics = getMetricsFromKeys(metrics, true);
  const requestParams = usePrepareRequestParams({ comparison, reportOptions });
  const { status, data } = useSparkPostQuery(() => getDeliverability(requestParams), {
    refetchOnWindowFocus: false,
  });

  const { data: industryBenchmarkData } = useIndustryBenchmark(reportOptions);

  const industryBenchmarkAvgRate = useMemo(() => {
    if (!industryBenchmarkData || !Boolean(industryBenchmarkData.length)) {
      return undefined;
    }

    return industryBenchmarkData
      .reduce(
        (sumArray, current) => {
          return [sumArray[0] + current.q25, sumArray[1] + current.q75];
        },
        [0, 0],
      )
      .map(total => (total * 100) / industryBenchmarkData.length);
  }, [industryBenchmarkData]);

  if (status === 'loading' || status === 'error') return null;

  const transformedData = transformData([data[0]], aggregatedMetrics);
  const renderedData = aggregatedMetrics.map(({ key, label, unit, stroke }) => {
    return {
      label,
      value: transformedData[0][key],
      key,
      unit,
      stroke,
    };
  });
  const hasData = Boolean(renderedData.length) && Boolean(metrics.length);

  return (
    <Stack>
      <Columns collapseBelow="sm">
        <Column width={1 / 6}>
          <LabelValue dark>
            <LabelValue.Label>{getFilterTypeLabel(comparison.type)}</LabelValue.Label>

            <LabelValue.Value>
              <TextTooltip bg="white" color="gray.800">
                {comparison.value}
              </TextTooltip>
            </LabelValue.Value>
          </LabelValue>
        </Column>

        {hasData ? (
          <Column>
            <MetricsGrid data-id="metrics-grid">
              {renderedData.map((metric, metricIndex) => {
                const { label, key, stroke, unit, value } = metric;

                return (
                  <Stack key={`aggregated-metric-${key}-${metricIndex}`}>
                    <LabelValue dark>
                      <LabelValue.Label>{label}</LabelValue.Label>

                      <LabelValue.Value>
                        <Box display="flex" alignItems="center">
                          {stroke ? <LegendCircle marginRight="200" color={stroke} /> : null}
                          <Unit value={value} unit={unit} />
                          {INDUSTRY_BENCHMARK_METRICS_MAP[key] &&
                            Boolean(industryBenchmarkAvgRate) && (
                              <Text fontWeight="light" ml="300">
                                (<Unit value={industryBenchmarkAvgRate[0]} unit={unit} /> -{' '}
                                <Unit value={industryBenchmarkAvgRate[1]} unit={unit} />)
                              </Text>
                            )}
                        </Box>
                      </LabelValue.Value>
                    </LabelValue>
                  </Stack>
                );
              })}
            </MetricsGrid>
          </Column>
        ) : null}
      </Columns>

      {hasDivider ? <Divider /> : null}
    </Stack>
  );
}

/**
 * Prepares network request parameters based on existing report state and the current comparison.
 *
 * @param {Object} comparison - comparison stemming from a user's selection of active comparisons. Used to derive a relevant network request for this particular comparison.
 * @param {Object} reportOptions - `reportOptions` derived from report builder state.
 *
 */
function usePrepareRequestParams({ comparison, reportOptions }) {
  const existingFilters = reportOptions.filters ? reportOptions.filters : [];
  const comparisonFilter = getFilterByComparison(comparison);
  const params = usePrepareReportBuilderQuery({
    ...reportOptions,
    filters: [...existingFilters, comparisonFilter],
  });

  return params;
}
