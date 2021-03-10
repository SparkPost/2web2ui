import React, { useMemo } from 'react';
import { Button, Box, Grid, Text, Inline, LabelValue } from 'src/components/matchbox';
import { FilterAlt } from '@sparkpost/matchbox-icons';
import { Unit, LegendCircle } from 'src/components';
import { getDeliverability } from 'src/helpers/api/metrics';
import { getMetricsFromKeys, getQueryFromOptions, transformData } from 'src/helpers/metrics';
import { useSparkPostQuery } from 'src/hooks';

import styled from 'styled-components';
import { useIndustryBenchmark } from 'src/hooks/reportBuilder';
import { INDUSTRY_BENCHMARK_METRICS_MAP } from 'src/config/metrics';

const ViewFilterButton = styled(Button)`
  float: right;
  color: ${props => props.theme.colors.gray['600']};
`;

export default function AggregatedMetrics({
  date,
  showFiltersButton,
  handleClickFiltersButton,
  reportOptions,
}) {
  const { metrics } = reportOptions;
  const aggregatedMetrics = getMetricsFromKeys(metrics, true);
  const { status, data } = useSparkPostQuery(
    () => getDeliverability(getQueryFromOptions({ ...reportOptions, metrics: aggregatedMetrics })),
    {
      refetchOnWindowFocus: false,
    },
  );

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
    <Box padding="400" backgroundColor="gray.1000">
      <Grid>
        <Grid.Column sm={showFiltersButton ? 9 : 3} data-id="aggregate-metrics-date-range">
          <LabelValue dark>
            <LabelValue.Label>Date</LabelValue.Label>

            <LabelValue.Value>
              <Unit value={date} />
            </LabelValue.Value>
          </LabelValue>
        </Grid.Column>
        {showFiltersButton && (
          <>
            <Grid.Column sm={3}>
              <ViewFilterButton onClick={handleClickFiltersButton}>
                View Filters <FilterAlt size={20} />
              </ViewFilterButton>
            </Grid.Column>
            <Box height="300" width="100%">
              &nbsp;
            </Box>
          </>
        )}

        <Grid.Column sm={9}>
          <Inline space="600">
            {hasData &&
              renderedData.map(({ key, label, value, unit }) => {
                const stroke = aggregatedMetrics.find(({ key: newKey }) => {
                  return newKey === key;
                })?.stroke;

                return (
                  <Box key={`aggregated-metric-${key}`}>
                    <LabelValue dark>
                      <LabelValue.Label>{label}</LabelValue.Label>

                      <LabelValue.Value>
                        <Box display="flex" alignItems="center">
                          {stroke && <LegendCircle marginRight="200" color={stroke} />}
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
                  </Box>
                );
              })}
          </Inline>
        </Grid.Column>
      </Grid>
    </Box>
  );
}
