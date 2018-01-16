import * as reportFilters from '../reportFilters';
import * as metrics from 'src/actions/metrics';
import { listTemplates } from 'src/actions/templates';
import { list as listSubaccounts } from 'src/actions/subaccounts';
import { list as listSendingDomains } from 'src/actions/sendingDomains';
import { getRelativeDates } from 'src/helpers/date';
import time from 'src/__testHelpers__/time';

jest.mock('src/helpers/date');
jest.mock('src/helpers/metrics');
jest.mock('src/actions/metrics');
jest.mock('src/actions/templates');
jest.mock('src/actions/subaccounts');
jest.mock('src/actions/sendingDomains');


describe('Action Creator: Report Filters', () => {
  let dispatchMock;

  beforeEach(() => {
    dispatchMock = jest.fn((a) => Promise.resolve(a));
    jest.resetAllMocks();
  });

  it('should call all requests on refresh', async() => {
    const thunk = reportFilters.refreshTypeaheadCache({ foo: 'bar' });
    await thunk(dispatchMock);
    expect(metrics.fetchMetricsDomains).toHaveBeenCalledTimes(1);
    expect(metrics.fetchMetricsCampaigns).toHaveBeenCalledTimes(1);
    expect(metrics.fetchMetricsSendingIps).toHaveBeenCalledTimes(1);
    expect(metrics.fetchMetricsIpPools).toHaveBeenCalledTimes(1);
    expect(listTemplates).toHaveBeenCalledTimes(1);
    expect(listSubaccounts).toHaveBeenCalledTimes(1);
    expect(listSendingDomains).toHaveBeenCalledTimes(1);

  });

  it('should call the metrics lists on refresh lists by time', async() => {
    const thunk = reportFilters.refreshListsByTime({ foo: 'bar' });
    await thunk(dispatchMock);
    expect(metrics.fetchMetricsDomains).toHaveBeenCalledTimes(1);
    expect(metrics.fetchMetricsCampaigns).toHaveBeenCalledTimes(1);
    expect(metrics.fetchMetricsSendingIps).toHaveBeenCalledTimes(1);
    expect(metrics.fetchMetricsIpPools).toHaveBeenCalledTimes(1);
  });

  it('should not refresh the typeahead cache by default', () => {
    reportFilters.maybeRefreshTypeaheadCache(dispatchMock);
    expect(dispatchMock).toHaveBeenCalledTimes(0);
  });

  it('should refresh the typeahead cache on from date change', async() => {
    await reportFilters.maybeRefreshTypeaheadCache(dispatchMock, { to: 'test', from: 'test' }, { from: 'foo' });
    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('should refresh the typeahead cache on to date change', async() => {
    await reportFilters.maybeRefreshTypeaheadCache(dispatchMock, { to: 'test', from: 'test' }, { to: 'to' });
    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('should refresh the typeahead cache on relative date change', async() => {
    reportFilters.maybeRefreshTypeaheadCache(dispatchMock, { to: 'test', from: 'test' }, { relativeRange: '24hrs' });
    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('should create an action to add a filter', () => {
    const filter = { type: 'Example Domain', value: 'example.com' };
    expect(reportFilters.addFilter(filter)).toEqual({ payload: filter, type: 'ADD_FILTER' });
  });

  it('should create an action to add multiple filters', () => {
    const filters = [
      { type: 'Example Domain', value: 'one.example.com' },
      { type: 'Example Domain', value: 'two.example.com' }
    ];
    expect(reportFilters.addFilters(filters)).toEqual({ payload: filters, type: 'ADD_FILTERS' });
  });

  it('should create an action with custom range to refresh report range', () => {
    const range = { from: time(), relativeRange: 'custom', to: time({ hour: 2 }) };
    getRelativeDates.mockImplementation(() => ({}));

    expect(reportFilters.refreshRelativeRange(range)).toEqual({
      payload: range,
      type: 'REFRESH_REPORT_RANGE'
    });
  });

  it('should create an action with relative range to refresh report range', () => {
    const relativeRange = { relativeRange: 'day' };
    const range = { from: time(), to: time({ day: 2 }) };
    getRelativeDates.mockImplementation(() => range);

    expect(reportFilters.refreshRelativeRange(relativeRange)).toEqual({
      payload: { ...range, ...relativeRange },
      type: 'REFRESH_REPORT_RANGE'
    });
  });
});
