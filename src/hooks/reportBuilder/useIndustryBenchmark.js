import { useMemo } from 'react';
import { useSparkPostQuery } from 'src/hooks';
import { getIndustryBenchmark } from 'src/helpers/api/metrics';

import { getQueryFromOptionsV2, getMetricsFromKeys } from 'src/helpers/metrics';
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
    return getQueryFromOptionsV2({ ...reportOptions, metrics: formattedMetrics });
  }, [reportOptions, formattedMetrics]);

  const queryEnabled =
    Boolean(metrics?.includes('inbox_folder_rate')) && Boolean(industryBenchmarkMetric);

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
