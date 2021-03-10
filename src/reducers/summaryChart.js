import { getMetricsFromKeys, transformData } from 'src/helpers/metrics';
import config from 'src/config';

const initialState = {
  chartLoading: false,
  tableLoading: false,
  aggregateLoading: false,
  metrics: getMetricsFromKeys(config.summaryChart.defaultMetrics), //TODO RB CLEANUP: can probably remove metrics from redux store here since it's already in reportOptions
  precision: '',
  aggregateData: [],
  chartData: [],
  tableData: [],
  groupBy: 'aggregate',
};

export default (state = initialState, { type, payload, meta }) => {
  switch (type) {
    case 'FETCH_CHART_DATA_PENDING':
      return { ...state, chartLoading: true };

    case 'FETCH_CHART_DATA_SUCCESS':
    case 'FETCH_CHART_DATA_FAIL':
      return { ...state, chartLoading: false };

    case 'FETCH_TABLE_DATA_PENDING': {
      const {
        context: { groupBy },
      } = meta;
      return { ...state, tableLoading: true, tableData: [], groupBy };
    }

    case 'FETCH_TABLE_DATA_SUCCESS':
    case 'FETCH_TABLE_DATA_FAIL':
      return { ...state, tableLoading: false };

    case 'REFRESH_SUMMARY_CHART': {
      const { data, metrics, precision } = payload;
      return { ...state, chartData: transformData(data, metrics), metrics, precision };
    }

    case 'REFRESH_SUMMARY_TABLE': {
      const { data, metrics } = payload;
      return { ...state, tableData: transformData(data, metrics) };
    }

    case 'FETCH_AGGREGATE_DATA_PENDING': {
      return { ...state, aggregateLoading: true, aggregateData: [] };
    }

    case 'FETCH_AGGREGATE_DATA_SUCCESS': {
      const { metrics } = meta.context;
      //Transform data from [{metric1: value1, metric2: value2}]
      // to [{label: metric1FriendlyName, value1, unit}, {label: metric2FriendlyName, value: value2, unit}]
      const transformedData = transformData(payload, metrics);
      const payloadAsArrayOfObjects = metrics.map(({ key, label, unit }) => {
        return { label, value: transformedData[0][key], key, unit };
      });
      return {
        ...state,
        aggregateLoading: false,
        aggregateData: payloadAsArrayOfObjects,
      };
    }
    case 'FETCH_AGGREGATE_DATA_FAIL':
      return { ...state, aggregateLoading: false };

    default:
      return state;
  }
};
