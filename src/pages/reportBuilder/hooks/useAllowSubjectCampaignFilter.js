import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useReportBuilderContext } from '../context/ReportBuilderContext';
import { list as METRICS_LIST } from 'src/config/metrics';
import { hasProductOnBillingSubscription } from 'src/helpers/conditions/account';

export default function useAllowSubjectCampaignFilter() {
  const {
    state: { metrics },
  } = useReportBuilderContext();
  const hasD12yProduct = useSelector(state =>
    hasProductOnBillingSubscription('deliverability')(state),
  );

  const d12yMetricsMap = useMemo(
    () =>
      METRICS_LIST.reduce((accumulator, metric) => {
        if (metric.product === 'deliverability') {
          return accumulator.set(metric.key, true);
        }
        return accumulator;
      }, new Map()),
    //Creates a hashmap with the d12y metrics as keys.
    [],
  );

  //Only allow subject campaign filter when every metric is d12y and the user has the d12y product
  const allowSubjectCampaignFilter = useMemo(() => {
    const hasOnlyD12yMetrics = metrics.every(metric => d12yMetricsMap.has(metric));
    return hasOnlyD12yMetrics && hasD12yProduct;
  }, [metrics, hasD12yProduct, d12yMetricsMap]);

  return allowSubjectCampaignFilter;
}
