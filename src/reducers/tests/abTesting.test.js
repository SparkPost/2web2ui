import cases from 'jest-in-case';
import abTestingReducer from '../abTesting';

const state = {
  list: [
    { id: 'test-primary', status: 'running' },
    { id: 'test-subaccount', subaccount_id: 101, status: 'scheduled' },
    { id: 'test-subaccount', subaccount_id: 202, status: 'draft' },
  ],
};

const TEST_CASES = {
  'matches ab tests correctly (excludes deleted one)': {
    type: 'DELETE_AB_TEST_SUCCESS',
    meta: { data: { id: 'test-primary' } },
  },
  'matches ab tests with subaccount correctly (excludes deleted one)': {
    type: 'DELETE_AB_TEST_SUCCESS',
    meta: { data: { id: 'test-subaccount', subaccountId: '101' } },
  },
  'updates canceled test correctly': {
    type: 'CANCEL_AB_TEST_SUCCESS',
    meta: { id: 'test-subaccount', subaccountId: '101' },
    payload: { status: 'cancelled' },
  },
};

cases(
  'A/B Testing reducer',
  action => {
    expect(abTestingReducer(state, action)).toMatchSnapshot();
  },
  TEST_CASES,
);
