import React, { useMemo, useState } from 'react';
import _ from 'lodash';
import { differenceInHours } from 'date-fns';
import { getLineChartFormatters } from 'src/helpers/chart';
import LineChart from 'src/components/charts/LineChart';
import { StackedLineChart } from '@sparkpost/matchbox-icons';
import METRICS_UNIT_CONFIG from 'src/config/metrics-units';
import { Box, Button, Panel, Stack, ScreenReaderOnly } from 'src/components/matchbox';
import { useModal, useSparkPostQuery } from 'src/hooks';
import { formatDateTime } from 'src/helpers/date';
import { slugToFriendly } from 'src/helpers/string';
import { getTimeSeries } from 'src/helpers/api/metrics';
import {
  getMetricsFromKeys,
  getQueryFromOptionsV2 as getQueryFromOptions,
  transformData,
} from 'src/helpers/metrics';
import { ApiErrorBanner, Unit } from 'src/components';
import EmptyCell from 'src/components/collection/EmptyCell';
import Loading from 'src/components/loading/PanelLoading';
import { Heading } from 'src/components/text';
import useIndustryBenchmark from 'src/hooks/reportBuilder/useIndustryBenchmark';
import { INDUSTRY_BENCHMARK_INDUSTRIES } from 'src/constants';
import { INDUSTRY_BENCHMARK_METRICS_MAP } from 'src/config/metrics';
import CustomTooltip from './Tooltip';
import { IndustryBenchmarkModal } from 'src/pages/reportBuilder/components/IndustryBenchmarkModal';

const DEFAULT_UNIT = 'number';

function getUniqueUnits(metrics) {
  return _.uniq(metrics.map(({ unit = DEFAULT_UNIT }) => unit));
}
export function ChartGroups(props) {
  const { reportOptions, small, showIndustryBenchmarkButton } = props;
  const { comparisons, metrics } = reportOptions;
  const industryBenchmarkMetrics = metrics.filter(metric => INDUSTRY_BENCHMARK_METRICS_MAP[metric]);
  const allowIndustryBenchmark =
    Boolean(showIndustryBenchmarkButton) && industryBenchmarkMetrics.length !== 0;
  const hasComparisons = Boolean(comparisons.length);
  const [activeChart, setActiveChart] = useState(null);
  const { closeModal, openModal, isModalOpen } = useModal();

  if (!hasComparisons) {
    return (
      <>
        {allowIndustryBenchmark && (
          <>
            <Panel.Header>
              <Panel.Action as={Button} onClick={openModal}>
                Industry Benchmark
                <Button.Icon as={StackedLineChart} marginLeft="200" />
              </Panel.Action>
            </Panel.Header>

            <IndustryBenchmarkModal
              isModalOpen={isModalOpen}
              closeModal={closeModal}
              metrics={industryBenchmarkMetrics}
            />
          </>
        )}
        <Panel.Section>
          <Charts
            activeChart={activeChart}
            setActiveChart={setActiveChart}
            id="chart"
            reportOptions={reportOptions}
            small={small}
          />
        </Panel.Section>
      </>
    );
  }

  return (
    <>
      {allowIndustryBenchmark && (
        <>
          <Panel.Header>
            <Panel.Action as={Button} onClick={openModal}>
              Industry Benchmark
              <Button.Icon as={StackedLineChart} marginLeft="200" />
            </Panel.Action>
          </Panel.Header>

          <IndustryBenchmarkModal
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            metrics={industryBenchmarkMetrics}
          />
        </>
      )}
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
                  id={`chart_group_${index}`}
                  tableCaption={`${value} Analytics Data Over Time`}
                  activeChart={activeChart}
                  setActiveChart={setActiveChart}
                  reportOptions={{ ...reportOptions, filters: comparedFilters }}
                  small={small}
                />
              </Box>
            </Stack>
          </Panel.Section>
        );
      })}
    </>
  );
}

export function Charts(props) {
  const { reportOptions, activeChart, setActiveChart, id, small, tableCaption } = props;
  const { comparisons, metrics } = reportOptions;

  // Prepares params for request
  const formattedMetrics = useMemo(() => {
    return getMetricsFromKeys(metrics, true);
  }, [metrics]);
  const formattedOptions = useMemo(() => {
    return getQueryFromOptions({ ...reportOptions, metrics: formattedMetrics });
  }, [reportOptions, formattedMetrics]);
  const { precision, to } = formattedOptions;

  const { data: industryBenchmarkData, industryCategory } = useIndustryBenchmark(reportOptions);

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
    const transformedData = transformData(rawChartData, formattedMetrics);

    if (!industryBenchmarkData) {
      return transformedData;
    }

    const industryLabel = INDUSTRY_BENCHMARK_INDUSTRIES.find(
      ({ value }) => value === industryCategory,
    )?.label;
    return transformedData.map(data => {
      const industryRate = industryBenchmarkData.find(({ ts: industryTs }) => {
        const diffInHours = differenceInHours(new Date(data.ts), new Date(industryTs));
        return diffInHours < 24 && diffInHours >= 0;
      });

      return {
        ...data,
        industry_rate: industryRate
          ? [industryRate.q25 * 100, industryRate.q75 * 100, industryLabel]
          : [undefined, undefined, undefined], //Rather than just undefined, we need to pass in this so it doesn't render 0 value
      };
    });
  }, [rawChartData, formattedMetrics, industryBenchmarkData, industryCategory]);

  const formatters = getLineChartFormatters(precision, to, { includeTimezone: true });
  //Separates the metrics into their appropriate charts
  const charts = getUniqueUnits(formattedMetrics).map(unit => ({
    metrics: formattedMetrics.filter(metric => metric.unit === unit),
    ...METRICS_UNIT_CONFIG[unit],
    unit,
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
        {charts.map((chart, index) => {
          return (
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
                unit={chart.unit}
              />

              <ScreenReaderOnlyTable
                caption={tableCaption}
                captionUnit={chart.label}
                metrics={chart.metrics}
                data={chartData}
              />
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function ScreenReaderOnlyTable({
  caption = 'Analytics Data Over Time',
  captionUnit,
  metrics,
  data,
}) {
  return (
    <ScreenReaderOnly>
      <table>
        <caption>{`${caption} by ${captionUnit}`}</caption>

        <thead>
          <tr>
            <th scope="col">Timestamp</th>

            <th scope="col">Industry Benchmark Rate</th>

            {metrics.map((metric, index) => {
              return (
                <th key={`${metric.key}-${index}`} scope="col">
                  {metric.label}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => {
            // The defensive checks are a little annoying here - is there a better way to handle this?
            const [q25 = '', q75 = '', industry = ''] = row.industry_rate || [];

            return (
              <tr key={`${row.ts}-${rowIndex}`}>
                <td>{formatDateTime(row.ts)}</td>

                <td>
                  {Boolean(q25) ? (
                    <>
                      25th percentile is {q25}%, 75th percentile is {q75}% for the{' '}
                      {slugToFriendly(industry)} industry
                    </>
                  ) : (
                    <EmptyCell />
                  )}
                </td>

                {metrics.map((metric, metricIndex) => {
                  return (
                    <td key={`${metric.key}-${rowIndex}-${metricIndex}`}>
                      <Unit value={row[metric.key]} unit={metric.unit} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScreenReaderOnly>
  );
}
