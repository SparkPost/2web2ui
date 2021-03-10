import { refreshAcceptedReport } from '../acceptedReport';
import * as metricsActions from 'src/actions/metrics';
import * as metricsHelpers from 'src/helpers/metrics';

jest.mock('src/helpers/metrics');
jest.mock('src/actions/metrics');
jest.mock('src/helpers/accepted', () => ({
  getAcceptedMetrics: () => ({ accepted: 'metrics' }),
}));

describe('Action Creator: Refresh Accepted Report', () => {
  let dispatchMock;
  let queryMock;
  let updates;
  let result;

  beforeEach(() => {
    queryMock = {};
    updates = { abc: 'cool' };
    metricsHelpers.getQueryFromOptions = jest.fn(() => queryMock);
    dispatchMock = jest.fn(a => Promise.resolve(a));
    result = refreshAcceptedReport(updates)(dispatchMock);
  });

  it('should return a promise', () => {
    expect(result).toBeInstanceOf(Promise);
  });

  it('should get query options, passing in combined updates and metrics constant', () => {
    expect(metricsHelpers.getQueryFromOptions).toHaveBeenCalledWith({
      abc: 'cool',
      metrics: { accepted: 'metrics' },
    });
  });

  it('should dispatch actions', () => {
    expect(dispatchMock).toHaveBeenCalledTimes(2);
    expect(metricsActions.fetchDeliverability).toHaveBeenCalledWith({
      type: 'GET_ACCEPTED_AGGREGATES',
      params: queryMock,
    });
    expect(metricsActions.fetchDeliveriesByAttempt).toHaveBeenCalledWith(queryMock);
  });
});
