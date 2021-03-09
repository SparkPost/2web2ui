export const initialState = {
  seedsPending: false,
  seeds: [],
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case 'GET_SEEDS_PENDING':
      return { ...state, seedsPending: true, seedsError: null };
    case 'GET_SEEDS_SUCCESS':
      return { ...state, seedsPending: false, seeds: payload, seedsError: null };
    case 'GET_SEEDS_FAIL':
      return { ...state, seedsPending: false, seedsError: payload };

    default:
      return state;
  }
};
