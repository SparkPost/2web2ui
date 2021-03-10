import { dedupeFilters } from 'src/helpers/reports';

const initialState = {
  filters: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_FILTERS': {
      const mergedFilters = dedupeFilters([...state.filters, ...action.payload]);
      if (mergedFilters.length === state.filters.length) {
        return state;
      }
      return { ...state, filters: mergedFilters };
    }

    case 'REMOVE_FILTER':
      return {
        ...state,
        filters: [
          ...state.filters.slice(0, action.payload),
          ...state.filters.slice(action.payload + 1),
        ],
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload,
      };

    case 'CLEAR_FILTERS':
      return { ...state, filters: [] };

    case 'UPDATE_REPORT_OPTIONS': {
      const {
        to = state.to,
        from = state.from,
        relativeRange = state.relativeRange,
        metrics = state.metrics,
        precision = state.precision,
        timezone = state.timezone,
        filters = state.filters,
      } = action.payload;
      return {
        ...state,
        to,
        from,
        precision,
        timezone,
        relativeRange,
        metrics,
        filters,
        isReady: true,
      };
    }

    default:
      return state;
  }
};
