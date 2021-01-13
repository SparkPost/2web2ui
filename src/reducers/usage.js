const initialState = {
  messaging: [],
  receipient_validation: [],
  loading: false,
  error: null,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case 'GET_USAGE_PENDING': {
      return { ...state, loading: true, error: null };
    }

    case 'GET_USAGE_SUCCESS': {
      return {
        ...state,
        loading: false,
        messaging: payload.messaging,
        receipient_validation: payload.receipient_validation,
      };
    }

    case 'GET_USAGE_FAIL': {
      return { ...state, loading: false, error: payload };
    }

    default:
      return state;
  }
};
