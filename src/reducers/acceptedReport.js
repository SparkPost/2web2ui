import { getAcceptedMetrics } from 'src/helpers/accepted';

const initialState = {
  aggregatesLoading: false,
  attemptsLoading: false,
  aggregates: {},
  attempts: [],
  metrics: getAcceptedMetrics()
};

export default (state = initialState, { type, payload }) => {
  switch (type) {

    // AGGREGATES

    case 'GET_ACCEPTED_AGGREGATES_PENDING':
      return { ...state, aggregatesLoading: true };

    case 'GET_ACCEPTED_AGGREGATES_SUCCESS':
      return { ...state, aggregatesLoading: false, aggregates: payload[0] };

    case 'GET_ACCEPTED_AGGREGATES_FAIL':
      return { ...state, aggregatesLoading: false };


    // DELIVERIES BY ATTEMPT

    case 'FETCH_METRICS_DELIVERIES_BY_ATTEMPT_PENDING':
      return { ...state, attemptsLoading: true };

    case 'FETCH_METRICS_DELIVERIES_BY_ATTEMPT_SUCCESS':
      return { ...state, attemptsLoading: false, attempts: payload };

    case 'FETCH_METRICS_DELIVERIES_BY_ATTEMPT_FAIL':
      return { ...state, attemptsLoading: false };


    default:
      return state;
  }
};
