import { useMemo } from 'react';
import { getDeliverability } from 'src/helpers/api/metrics';
import { useSelector } from 'react-redux';
import { hasProductOnBillingSubscription } from 'src/helpers/conditions/account';
import { useSparkPostQueries, useSparkPostQuery } from 'src/hooks';
import {
  getMetricsFromKeys,
  getQueryFromOptions,
  transformData,
  splitDeliverabilityMetric,
} from 'src/helpers/metrics';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import _ from 'lodash';
import { GROUP_BY_CONFIG } from '../../constants';
import { useMultiCheckbox } from 'src/components/MultiCheckboxDropdown';

const DELIVERABILITY_PRODUCT = 'deliverability';

const separateCompareOptions = reportOptions => {
  const { comparisons } = reportOptions;
  if (!Boolean(comparisons.length)) {
    return [reportOptions];
  }

  return comparisons.map(compareFilter => {
    const filterType = compareFilter.type;
    const comparedFilters = [
      ...reportOptions.filters,
      { AND: { [filterType]: { eq: [compareFilter] } } },
    ];
    return { ...reportOptions, filters: comparedFilters };
  });

  // Appends each compared filter as a new filter for individual requests
};

export function useGroupByTable() {
  const {
    selectors: { selectSummaryMetricsProcessed: displayMetrics },
    state: reportOptions,
    actions: { setGroupBy },
  } = useReportBuilderContext();
  const { groupBy } = reportOptions;
  const hasD12yProduct = useSelector(state =>
    hasProductOnBillingSubscription('deliverability')(state),
  );
  const hasSendingProduct = useSelector(state =>
    hasProductOnBillingSubscription('messaging')(state),
  );

  const inboxTrackerMetrics = displayMetrics.filter(
    ({ product }) => product === DELIVERABILITY_PRODUCT,
  );
  const sendingMetrics = displayMetrics.filter(({ product }) => product !== DELIVERABILITY_PRODUCT);
  const hasInboxTrackingMetrics = Boolean(inboxTrackerMetrics.length);
  const hasSendingMetrics = Boolean(sendingMetrics.length);

  const { checkboxes, values } = useMultiCheckbox({
    checkboxes: [
      { name: 'sending', label: 'Sending' },
      { name: 'panel', label: 'Panel' },
      { name: 'seed', label: 'Seed List' },
    ],
    allowSelectAll: false,
    allowEmpty: false,
  });

  const filteredMetrics = displayMetrics.filter(metric => {
    if (metric.product === DELIVERABILITY_PRODUCT) {
      return values.includes('panel') || values.includes('seed');
    } else {
      return values.includes('sending');
    }
  });

  const reformattedMetrics = filteredMetrics.map(metric =>
    splitDeliverabilityMetric(metric, values),
  );
  const preparedOptions = getQueryFromOptions({
    ...reportOptions,
    metrics: reformattedMetrics,
    dataSource: values,
  });

  const { data = [], status, refetch } = useSparkPostQuery(
    () => getDeliverability(preparedOptions, groupBy),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(reportOptions.isReady && groupBy && reformattedMetrics.length),
    },
  );

  const formattedData = transformData(data, reformattedMetrics);

  return {
    data: formattedData,
    status,
    groupBy,
    setGroupBy,
    refetch,
    checkboxes,
    apiMetrics: reformattedMetrics,
    hasSendingMetrics,
    hasSendingProduct,
    hasInboxTrackingMetrics,
    hasD12yProduct,
  };
}

export function useCompareByGroupByTable() {
  const { checkboxes, values } = useMultiCheckbox({
    checkboxes: [
      { name: 'sending', label: 'Sending' },
      { name: 'panel', label: 'Panel' },
      { name: 'seed', label: 'Seed List' },
    ],
    allowSelectAll: false,
    allowEmpty: false,
  });
  const {
    state: reportOptions,
    actions: { setGroupBy },
  } = useReportBuilderContext();
  const { groupBy } = reportOptions;
  const { metrics, comparisons } = reportOptions;

  // Prepares params for request
  const formattedMetrics = useMemo(() => {
    return getMetricsFromKeys(metrics, true).map(metric =>
      splitDeliverabilityMetric(metric, values),
    );
  }, [metrics, values]);

  const hasD12yProduct = useSelector(state =>
    hasProductOnBillingSubscription('deliverability')(state),
  );
  const hasSendingProduct = useSelector(state =>
    hasProductOnBillingSubscription('messaging')(state),
  );

  const inboxTrackerMetrics = formattedMetrics.filter(
    ({ product }) => product === DELIVERABILITY_PRODUCT,
  );
  const sendingMetrics = formattedMetrics.filter(
    ({ product }) => product === DELIVERABILITY_PRODUCT,
  );
  const hasInboxTrackingMetrics = Boolean(inboxTrackerMetrics.length);
  const hasSendingMetrics = Boolean(sendingMetrics.length);

  const filteredMetrics = formattedMetrics.filter(metric => {
    if (metric.product === DELIVERABILITY_PRODUCT) {
      return values.includes('panel') || values.includes('seed');
    } else {
      return values.includes('sending');
    }
  });
  const reformattedMetrics = filteredMetrics.map(metric =>
    splitDeliverabilityMetric(metric, values),
  );

  const separatedOptions = separateCompareOptions(reportOptions);
  const separatedRequests = separatedOptions.map(options => {
    return () =>
      getDeliverability(
        getQueryFromOptions({ ...options, metrics: reformattedMetrics, dataSources: values }),
        groupBy,
      );
  });

  const queries = useSparkPostQueries([...separatedRequests], {
    enabled: Boolean(reportOptions.isReady && groupBy && reformattedMetrics.length),
    refetchOnWindowFocus: false,
  });

  const refetchAll = () => {
    queries.forEach(query => query.refetch());
  };

  const statuses = queries.map(query => query.status);

  const formatData = rawData => {
    if (!rawData) {
      return [];
    }

    if (!groupBy) {
      return [];
    }

    const groupKey = GROUP_BY_CONFIG[groupBy].keyName;
    // Array of objects (nested array turned to object)
    const keyedData = rawData.map(dataArray => _.keyBy(dataArray, groupKey));
    // Array of objects (unique group-by key)
    const objectKeys = _.uniqBy(_.flatten(rawData), groupKey);

    return objectKeys.reduce((acc, obj) => {
      const key = obj[groupKey];
      const newRows = comparisons.map((compareFilter, index) => {
        const currentDataCompare = keyedData[index][key] || {};
        return {
          ...currentDataCompare,
          [groupKey]: key, // Re-add key (in case it's empty. We want a row to show even if data is null as comparison value must exist)
          [compareFilter.type]: compareFilter.value, // Comparison value
        };
      });

      return [...acc, ...newRows];
    }, []);
  };

  const generatedRows = queries.every(query => query.status === 'success')
    ? transformData(formatData(queries.map(query => query.data)), formattedMetrics)
    : [];

  const comparisonType = comparisons[0].type;

  return {
    groupBy,
    setGroupBy,
    data: generatedRows,
    statuses,
    refetchAll,
    comparisonType,
    checkboxes,
    apiMetrics: reformattedMetrics,
    hasSendingMetrics,
    hasInboxTrackingMetrics,
    hasSendingProduct,
    hasD12yProduct,
  };
}
