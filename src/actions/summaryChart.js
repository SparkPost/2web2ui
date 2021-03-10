import { fetch as fetchMetrics } from 'src/actions/metrics';
import {
  getQueryFromOptions,
  getQueryFromOptionsV2,
  getMetricsFromKeys,
} from 'src/helpers/metrics';
import { getRelativeDates } from 'src/helpers/date';

// second argument is only for mocking local functions that can't be otherwise mocked or spied on in jest-land
export function refreshSummaryReport(
  updates = {},
  {
    getChartData = _getChartData,
    getTableData = _getTableData,
    getAggregateData = _getAggregateData,
  } = {},
) {
  return (dispatch, getState) => {
    const { summaryChart, reportOptions } = getState();

    // if new metrics are included, convert them to their full representation from config
    if (updates.metrics) {
      updates = { ...updates, metrics: getMetricsFromKeys(updates.metrics) };
    }

    // merge together states
    const merged = {
      ...summaryChart,
      ...reportOptions,
      ...getRelativeDates(reportOptions.relativeRange),
      ...updates,
      ...getRelativeDates(updates.relativeRange, { precision: updates.precision }),
    };

    // convert new meta data into query param format
    const params = getQueryFromOptions(merged);
    const isCurrentGroupingAggregates = summaryChart.groupBy === 'aggregate';
    return Promise.all([
      dispatch(getChartData({ params, metrics: merged.metrics })),
      dispatch(getAggregateData({ params, metrics: merged.metrics, isCurrentGroupingAggregates })),
      !isCurrentGroupingAggregates && dispatch(getTableData({ params, metrics: merged.metrics })),
    ]);
  };
}

export function refreshReportBuilder(
  updates = {},
  { getTableData = _getTableDataReportBuilder, getAggregateData = _getAggregateData } = {},
) {
  return (dispatch, getState) => {
    const { summaryChart } = getState();

    // if new metrics are included, convert them to their full representation from config
    if (updates.metrics) {
      updates = { ...updates, metrics: getMetricsFromKeys(updates.metrics, true) };
    }

    // merge together states
    const merged = {
      ...summaryChart,
      ...updates,
      ...getRelativeDates(updates.relativeRange, { precision: updates.precision }),
    };

    const params = getQueryFromOptionsV2(merged);
    const isCurrentGroupingAggregates = summaryChart.groupBy === 'aggregate';
    return Promise.all([
      dispatch(getAggregateData({ params, metrics: merged.metrics, isCurrentGroupingAggregates })),
      !isCurrentGroupingAggregates && dispatch(getTableData({ params, metrics: merged.metrics })),
    ]);
  };
}

export function _getAggregateData({ params, metrics, isCurrentGroupingAggregates }) {
  return (dispatch, getState) => {
    const state = getState();

    // Get selected metrics
    const activeMetrics = metrics || state.summaryChart.metrics;

    // Gets filters and metrics for params
    if (!params) {
      params = getQueryFromOptions({ ...state.reportOptions, metrics: activeMetrics });
    }

    const options = {
      type: 'FETCH_AGGREGATE_DATA',
      path: 'deliverability',
      params,
      context: {
        metrics: activeMetrics,
      },
    };

    return dispatch(fetchMetrics(options)).then(results => {
      if (!isCurrentGroupingAggregates) {
        return;
      }
      dispatch({
        type: 'REFRESH_SUMMARY_TABLE',
        payload: {
          data: results,
          metrics: activeMetrics,
        },
      });
    });
  };
}

export function _getAggregateDataReportBuilder(updates) {
  return (dispatch, getState) => {
    const state = getState();
    const { summaryChart } = state;

    // if new metrics are included, convert them to their full representation from config
    if (updates.metrics) {
      updates = { ...updates, metrics: getMetricsFromKeys(updates.metrics, true) };
    }

    // merge together states
    const merged = {
      ...summaryChart,
      ...updates,
      ...getRelativeDates(updates.relativeRange, { precision: updates.precision }),
    };

    const isCurrentGroupingAggregates = summaryChart.groupBy === 'aggregate';
    const metrics = merged.metrics;

    let params = getQueryFromOptionsV2(merged);

    // Get selected metrics
    const activeMetrics = metrics || state.summaryChart.metrics;

    const options = {
      type: 'FETCH_AGGREGATE_DATA',
      path: 'deliverability',
      params,
      context: {
        metrics: activeMetrics,
      },
    };

    return dispatch(fetchMetrics(options)).then(results => {
      if (!isCurrentGroupingAggregates) {
        return;
      }
      dispatch({
        type: 'REFRESH_SUMMARY_TABLE',
        payload: {
          data: results,
          metrics: activeMetrics,
        },
      });
    });
  };
}

export function _getChartData({ params, metrics }) {
  const options = {
    type: 'FETCH_CHART_DATA',
    path: 'deliverability/time-series',
    params,
  };

  return dispatch =>
    dispatch(fetchMetrics(options)).then(results => {
      const payload = {
        data: results,
        precision: params.precision,
        metrics,
      };

      dispatch({ type: 'REFRESH_SUMMARY_CHART', payload });
    });
}

export function _getTableData({ params, metrics, groupBy }) {
  return (dispatch, getState) => {
    const state = getState();

    // The selected grouping
    const activeGroup = groupBy || state.summaryChart.groupBy;

    // Get selected metrics
    const activeMetrics = metrics || state.summaryChart.metrics;

    // Gets filters and metrics for params
    if (!params) {
      params = getQueryFromOptions({ ...state.reportOptions, metrics: activeMetrics });
    }

    const path = activeGroup === 'aggregate' ? 'deliverability' : `deliverability/${activeGroup}`;

    const options = {
      type: 'FETCH_TABLE_DATA',
      path,
      params,
      context: { groupBy: activeGroup },
    };

    return dispatch(fetchMetrics(options)).then(results => {
      dispatch({
        type: 'REFRESH_SUMMARY_TABLE',
        payload: {
          data: results,
          metrics: activeMetrics,
        },
      });
    });
  };
}

export function _getTableDataReportBuilder({ params, metrics, groupBy, reportOptions }) {
  return (dispatch, getState) => {
    const state = getState();

    // The selected grouping
    const activeGroup = groupBy || state.summaryChart.groupBy;

    // Get selected metrics
    const activeMetrics = metrics || state.summaryChart.metrics;

    // Gets filters and metrics for params
    if (!params && reportOptions) {
      params = getQueryFromOptionsV2({ ...reportOptions, metrics: activeMetrics });
    }

    const path = activeGroup === 'aggregate' ? 'deliverability' : `deliverability/${activeGroup}`;

    const options = {
      type: 'FETCH_TABLE_DATA',
      path,
      params,
      context: { groupBy: activeGroup },
    };

    return dispatch(fetchMetrics(options)).then(results => {
      dispatch({
        type: 'REFRESH_SUMMARY_TABLE',
        payload: {
          data: results,
          metrics: activeMetrics,
        },
      });
    });
  };
}
