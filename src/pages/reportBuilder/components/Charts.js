import React, { useMemo } from 'react';
import _ from 'lodash';
import { getLineChartFormatters } from 'src/helpers/chart';
import LineChart from './LineChart';
import METRICS_UNIT_CONFIG from 'src/config/metrics-units';
import { Box, Stack } from 'src/components/matchbox';
import { tokens } from '@sparkpost/design-tokens-hibana';
import { useSparkPostQuery } from 'src/hooks';
import { getTimeSeries } from 'src/helpers/api';
import { transformData } from 'src/helpers/metrics';
import { useReportBuilderContext } from '../context/ReportBuilderContext';
import { getMetricsFromKeys, getQueryFromOptions } from '../../../helpers/metrics';
const DEFAULT_UNIT = 'number';

function getUniqueUnits(metrics) {
  return _.uniq(metrics.map(({ unit = DEFAULT_UNIT }) => unit));
}

export default function ChartGroup() {
  const { state: reportOptions } = useReportBuilderContext();
  return <Charts reportOptions={reportOptions} />;
}

export function Charts(props) {
  const { reportOptions } = props;

  const formattedMetrics = useMemo(() => {
    return getMetricsFromKeys(reportOptions.metrics);
  }, [reportOptions.metrics]);
  const formattedOptions = useMemo(() => {
    return getQueryFromOptions({ ...reportOptions, metrics: formattedMetrics });
  }, [reportOptions, formattedMetrics]);

  const { data: rawChartData, status: chartStatus } = useSparkPostQuery(
    () => {
      return getTimeSeries(formattedOptions);
    },
    { enabled: reportOptions.isReady, initialData: [] },
  );

  const chartData = useMemo(() => {
    return transformData(rawChartData, formattedMetrics);
  }, [rawChartData, formattedMetrics]);

  const { precision, yScale, to } = props;

  // Keeps track of hovered chart for Tooltip
  const [activeChart, setActiveChart] = React.useState(null);

  if (!chartData.length || !formattedMetrics) {
    return null;
  }

  const formatters = getLineChartFormatters(precision, to);

  //Separates the metrics into their appropriate charts
  const charts = getUniqueUnits(formattedMetrics).map(unit => ({
    metrics: formattedMetrics.filter(metric => metric.unit === unit),
    ...METRICS_UNIT_CONFIG[unit],
  }));

  let height = 150;
  switch (charts.length) {
    case 1:
      height = 400;
      break;
    case 2:
      height = 200;
      break;
    default:
      break;
  }

  return (
    <Stack>
      {charts.map((chart, i) => (
        <Box key={`chart-${i}`} onMouseOver={() => setActiveChart(i)}>
          <LineChart
            height={height}
            syncId="summaryChart"
            data={chartData}
            precision={precision}
            showTooltip={activeChart === i}
            lines={chart.metrics.map(({ name, label, stroke }) => ({
              key: name,
              dataKey: name,
              name: label,
              stroke: chartStatus === 'loading' ? tokens.color_gray_100 : stroke,
            }))}
            {...formatters}
            yTickFormatter={chart.yAxisFormatter}
            yScale={yScale}
            yLabel={chart.label}
            tooltipValueFormatter={chart.yAxisFormatter}
            showXAxis={i === charts.length - 1}
          />
        </Box>
      ))}
    </Stack>
  );
}
