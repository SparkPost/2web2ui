import { useState, useMemo } from 'react';
import { getDeliverability } from 'src/helpers/api/metrics';
import { useSparkPostQueries } from 'src/hooks';
import {
  getMetricsFromKeys,
  getQueryFromOptionsV2 as getQueryFromOptions,
} from 'src/helpers/metrics';
import { REPORT_BUILDER_FILTER_KEY_MAP } from 'src/constants';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import _ from 'lodash';
import { GROUP_BY_CONFIG } from '../../constants';

const separateCompareOptions = reportOptions => {
  const { comparisons } = reportOptions;
  if (!Boolean(comparisons.length)) {
    return [reportOptions];
  }

  return comparisons.map(compareFilter => {
    const filterType = REPORT_BUILDER_FILTER_KEY_MAP[compareFilter.type];
    const comparedFilters = [
      ...reportOptions.filters,
      { AND: { [filterType]: { eq: [compareFilter] } } },
    ];
    return { ...reportOptions, filters: comparedFilters };
  });

  // Appends each compared filter as a new filter for individual requests
};

export default function useGroupByTable() {
  const [groupBy, setGroupBy] = useState();

  const { state: reportOptions } = useReportBuilderContext();
  const { metrics, comparisons } = reportOptions;

  // Prepares params for request
  const formattedMetrics = useMemo(() => {
    return getMetricsFromKeys(metrics, true);
  }, [metrics]);

  const separatedOptions = separateCompareOptions(reportOptions);
  const separatedRequests = separatedOptions.map(options => {
    return () =>
      getDeliverability(getQueryFromOptions({ ...options, metrics: formattedMetrics }), groupBy);
  });

  const queries = useSparkPostQueries([...separatedRequests], {
    enabled: Boolean(reportOptions.isReady && groupBy),
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

    const groupKey = GROUP_BY_CONFIG[groupBy]?.keyName;
    // Array of objects (nested array turned to object)
    const keyedData = rawData.map(dataArray => _.keyBy(dataArray, groupKey));
    // Array of objects (unique group-by key)
    const objectKeys = _.uniqBy(_.flatten(rawData), groupKey);

    return objectKeys.reduce((acc, object) => {
      const key = object[groupKey];
      const newRows = comparisons.map((compareFilter, index) => {
        const currentDataCompare = keyedData[index][key] || {};
        return {
          ...currentDataCompare,
          [groupKey]: key, //Re-add key (in case it's empty. We want a row to show even if data is null as comparison value must exist)
          [compareFilter.type]: compareFilter.value, //Comparison value
        };
      });

      return [...acc, ...newRows];
    }, []);
  };

  const generatedRows = queries.every(query => query.status === 'success')
    ? formatData(queries.map(query => query.data))
    : [];

  const comparisonType = comparisons[0].type;

  return {
    groupBy,
    setGroupBy,
    data: generatedRows,
    statuses,
    refetchAll,
    comparisonType,
  };
}
