import { refreshRejectionReport } from '../rejectionReport';
import * as metricsActions from 'src/actions/metrics';
import * as metricsHelpers from 'src/helpers/metrics';

jest.mock('src/helpers/metrics');
jest.mock('src/actions/metrics');

describe('Action Creator: Refresh Rejection Report', () => {

  let dispatchMock;
  let queryMock;
  let updates;
  let result;

  beforeEach(() => {
    queryMock = {};
    updates = { abc: 'cool' };
    metricsHelpers.getQueryFromOptions = jest.fn(() => queryMock);
    dispatchMock = jest.fn((a) => Promise.resolve(a));
    result = refreshRejectionReport(updates)(dispatchMock);
  });

  it('should return a promise', () => {
    expect(result).toBeInstanceOf(Promise);
  });

  it('should get query options, passing in updates', () => {
    expect(metricsHelpers.getQueryFromOptions).toHaveBeenCalledWith({
      ...updates,
      metrics: undefined
    });
  });

  it('should dispatch actions', () => {
    expect(dispatchMock).toHaveBeenCalledTimes(2);
    expect(metricsActions.fetchDeliverability).toHaveBeenCalledWith({
      type: 'GET_REJECTION_AGGREGATES',
      params: queryMock
    });
    expect(metricsActions.fetchRejectionReasonsByDomain).toHaveBeenCalledWith(queryMock);
  });

});
