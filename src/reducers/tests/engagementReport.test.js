import engagementReportReducer from '../engagementReport';
import cases from 'jest-in-case';

cases('Engagement Report Reducer', (action) => {
  expect(engagementReportReducer(undefined, action)).toMatchSnapshot();
}, {
  'when failed to get chart data': {
    type: 'GET_ENGAGEMENT_AGGREGATE_METRICS_FAIL',
    payload: {
      message: 'Oh no!'
    }
  },
  'when pending to get chart data': {
    type: 'GET_ENGAGEMENT_AGGREGATE_METRICS_PENDING'
  },
  'when succeeds to get chart data': {
    type: 'GET_ENGAGEMENT_AGGREGATE_METRICS_SUCCESS',
    payload: [{ count_accepted: 237433, count_targeted: 272234 }]
  },
  'when failed to get table data': {
    type: 'GET_ENGAGEMENT_LINK_METRICS_FAIL',
    payload: {
      message: 'Oh no!'
    }
  },
  'when pending to get table data': {
    type: 'GET_ENGAGEMENT_LINK_METRICS_PENDING'
  },
  'when succeeds to get table data': {
    type: 'GET_ENGAGEMENT_LINK_METRICS_SUCCESS',
    payload: [
      { count_clicked: 1802, count_raw_clicked_approx: 1692, link_name: 'Raw URL' },
      { count_clicked: 1402, count_raw_clicked_approx: 1020, link_name: 'Nintendo' }
    ]
  }
});
