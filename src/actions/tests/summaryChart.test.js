import * as metricsActions from 'src/actions/metrics';
import * as metricsHelpers from 'src/helpers/metrics';
import * as dateHelpers from 'src/helpers/date';
import {
  refreshSummaryReport,
  _getChartData,
  _getTableData,
  _getAggregateData,
  _getAggregateDataReportBuilder,
} from '../summaryChart';

jest.mock('src/actions/metrics');
jest.mock('src/helpers/metrics');
jest.mock('src/helpers/date');

describe('Action Creator: Refresh Summary Report', () => {
  let testState;
  let dispatchMock;
  let getStateMock;
  let relativeDatesFirst;
  let relativeDatesSecond;

  const getMergedObject = () => metricsHelpers.getQueryFromOptions.mock.calls[0][0];

  beforeEach(() => {
    testState = {
      reportOptions: {},
      summaryChart: {},
    };
    getStateMock = jest.fn(() => testState);
    dispatchMock = jest.fn(a => a);

    relativeDatesFirst = {};
    relativeDatesSecond = {};

    dateHelpers.getRelativeDates
      .mockReturnValueOnce(relativeDatesFirst)
      .mockReturnValueOnce(relativeDatesSecond);
  });

  it('should return a promise', () => {
    const result = refreshSummaryReport({})(dispatchMock, getStateMock);
    expect(result).toBeInstanceOf(Promise);
  });

  it('should transform passed in metrics', () => {
    const metrics = {};
    const transformed = {};
    metricsHelpers.getMetricsFromKeys = jest.fn(() => transformed);
    refreshSummaryReport({ metrics })(dispatchMock, getStateMock);
    expect(metricsHelpers.getMetricsFromKeys).toHaveBeenCalledWith(metrics);
    expect(getMergedObject().metrics).toBe(transformed);
  });

  it('should merge report filters onto summary chart', () => {
    testState.summaryChart = {
      a: 1,
      b: 2,
    };
    testState.reportOptions = {
      b: 22,
      c: 33,
    };
    refreshSummaryReport({})(dispatchMock, getStateMock);
    expect(getMergedObject()).toEqual({
      a: 1,
      b: 22,
      c: 33,
    });
  });

  it('should re-calculate relative range and merge over reportOptions', () => {
    testState.reportOptions.to = 'a';
    relativeDatesFirst.to = 'b';
    refreshSummaryReport({})(dispatchMock, getStateMock);
    expect(getMergedObject().to).toEqual('b');
  });

  it('should merge data, but prefer values in passed in updates over other values', () => {
    testState.summaryChart = { summary: true, to: 'a' };
    testState.reportOptions = { report: true, to: 'b' };
    relativeDatesFirst.rel1 = true;
    relativeDatesFirst.to = 'c';
    refreshSummaryReport({ to: 'd', refresh: true })(dispatchMock, getStateMock);
    expect(getMergedObject()).toEqual({
      summary: true,
      report: true,
      rel1: true,
      refresh: true,
      to: 'd',
    });
  });

  it('should dispatch actions for non-aggregate data', () => {
    const metrics = [];
    const params = {};
    const getChartData = jest.fn();
    const getTableData = jest.fn();
    const getAggregateData = jest.fn();
    metricsHelpers.getMetricsFromKeys = jest.fn(() => metrics);
    metricsHelpers.getQueryFromOptions = jest.fn(() => params);
    refreshSummaryReport({ metrics }, { getChartData, getTableData, getAggregateData })(
      dispatchMock,
      getStateMock,
    );
    expect(dispatchMock).toHaveBeenCalledTimes(3);
    expect(getChartData).toHaveBeenCalledWith({ params, metrics });
    expect(getTableData).toHaveBeenCalledWith({ params, metrics });
    expect(getAggregateData).toHaveBeenCalledWith({
      params,
      metrics,
      isCurrentGroupingAggregates: false,
    });
  });

  it('should dispatch actions for aggregate', () => {
    testState.summaryChart = { groupBy: 'aggregate' };
    const metrics = [];
    const params = {};
    const getChartData = jest.fn();
    const getTableData = jest.fn();
    const getAggregateData = jest.fn();
    metricsHelpers.getMetricsFromKeys = jest.fn(() => metrics);
    metricsHelpers.getQueryFromOptions = jest.fn(() => params);
    refreshSummaryReport({ metrics }, { getChartData, getTableData, getAggregateData })(
      dispatchMock,
      getStateMock,
    );
    expect(dispatchMock).toHaveBeenCalledTimes(2);
    expect(getChartData).toHaveBeenCalledWith({ params, metrics });
    expect(getTableData).not.toHaveBeenCalled();
    expect(getAggregateData).toHaveBeenCalledWith({
      params,
      metrics,
      isCurrentGroupingAggregates: true,
    });
  });

  it('_getAggregateDataReportBuilder should dispatch the correct actions when groupBy is set to aggregate', async () => {
    testState.summaryChart = { groupBy: 'aggregate', metrics: 'metrics-args' };
    const params = {};
    metricsHelpers.getQueryFromOptionsV2 = jest.fn(() => params);
    let fetchResult = {};
    metricsActions.fetch = jest.fn(() => Promise.resolve(fetchResult));

    await _getAggregateDataReportBuilder({})(dispatchMock, getStateMock);

    expect(dispatchMock).toHaveBeenCalledTimes(2);

    expect(metricsActions.fetch).toHaveBeenCalledWith({
      type: 'FETCH_AGGREGATE_DATA',
      path: 'deliverability',
      params,
      context: { metrics: 'metrics-args' },
    });
  });

  it('_getAggregateDataReportBuilder should dispatch the correct actions when groupBy is not set to aggregate', async () => {
    testState.summaryChart = { groupBy: 'not-aggregate', metrics: 'metrics-args' };
    const params = {};
    metricsHelpers.getQueryFromOptionsV2 = jest.fn(() => params);
    let fetchResult = {};
    metricsActions.fetch = jest.fn(() => Promise.resolve(fetchResult));

    await _getAggregateDataReportBuilder({})(dispatchMock, getStateMock);

    expect(dispatchMock).toHaveBeenCalledTimes(1);

    expect(metricsActions.fetch).toHaveBeenCalledWith({
      type: 'FETCH_AGGREGATE_DATA',
      path: 'deliverability',
      params,
      context: { metrics: 'metrics-args' },
    });
  });

  describe('private action methods', () => {
    let fetchResult;

    beforeEach(() => {
      fetchResult = {};
      metricsActions.fetch = jest.fn(() => Promise.resolve(fetchResult));
    });

    test('_getChartData should dispatch the correct actions', async () => {
      const params = { precision: 'test' };
      const metrics = {};

      await _getChartData({ params, metrics })(dispatchMock);

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(metricsActions.fetch).toHaveBeenCalledWith({
        type: 'FETCH_CHART_DATA',
        path: 'deliverability/time-series',
        params,
      });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'REFRESH_SUMMARY_CHART',
        payload: {
          data: fetchResult,
          precision: 'test',
          metrics,
        },
      });
    });

    test('_getAgregateData should dispatch the correct actions when groupBy is set to aggregate', async () => {
      const params = {};
      const metrics = 'metrics-args';

      await _getAggregateData({ params, metrics, isCurrentGroupingAggregates: true })(
        dispatchMock,
        getStateMock,
      );

      expect(dispatchMock).toHaveBeenCalledTimes(2);

      expect(metricsActions.fetch).toHaveBeenCalledWith({
        type: 'FETCH_AGGREGATE_DATA',
        path: 'deliverability',
        params,
        context: { metrics: 'metrics-args' },
      });

      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'REFRESH_SUMMARY_TABLE',
        payload: {
          data: fetchResult,
          metrics: 'metrics-args',
        },
      });
    });

    test('_getAgregateData should dispatch the correct actions when groupBy is not set to aggregate', async () => {
      const params = {};
      const metrics = 'metrics-args';

      await _getAggregateData({ params, metrics, isCurrentGroupingAggregates: false })(
        dispatchMock,
        getStateMock,
      );

      expect(dispatchMock).toHaveBeenCalledTimes(1);

      expect(metricsActions.fetch).toHaveBeenCalledWith({
        type: 'FETCH_AGGREGATE_DATA',
        path: 'deliverability',
        params,
        context: { metrics: 'metrics-args' },
      });
    });

    test('_getTableData should dispatch the correct actions, with passed in args', async () => {
      const params = {};
      const groupBy = 'groupby-args';
      const metrics = 'metrics-args';

      await _getTableData({ params, groupBy, metrics })(dispatchMock, getStateMock);

      expect(dispatchMock).toHaveBeenCalledTimes(2);

      expect(metricsActions.fetch).toHaveBeenCalledWith({
        type: 'FETCH_TABLE_DATA',
        path: 'deliverability/groupby-args',
        params,
        context: { groupBy },
      });

      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'REFRESH_SUMMARY_TABLE',
        payload: {
          data: fetchResult,
          metrics: 'metrics-args',
        },
      });
    });

    test('_getTableData should dispatch the correct actions, with defaults', async () => {
      const params = {};
      testState.summaryChart.groupBy = 'groupby-state';
      testState.summaryChart.metrics = 'metrics-state';

      await _getTableData({ params })(dispatchMock, getStateMock);

      expect(dispatchMock).toHaveBeenCalledTimes(2);

      expect(metricsActions.fetch).toHaveBeenCalledWith({
        type: 'FETCH_TABLE_DATA',
        path: 'deliverability/groupby-state',
        params,
        context: { groupBy: testState.summaryChart.groupBy },
      });

      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'REFRESH_SUMMARY_TABLE',
        payload: {
          data: fetchResult,
          metrics: 'metrics-state',
        },
      });
    });

    it('should use the correct path for aggregate group', () => {
      const params = {};
      testState.summaryChart = {
        groupBy: 'aggregate',
        metrics: ['count_accepted'],
      };

      _getTableData({ params })(dispatchMock, getStateMock);

      expect(metricsActions.fetch).toHaveBeenCalledWith({
        type: 'FETCH_TABLE_DATA',
        path: 'deliverability',
        params,
        context: { groupBy: testState.summaryChart.groupBy },
      });
    });
  });
});
