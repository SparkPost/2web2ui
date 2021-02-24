import React, { useMemo, useState } from 'react';
import _ from 'lodash';
import { getLineChartFormatters } from 'src/helpers/chart';
import LineChart from 'src/components/charts/LineChart';
import METRICS_UNIT_CONFIG from 'src/config/metrics-units';
import { Box, Stack, Panel } from 'src/components/matchbox';
import { useSparkPostQuery } from 'src/hooks';
import { getTimeSeries } from 'src/helpers/api/metrics';
import {
  getMetricsFromKeys,
  getQueryFromOptionsV2 as getQueryFromOptions,
  transformData,
} from 'src/helpers/metrics';
import { ApiErrorBanner } from 'src/components';
import Loading from 'src/components/loading/PanelLoading';
import { Heading } from 'src/components/text';
import CustomTooltip from './Tooltip';

const DEFAULT_UNIT = 'number';

function getUniqueUnits(metrics) {
  return _.uniq(metrics.map(({ unit = DEFAULT_UNIT }) => unit));
}
export function ChartGroups(props) {
  const { reportOptions, small } = props;
  const { comparisons } = reportOptions;
  const hasComparisons = Boolean(comparisons.length);
  const [activeChart, setActiveChart] = useState(null);

  if (!hasComparisons) {
    return (
      <Panel.Section>
        <Charts
          activeChart={activeChart}
          setActiveChart={setActiveChart}
          id="chart"
          reportOptions={reportOptions}
          small={small}
        />
      </Panel.Section>
    );
  }

  return (
    <>
      {comparisons.map((compareFilter, index) => {
        const { type, value } = compareFilter;
        // Appends each compared filter as a new filter for individual requests
        const comparedFilters = [
          ...reportOptions.filters,
          { AND: { [type]: { eq: [compareFilter] } } },
        ];
        return (
          <Panel.Section key={`chart_group_${index}`}>
            <Stack>
              <Box>
                <Heading looksLike="h5" as="h3">
                  {value}
                </Heading>
              </Box>
              <Box>
                <Charts
                  activeChart={activeChart}
                  setActiveChart={setActiveChart}
                  id={`chart_group_${index}`}
                  reportOptions={{ ...reportOptions, filters: comparedFilters }}
                  small={small}
                />
              </Box>{' '}
            </Stack>
          </Panel.Section>
        );
      })}
    </>
  );
}

export function Charts(props) {
  const { reportOptions, activeChart, setActiveChart, id, small } = props;
  const { comparisons, metrics } = reportOptions;

  // Prepares params for request
  const formattedMetrics = useMemo(() => {
    return getMetricsFromKeys(metrics, true);
  }, [metrics]);
  const formattedOptions = useMemo(() => {
    return getQueryFromOptions({ ...reportOptions, metrics: formattedMetrics });
  }, [reportOptions, formattedMetrics]);
  const { precision, to } = formattedOptions;

  // API request
  const { data: rawChartData, status: chartStatus, refetch: refetchChart } = useSparkPostQuery(
    () => {
      return getTimeSeries(formattedOptions);
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const chartData = useMemo(() => {
    return transformData(rawChartData, formattedMetrics);
  }, [rawChartData, formattedMetrics]);

  const formatters = getLineChartFormatters(precision, to, { includeTimezone: true });
  //Separates the metrics into their appropriate charts
  const charts = getUniqueUnits(formattedMetrics).map(unit => ({
    metrics: formattedMetrics.filter(metric => metric.unit === unit),
    ...METRICS_UNIT_CONFIG[unit],
  }));
  let height = 150;

  switch (charts.length * (comparisons.length || 1)) {
    case 1:
      height = 400;
      if (small) height = 200;
      break;
    case 2:
      height = 200;
      break;
    default:
      break;
  }

  if (chartStatus === 'loading' || chartStatus === 'idle') {
    return <Loading as={Box} minHeight="200px" />;
  }

  if (chartStatus === 'error') {
    return (
      <ApiErrorBanner
        reload={refetchChart}
        status="muted"
        title="Unable to load report"
        message="Please try again"
      />
    );
  }

  return (
    <Box>
      <Stack>
        {charts.map((chart, index) => (
          <Box key={`chart-${index}`} onMouseOver={() => setActiveChart(`${id}_chart_${index}`)}>
            <LineChart
              height={height}
              syncId="summaryChart"
              data={chartData}
              precision={precision}
              showTooltip={activeChart === `${id}_chart_${index}`}
              lines={chart.metrics.map(({ name, label, stroke }) => ({
                key: name,
                dataKey: name,
                name: label,
                stroke,
              }))}
              {...formatters}
              yTickFormatter={chart.yAxisFormatter}
              yLabel={chart.label}
              tooltipValueFormatter={chart.yAxisFormatter}
              showXAxis={index === charts.length - 1}
              tooltip={CustomTooltip}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
