const initialState = {
  precision: '',
  categories: [],
  aggregates: {},
  reasons: [],
  adminReasons: []
};

export default (state = initialState, { type, payload }) => {

  switch (type) {

    // AGGREGATES

    case 'GET_BOUNCE_REPORT_AGGREGATES_PENDING':
      return { ...state, aggregatesLoading: true };

    case 'GET_BOUNCE_REPORT_AGGREGATES_SUCCESS':
      return { ...state, aggregatesLoading: false, aggregates: payload[0] };

    case 'GET_BOUNCE_REPORT_AGGREGATES_FAIL':
      return { ...state, aggregatesLoading: false };


    // CLASSIFICATIONS

    case 'FETCH_METRICS_BOUNCE_CLASSIFICATIONS_PENDING':
      return { ...state, categoriesLoading: true };

    case 'FETCH_METRICS_BOUNCE_CLASSIFICATIONS_SUCCESS':
      return { ...state, categoriesLoading: false, classifications: payload };

    case 'FETCH_METRICS_BOUNCE_CLASSIFICATIONS_FAIL':
      return { ...state, categoriesLoading: false };


    // REASONS

    case 'FETCH_METRICS_BOUNCE_REASONS_BY_DOMAIN_PENDING':
      return { ...state, reasonsLoading: true };

    case 'FETCH_METRICS_BOUNCE_REASONS_BY_DOMAIN_SUCCESS':
      return { ...state, reasonsLoading: false, reasons: payload };

    case 'FETCH_METRICS_BOUNCE_REASONS_BY_DOMAIN_FAIL':
      return { ...state, reasonsLoading: false };


    // ADMIN BOUNCE REASONS

    case 'FETCH_METRICS_ADMIN_BOUNCE_REASONS_BY_DOMAIN_PENDING':
      return { ...state, reasonsLoading: true };

    case 'FETCH_METRICS_ADMIN_BOUNCE_REASONS_BY_DOMAIN_SUCCESS':
      return { ...state, reasonsLoading: false, adminReasons: payload };

    case 'FETCH_METRICS_ADMIN_BOUNCE_REASONS_BY_DOMAIN_FAIL':
      return { ...state, reasonsLoading: false };

    default:
      return state;
  }
};
