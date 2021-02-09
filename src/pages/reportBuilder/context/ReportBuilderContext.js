import React, { useCallback, useContext, useMemo, useReducer, createContext } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { getRelativeDates } from 'src/helpers/date';
import { getMetricsFromKeys, getRollupPrecision as getPrecision } from 'src/helpers/metrics';
import { REPORT_BUILDER_FILTER_KEY_MAP } from 'src/constants';
import { getLocalTimezone } from 'src/helpers/date';
import { stringifyTypeaheadfilter } from 'src/helpers/string';
import config from 'src/config';
import {
  getIterableFormattedGroupings,
  getApiFormattedGroupings,
  hydrateFilters,
} from '../helpers';

const ReportOptionsContext = createContext({});

const initialState = {
  filters: [],
  comparisons: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_FILTERS': {
      return {
        ...state,
        filters: [
          ...state.filters,
          {
            AND: { [REPORT_BUILDER_FILTER_KEY_MAP[action.payload.type]]: { eq: [action.payload] } },
          },
        ],
      };
    }
    case 'UPDATE_REPORT_OPTIONS': {
      const { payload, meta } = action;
      const { subaccounts } = meta;
      let update = { ...state, ...payload };

      if (!update.timezone) {
        update.timezone = getLocalTimezone();
      }

      if (!update.metrics) {
        update.metrics = config.reportBuilder.defaultMetrics;
      }

      if (payload.filters) {
        update.filters = hydrateFilters(payload.filters, { subaccounts });
      }

      if (!update.relativeRange) {
        update.relativeRange = '7days';
      }

      const updatePrecision = update.precision || 'hour'; // Default to hour since it's the recommended rollup precision for 7 days

      if (update.relativeRange !== 'custom') {
        const { from, to } = getRelativeDates(update.relativeRange, {
          precision: updatePrecision,
        });
        //for metrics rollup, when using the relative dates, get the precision, else use the given precision
        //If precision is not in the URL, get the recommended precision.
        const precision = getPrecision({ from, to, precision: updatePrecision });
        update = { ...update, from, to, precision };
      } else {
        const precision = getPrecision({
          from: update.from,
          to: moment(update.to),
          precision: updatePrecision,
        });

        update = { ...update, precision };
      }
      return {
        ...update,
        isReady: true,
      };
    }

    case 'REMOVE_FILTER': {
      const { payload } = action;
      const groupings = getIterableFormattedGroupings(state.filters);
      const targetFilter = groupings[payload.groupingIndex].filters[payload.filterIndex];
      // Filter out matching values based on index
      targetFilter.values = targetFilter.values.filter(
        value => value !== targetFilter.values[payload.valueIndex],
      );
      // Remap iterable data structure to match API structure
      const filters = getApiFormattedGroupings(groupings);

      return {
        ...state,
        filters,
      };
    }

    case 'REMOVE_COMPARISON_FILTER': {
      const { payload } = action;
      const { index } = payload;
      const comparisons = state.comparisons;
      comparisons.splice(index, 1);

      if (comparisons.length >= 2) {
        return { ...state, comparisons };
      }
      const lastFilter = comparisons[0];
      const filters = [
        { AND: { [REPORT_BUILDER_FILTER_KEY_MAP[lastFilter.type]]: { eq: [lastFilter] } } },
      ];

      return { ...state, comparisons: [], filters: [...state.filters, ...filters] };
    }

    default:
      throw new Error(`${action.type} is not supported.`);
  }
};

const getSelectors = reportOptions => {
  const selectDateOptions = {
    from: moment(reportOptions.from)
      .utc()
      .format(),
    to: moment(reportOptions.to)
      .utc()
      .format(),
    range: reportOptions.relativeRange,
    timezone: reportOptions.timezone,
    precision: reportOptions.precision,
  };

  const selectTypeaheadFilters = {
    filters: (reportOptions.filters || []).map(stringifyTypeaheadfilter),
  };

  const selectCompareFilters = {
    comparisons: reportOptions.comparisons || [],
  };

  const selectSummaryMetrics = {
    metrics: (reportOptions.metrics || []).map(metric =>
      typeof metric === 'string' ? metric : metric.key,
    ),
    //TODO RB CLEANUP: can probably remove the check if it's an object
  };

  const selectSummaryMetricsProcessed = getMetricsFromKeys(reportOptions.metrics || [], true);

  /**
   * Converts reportOptions for url sharing
   */
  const selectReportSearchOptions = { ...selectDateOptions, ...selectTypeaheadFilters };

  /**
   * Converts reportOptions for url sharing for the summary chart
   */
  const selectSummaryChartSearchOptions = {
    ...selectDateOptions,
    ...selectTypeaheadFilters,
    ...selectSummaryMetrics,
    ...selectCompareFilters,
  };

  return {
    selectSummaryMetricsProcessed,
    selectReportSearchOptions,
    selectSummaryChartSearchOptions,
  };
};

const ReportOptionsContextProvider = props => {
  const { subaccounts } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshReportOptions = useCallback(
    payload => {
      return dispatch({
        type: 'UPDATE_REPORT_OPTIONS',
        payload,
        meta: { subaccounts },
      });
    },
    [dispatch, subaccounts],
  );

  const addFilters = useCallback(
    payload => {
      return dispatch({
        type: 'ADD_FILTERS',
        payload,
      });
    },
    [dispatch],
  );

  const removeFilter = useCallback(
    payload => {
      return dispatch({
        type: 'REMOVE_FILTER',
        payload,
      });
    },
    [dispatch],
  );

  // Not currently used but I am leaving them here for now.
  const setFilters = useCallback(
    payload => {
      return dispatch({
        type: 'SET_FILTERS',
        payload,
      });
    },
    [dispatch],
  );

  // Not currently used but I am leaving them here for now.
  const clearFilters = useCallback(() => {
    return dispatch({
      type: 'CLEAR_FILTERS',
    });
  }, [dispatch]);

  const removeComparisonFilter = useCallback(
    payload => {
      return dispatch({
        type: 'REMOVE_COMPARISON_FILTER',
        payload,
      });
    },
    [dispatch],
  );

  const actions = {
    addFilters,
    clearFilters,
    setFilters,
    removeFilter,
    removeComparisonFilter,
    refreshReportOptions,
  };
  const selectors = useMemo(() => getSelectors(state), [state]);

  return (
    <ReportOptionsContext.Provider value={{ state, actions, selectors }}>
      {props.children}
    </ReportOptionsContext.Provider>
  );
};

const mapStateToProps = state => ({
  subaccounts: state.subaccounts.list,
});

export const ReportBuilderContextProvider = connect(mapStateToProps)(ReportOptionsContextProvider);

export const useReportBuilderContext = () => useContext(ReportOptionsContext);
