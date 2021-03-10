import { selectAcceptedAttempts, selectAcceptedAggregates } from '../acceptedReport';
import * as helpers from 'src/helpers/accepted';
import * as metricsHelpers from 'src/helpers/metrics';

jest.mock('src/helpers/accepted');
jest.mock('src/helpers/metrics', () => ({
  // is a function that returns another function that returns a string to assert on
  computeKeysForItem: jest.fn(() => () => 'computed'),
  getMetricsFromKeys: jest.fn() // required for other files that use this helper bc jest mocks are v aggressive
}));

describe('Selector: Accepted Report', () => {

  let reshaped;
  let computed;
  let testState;
  let computeAcceptedFn;

  beforeEach(() => {
    reshaped = {};
    computed = {};
    computeAcceptedFn = jest.fn(() => computed);
    helpers.reshapeAttempts = jest.fn(() => reshaped);
    metricsHelpers.computeKeysForItem = jest.fn(() => computeAcceptedFn);
    testState = {
      acceptedReport: {
        aggregates: {
          count_accepted: 100
        },
        attempts: {}
      }
    };
  });

  it('should select accepted attempts', () => {
    const result = selectAcceptedAttempts(testState);
    expect(helpers.reshapeAttempts).toHaveBeenCalledTimes(1);
    expect(result).toBe(reshaped);
  });

  it('should select an empty array as attempts if there are no count_accepted', () => {
    testState.acceptedReport.aggregates.count_accepted = 0;
    const result = selectAcceptedAttempts(testState);
    expect(helpers.reshapeAttempts).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should select accepted aggregates', () => {
    const result = selectAcceptedAggregates(testState);
    expect(result).toEqual('computed');
  });

  it('should select an empty array as aggregates if there are no count_accepted', () => {
    testState.acceptedReport.aggregates.count_accepted = 0;
    const result = selectAcceptedAggregates(testState);
    expect(result).toEqual([]);
  });

});
