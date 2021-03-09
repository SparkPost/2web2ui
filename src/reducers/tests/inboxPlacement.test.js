import cases from 'jest-in-case';
import inboxPlacementReducer from '../inboxPlacement';

const TEST_CASES = {
  'list seeds pending': {
    type: 'GET_SEEDS_PENDING',
  },
  'list seeds success': {
    type: 'GET_SEEDS_SUCCESS',
  },
  'list seeds fail': {
    type: 'GET_SEEDS_FAIL',
  },
};

cases(
  'Inbox Placement Reducer',
  ({ payload, type, meta, state }) => {
    expect(inboxPlacementReducer(state, { payload, type, meta })).toMatchSnapshot();
  },
  TEST_CASES,
);
