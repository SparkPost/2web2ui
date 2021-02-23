const initialState = {
  loading: null,
  success: null,
  error: null,
};

export default (state = initialState, { type }) => {
  switch (type) {
    case 'BILLING_CREATE_SUCCESS':
      return {
        ...initialState,
        success: true,
      };

    case 'BILLING_CREATE_PENDING':
      return {
        ...initialState,
        loading: true,
      };

    case 'BILLING_CREATE_ERROR':
      return {
        ...initialState,
        error: true,
      };
    default:
      return state;
  }
};
