import reportOptionsReducer from '../reportOptions';
import cases from 'jest-in-case';
import time from 'src/__testHelpers__/time';

describe('Reducer: Report Options', () => {
  let testState;

  beforeEach(() => {
    testState = {
      filters: [],
      from: time(),
      relativeRange: 'day',
      to: time({ day: 2 }),
      metrics: [],
    };
  });
  cases(
    'General cases',
    action => {
      expect(reportOptionsReducer(testState, action)).toMatchSnapshot();
    },
    {
      'add a filter': {
        payload: [{ type: 'Example Domain', value: 'sparkpost.com' }],
        type: 'ADD_FILTERS',
      },
      'add multiple filters': {
        payload: [
          { type: 'Example Domain', value: 'sparkpost.com' },
          { type: 'Example Domain', value: 'another.sparkpost.com' },
        ],
        type: 'ADD_FILTERS',
      },
      'set report options': {
        payload: {
          from: time({ year: 2018, month: 1, day: 1 }),
          relativeRange: 'day',
          to: time({ year: 2018, month: 1, day: 2 }),
          metrics: [1, 2, 3],
          timezone: 'America/New_York',
          precision: 'hour',
        },
        type: 'UPDATE_REPORT_OPTIONS',
      },
    },
  );

  it('should dedupe and preserve the state reference if a duplicate filter is added', () => {
    const action = {
      type: 'ADD_FILTERS',
      payload: [{ type: 'Duplicate Domain', value: 'sparkpost.com' }],
    };

    const modified = reportOptionsReducer(testState, action);
    expect(modified.filters).toHaveLength(1);
    expect(modified).not.toBe(testState);

    const unmodified = reportOptionsReducer(modified, action);
    expect(modified.filters).toHaveLength(1);
    expect(unmodified).toBe(modified);
  });
});
