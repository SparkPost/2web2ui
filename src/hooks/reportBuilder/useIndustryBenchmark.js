import { useMemo } from 'react';
import { useSparkPostQuery } from 'src/hooks';
import { getIndustryBenchmark } from 'src/helpers/api/metrics';
import { INDUSTRY_BENCHMARK_METRICS_MAP } from 'src/config/metrics';

import { getQueryFromOptionsV2, getMetricsFromKeys, roundBoundaries } from 'src/helpers/metrics';
import isSameDay from 'date-fns/isSameDay';
function useIndustryBenchmark(reportOptions) {
  const {
    metrics,
    industryBenchmarkFilters: { industryCategory = 'all', mailboxProvider = 'all' } = {},
    industryBenchmarkMetric,
  } = reportOptions;

  // Prepares params for request
  const formattedMetrics = useMemo(() => {
    return getMetricsFromKeys(metrics, true);
  }, [metrics]);

  const formattedOptions = useMemo(() => {
    const { from, to } = roundBoundaries({
      from: reportOptions.from,
      to: reportOptions.to,
      precision: 'day',
    });
    return getQueryFromOptionsV2({ ...reportOptions, metrics: formattedMetrics, from, to });
  }, [reportOptions, formattedMetrics]);

  const queryEnabled = useMemo(() => {
    return (
      Boolean(metrics?.some(metric => INDUSTRY_BENCHMARK_METRICS_MAP[metric])) &&
      Boolean(industryBenchmarkMetric)
    );
  }, [metrics, industryBenchmarkMetric]);

  const { data, status } = useSparkPostQuery(
    () => {
      return getIndustryBenchmark({
        to: formattedOptions.to,
        from: formattedOptions.from,
        mailbox_provider: mailboxProvider,
        industry_category: industryCategory,
      });
    },
    {
      refetchOnWindowFocus: false,
      enabled: queryEnabled,
    },
  );

  const formattedData = useMemo(() => {
    if (status !== 'success') {
      return data;
    }
    return data.filter(({ ts }) => !isSameDay(new Date(ts), new Date())); //Removes if current day so that way it can't get data not ready yet
  }, [data, status]);

  return {
    data: queryEnabled ? formattedData : [], //If query gets enabled externally, "clears" data
    status,
    industryCategory,
    mailboxProvider,
  };
}

export default useIndustryBenchmark;
