const initialState = {
  loading: null,
  success: null,
  error: false,
};

export default (state = initialState, { type }) => {
  switch (type) {
    case 'BILLING_CREATE_SUCCESS':
      return {
        ...state,
        success: true,
        loading: false,
        error: false,
      };

    case 'BILLING_CREATE_PENDING':
      return {
        ...state,
        success: false,
        loading: true,
        error: false,
      };

    case 'BILLING_CREATE_ERROR':
      return {
        ...state,
        loading: false,
        error: true,
        success: false,
      };
    default:
      return state;
  }
};
