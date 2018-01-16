import reportFiltersReducer from '../reportFilters';
import cases from 'jest-in-case';
import time from 'src/__testHelpers__/time';

cases('Report Filters Reducer', (action) => {
  const state = {
    activeList: [],
    from: time(),
    relativeRange: 'day',
    to: time({ day: 2 })
  };

  expect(reportFiltersReducer(state, action)).toMatchSnapshot();
}, {
  'add a filter': {
    payload: { type: 'Example Domain', value: 'sparkpost.com' },
    type: 'ADD_FILTER'
  },
  'add multiple filters': {
    payload: [
      { type: 'Example Domain', value: 'sparkpost.com' },
      { type: 'Example Domain', value: 'another.sparkpost.com' }
    ],
    type: 'ADD_FILTERS'
  },
  'set report range': {
    payload: {
      from: time({ year: 2018, month: 1, day: 1 }),
      relativeRange: 'day',
      to: time({ year: 2018, month: 1, day: 2 })
    },
    type: 'REFRESH_REPORT_RANGE'
  }
});
