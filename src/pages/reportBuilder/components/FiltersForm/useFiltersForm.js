import { useReducer, useCallback, useEffect } from 'react';
import {
  getInitialGroupState,
  getInitialFilterState,
  getIterableFormattedGroupings,
  getGroupingFields,
} from '../../helpers';

const initialGroupingsState = [{ AND: {} }];

const initialState = {
  status: 'idle', // 'idle' | 'editing' | 'submitting' | 'success' | 'error'
  groupings: getIterableFormattedGroupings(initialGroupingsState),
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_GROUPING_TYPE': {
      const { groupings } = state;
      const targetGroup = groupings[action.groupingIndex];
      targetGroup.type = action.groupingType;

      return {
        ...state,
        groupings,
      };
    }

    case 'SET_FILTER_TYPE': {
      const { groupings, status: prevStatus } = state;
      const targetFilter = groupings[action.groupingIndex].filters[action.filterIndex];
      targetFilter.type = action.filterType;
      targetFilter.values = [];
      // Only show the error if coming from the error state post submission
      const nextStatus =
        hasDuplicateError(groupings) && prevStatus === 'error' ? 'error' : 'editing';

      return {
        ...state,
        groupings,
        status: nextStatus,
      };
    }

    case 'SET_FILTER_COMPARE_BY': {
      const { groupings, status: prevStatus } = state;
      const targetFilter = groupings[action.groupingIndex].filters[action.filterIndex];
      targetFilter.compareBy = action.compareBy;
      targetFilter.values = [];
      // Only show the error if coming from the error state post submission
      const nextStatus =
        hasDuplicateError(groupings) && prevStatus === 'error' ? 'error' : 'editing';

      return {
        ...state,
        groupings,
        status: nextStatus,
      };
    }

    case 'SET_FILTER_VALUES': {
      const { groupings } = state;
      const targetFilter = groupings[action.groupingIndex].filters[action.filterIndex];
      targetFilter.values = action.values;

      return {
        ...state,
        groupings,
      };
    }

    case 'ADD_GROUPING': {
      const groupings = state.groupings;
      const updatedGroupings = [...groupings, getInitialGroupState()];

      return {
        ...state,
        groupings: updatedGroupings,
      };
    }

    case 'ADD_FILTER': {
      const { groupings } = state;
      const targetFilters = groupings[action.groupingIndex].filters;
      targetFilters.push(getInitialFilterState());

      return {
        ...state,
        groupings,
      };
    }

    case 'REMOVE_FILTER': {
      let updatedGroupings = state.groupings
        // Remove clicked on filters
        .map((grouping, groupingIndex) => {
          if (groupingIndex === action.groupingIndex) {
            return {
              ...grouping,
              filters: grouping.filters.filter(
                (_filter, filterIndex) => filterIndex !== action.filterIndex,
              ),
            };
          }

          return grouping;
        })
        // If there are no filters left in the group, then remove the entire group
        .filter((grouping, groupingIndex) => {
          if (groupingIndex === action.groupingIndex) {
            const groupingHasFilters = Boolean(
              grouping.filters.find(filter => filter.values.length > 0),
            );

            return groupingHasFilters;
          }

          return true;
        })
        // Remove any undefined entries
        .filter(Boolean);

      // If the last filter is totally cleared out, re-populate it with the default state
      if (updatedGroupings.length === 0) {
        updatedGroupings = getIterableFormattedGroupings(initialGroupingsState);
      }

      return {
        ...state,
        groupings: updatedGroupings,
        status: hasDuplicateError(updatedGroupings) ? 'error' : 'editing',
      };
    }

    case 'SET_FILTERS': {
      return {
        ...state,
        groupings: action.groupings.length
          ? getIterableFormattedGroupings(action.groupings)
          : getIterableFormattedGroupings(initialGroupingsState),
      };
    }

    case 'CLEAR_FILTERS': {
      return {
        ...state,
        groupings: getIterableFormattedGroupings(initialGroupingsState),
        status: 'idle',
      };
    }

    case 'SUBMIT': {
      return {
        ...state,
        status: 'submitting', // This seems like an extraneous step but it introduces a state change to ensure the user does not remain in "error" constantly
      };
    }

    case 'VALIDATE': {
      const { groupings } = state;

      // If a duplicate error exists in the groupings, update the form status to "error"
      if (hasDuplicateError(groupings)) {
        return {
          ...state,
          status: 'error',
        };
      }

      // Otherwise, the final, success state is entered
      return {
        ...state,
        status: 'success',
      };
    }

    default:
      throw new Error(`${action.type} is not supported.`);
  }
}

export default function useFiltersForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setGroupingType = useCallback(
    ({ groupingType, groupingIndex }) => {
      return dispatch({
        type: 'SET_GROUPING_TYPE',
        groupingType,
        groupingIndex,
      });
    },
    [dispatch],
  );

  const setFilterType = useCallback(
    ({ filterType, filterIndex, groupingIndex }) => {
      return dispatch({
        type: 'SET_FILTER_TYPE',
        filterType,
        filterIndex,
        groupingIndex,
      });
    },
    [dispatch],
  );

  const setFilterCompareBy = useCallback(
    ({ compareBy, filterIndex, groupingIndex }) => {
      return dispatch({
        type: 'SET_FILTER_COMPARE_BY',
        compareBy,
        filterIndex,
        groupingIndex,
      });
    },
    [dispatch],
  );

  const setFilterValues = useCallback(
    ({ values, filterIndex, groupingIndex }) => {
      return dispatch({
        type: 'SET_FILTER_VALUES',
        values,
        filterIndex,
        groupingIndex,
      });
    },
    [dispatch],
  );

  const addGrouping = useCallback(() => {
    return dispatch({ type: 'ADD_GROUPING' });
  }, [dispatch]);

  const addFilter = useCallback(
    ({ groupingIndex }) => {
      return dispatch({
        type: 'ADD_FILTER',
        groupingIndex,
      });
    },
    [dispatch],
  );

  const removeFilter = useCallback(
    ({ groupingIndex, filterIndex }) => {
      return dispatch({
        type: 'REMOVE_FILTER',
        groupingIndex,
        filterIndex,
      });
    },
    [dispatch],
  );

  const setFilters = useCallback(
    groupings => {
      return dispatch({
        type: 'SET_FILTERS',
        groupings,
      });
    },
    [dispatch],
  );

  const clearFilters = () => dispatch({ type: 'CLEAR_FILTERS' });

  const submit = () => dispatch({ type: 'SUBMIT' });

  // On status change, immediately transition states after submitting
  useEffect(() => {
    if (state.status === 'submitting') {
      return dispatch({ type: 'VALIDATE' });
    }
  }, [state.status]);

  return {
    state,
    actions: {
      setGroupingType,
      setFilterType,
      setFilterCompareBy,
      setFilterValues,
      addGrouping,
      addFilter,
      removeFilter,
      clearFilters,
      setFilters,
      submit,
    },
  };
}

function hasDuplicateError(groupings) {
  return getGroupingFields(groupings).some(grouping => {
    return grouping.hasDuplicateFilters;
  });
}
