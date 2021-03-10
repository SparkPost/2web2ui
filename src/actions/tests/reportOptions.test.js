import moment from 'moment';
import * as reportOptions from '../reportOptions';
import * as metrics from 'src/actions/metrics';
import { list as listSubaccounts } from 'src/actions/subaccounts';
import { list as listSendingDomains } from 'src/actions/sendingDomains';
import { getRelativeDates, isSameDate } from 'src/helpers/date';
import { getPrecision, getRollupPrecision } from 'src/helpers/metrics';

jest.mock('src/helpers/date');
jest.mock('src/helpers/metrics');
jest.mock('src/actions/metrics');
jest.mock('src/actions/templates');
jest.mock('src/actions/subaccounts');
jest.mock('src/actions/sendingDomains');

describe('Action Creator: Report Options', () => {
  let dispatchMock;
  let testState;
  let getStateMock;

  beforeEach(() => {
    testState = {
      metrics: {
        campaigns: [],
        domains: [],
        sendingIps: [],
        ipPools: [],
        templates: [],
      },
      subaccounts: {
        list: [],
      },
      sendingDomains: {
        list: [],
      },
      typeahead: {
        from: null,
        to: null,
        cache: {},
      },
      currentUser: {
        options: {
          ui: {
            isHibanaEnabled: false,
          },
        },
      },
    };
    dispatchMock = jest.fn(a => a);
    getStateMock = jest.fn(() => testState);
    isSameDate.mockImplementation(() => false);
  });

  describe('initTypeaheadCache', () => {
    it('should dispatch 2 actions', () => {
      reportOptions.initTypeaheadCache()(dispatchMock, getStateMock);
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(listSubaccounts).toHaveBeenCalledTimes(1);
      expect(listSendingDomains).toHaveBeenCalledTimes(1);
    });

    it('should skip calls if already in state', () => {
      testState.subaccounts.list.push('subaccount');
      testState.sendingDomains.list.push('sending-domain');

      reportOptions.initTypeaheadCache()(dispatchMock, getStateMock);

      expect(dispatchMock).toHaveBeenCalledTimes(0);
      expect(listSubaccounts).not.toHaveBeenCalled();
      expect(listSendingDomains).not.toHaveBeenCalled();
    });
  });

  it('should refresh the metrics lists for the typeahead cache if the results are not cached', async () => {
    await reportOptions.refreshTypeaheadCache({ match: 'foo' })(dispatchMock, getStateMock);
    expect(metrics.fetchMetricsDomains).toHaveBeenCalledTimes(1);
    expect(metrics.fetchMetricsCampaigns).toHaveBeenCalledTimes(1);
    expect(metrics.fetchMetricsSendingIps).toHaveBeenCalledTimes(1);
    expect(metrics.fetchMetricsIpPools).toHaveBeenCalledTimes(1);
    expect(metrics.fetchMetricsTemplates).toHaveBeenCalledTimes(1);
  });

  it('should load metrics lists for the typeahead from cache if exists', async () => {
    testState.typeahead = {
      cache: {
        foo: ['foobar'],
      },
    };
    isSameDate.mockImplementation(() => true);
    await reportOptions.refreshTypeaheadCache({ match: 'foo' })(dispatchMock, getStateMock);
    expect(metrics.fetchMetricsDomains).not.toHaveBeenCalled();
    expect(metrics.fetchMetricsCampaigns).not.toHaveBeenCalled();
    expect(metrics.fetchMetricsSendingIps).not.toHaveBeenCalled();
    expect(metrics.fetchMetricsIpPools).not.toHaveBeenCalled();
    expect(metrics.fetchMetricsTemplates).not.toHaveBeenCalled();
  });

  it('should add multiple filters', () => {
    const filters = [];
    expect(reportOptions.addFilters(filters)).toEqual({
      payload: filters,
      type: 'ADD_FILTERS',
    });
  });

  it('should remove a filter', () => {
    const filterToRemove = {};
    expect(reportOptions.removeFilter(filterToRemove)).toEqual({
      type: 'REMOVE_FILTER',
      payload: filterToRemove,
    });
  });

  describe('refreshReportOptions', () => {
    let currentFrom;
    let currentTo;
    let updatedFrom;

    beforeEach(() => {
      currentFrom = moment('2018-02-10').toDate();
      currentTo = moment('2018-02-11').toDate();
      updatedFrom = moment(currentFrom).toDate();
      updatedFrom.setMonth(currentFrom.getMonth() - 1);

      testState.reportOptions = {
        from: currentFrom,
        to: currentTo,
        relativeRange: 'custom',
      };
      getRelativeDates.mockImplementation(() => ({ from: 'relative', to: 'relative' }));
      getPrecision.mockImplementation(() => 'hour');
      getRollupPrecision.mockImplementation(() => 'hour');
    });

    it('should calculate a non-custom relative range', () => {
      const action = reportOptions.refreshReportOptions({ relativeRange: 'day' })(
        dispatchMock,
        getStateMock,
      );
      expect(getRelativeDates).toHaveBeenCalledTimes(1);
      expect(action).toEqual({
        type: 'UPDATE_REPORT_OPTIONS',
        payload: expect.objectContaining({
          from: 'relative',
          to: 'relative',
          precision: 'hour',
        }),
      });
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    it('should calculate a non-custom relative range merged from the redux store', () => {
      testState.reportOptions.relativeRange = 'day';
      const action = reportOptions.refreshReportOptions({ from: currentFrom, to: currentTo })(
        dispatchMock,
        getStateMock,
      );
      expect(getRelativeDates).toHaveBeenCalledTimes(1);
      expect(action.payload).toEqual(
        expect.objectContaining({
          from: 'relative',
          to: 'relative',
          precision: 'hour',
        }),
      );
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    it('should NOT calculate a "custom" relative range', () => {
      const action = reportOptions.refreshReportOptions({
        from: updatedFrom,
        relativeRange: 'custom',
      })(dispatchMock, getStateMock);
      expect(getRelativeDates).not.toHaveBeenCalled();
      expect(action.payload).toEqual(
        expect.objectContaining({
          from: updatedFrom,
          to: currentTo,
          precision: 'hour',
        }),
      );
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    it('should use the rollup precision getter', () => {
      reportOptions.refreshReportOptions({
        from: updatedFrom,
        relativeRange: 'custom',
        precision: '5min',
      })(dispatchMock, getStateMock);
      expect(getPrecision).not.toHaveBeenCalled();
      expect(getRollupPrecision).toHaveBeenCalled();
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });
  });
});
