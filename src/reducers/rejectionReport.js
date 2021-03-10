const initialState = {
  list: [],
  aggregates: {}
};

export default (state = initialState, { type, payload }) => {

  switch (type) {

    // AGGREGATES

    case 'GET_REJECTION_AGGREGATES_PENDING':
      return { ...state, aggregatesLoading: true };

    case 'GET_REJECTION_AGGREGATES_SUCCESS':
      return { ...state, aggregatesLoading: false, aggregates: payload[0] };

    case 'GET_REJECTION_AGGREGATES_FAIL':
      return { ...state, aggregatesLoading: false };


    // REASONS

    case 'FETCH_METRICS_REJECTION_REASONS_BY_DOMAIN_PENDING':
      return { ...state, reasonsLoading: true };

    case 'FETCH_METRICS_REJECTION_REASONS_BY_DOMAIN_SUCCESS':
      return { ...state, reasonsLoading: false, list: payload };

    case 'FETCH_METRICS_REJECTION_REASONS_BY_DOMAIN_FAIL':
      return { ...state, reasonsLoading: false };


    default:
      return state;
  }

};
