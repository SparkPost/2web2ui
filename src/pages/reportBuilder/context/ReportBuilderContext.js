import React, { useCallback, useContext, useMemo, useReducer, createContext } from 'react';
import moment from 'moment';
import { connect, useDispatch } from 'react-redux';
import { getLocalTimezone, getRelativeDates, formatToTimezone } from 'src/helpers/date';
import {
  getMetricsFromKeys,
  getRollupPrecision as getPrecision,
  getValidDateRange,
} from 'src/helpers/metrics';
import { stringifyTypeaheadfilter } from 'src/helpers/string';
import config from 'src/config';
import { map as METRICS_MAP } from 'src/config/metrics';
import {
  getIterableFormattedGroupings,
  getApiFormattedGroupings,
  getFilterTypeKey,
  hydrateFilters,
  replaceComparisonFilterKey,
  getValidFilters,
} from '../helpers';
import { showAlert } from 'src/actions/globalAlert';

const defaultFormat = "yyyy-MM-dd'T'HH:mm:ssxxx";

const ReportOptionsContext = createContext({});

const initialState = {
  filters: [],
  comparisons: [],
  groupBy: undefined,
  industryCategory: 'all',
  mailboxProvider: 'all',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_FILTERS': {
      const filterType = getFilterTypeKey(action.payload.type);
      return {
        ...state,
        filters: [
          ...state.filters,
          {
            AND: { [filterType]: { eq: [action.payload] } },
          },
        ],
      };
    }
    case 'UPDATE_REPORT_OPTIONS': {
      const { payload, meta } = action;
      const { subaccounts, dispatchAlert } = meta;
      let update = { ...state, ...payload };

      if (!update.timezone) {
        update.timezone = getLocalTimezone();
      }

      if (!update.metrics) {
        update.metrics = config.reportBuilder.defaultMetrics;
      } else {
        const filteredMetrics = update.metrics.filter(metric => METRICS_MAP[metric]);
        if (filteredMetrics.length < update.metrics.length) {
          dispatchAlert({
            type: 'error',
            message: `Invalid Metric`,
          });
        }
        update.metrics = filteredMetrics;
      }

      if (payload.filters) {
        const rawFilters = hydrateFilters(payload.filters, { subaccounts });
        const validatedFilters = getValidFilters(rawFilters);

        if (validatedFilters.length !== rawFilters.length) {
          dispatchAlert({
            type: 'error',
            message: `Invalid Filter`,
          });
        }
        update.filters = validatedFilters;
      }
      const updatePrecision = update.precision || 'hour'; // Default to hour since it's the recommended rollup precision for 7 days

      if (!update.relativeRange) {
        update.relativeRange = '7days';
      } else {
        try {
          getValidDateRange({
            from: moment(update.from),
            to: moment(update.to),
            preventFuture: true,
            precision: updatePrecision,
            roundToPrecision: true,
          });
        } catch (e) {
          dispatchAlert({
            type: 'error',
            message: `Invalid Date`,
          });
          update.relativeRange = '7days';
        }
      }

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

      if (update.comparisons.length > 0) {
        //Changes the filter type from the label to the key and validates the comparison
        const validComparisons = replaceComparisonFilterKey(update.comparisons);
        const hasEnoughToCompare = validComparisons.length > 1;
        if (validComparisons.length !== update.comparisons.length || !hasEnoughToCompare) {
          dispatchAlert({
            type: 'error',
            message: `Invalid Comparison`,
          });
        }
        update.comparisons = hasEnoughToCompare ? validComparisons : [];
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
      const filterType = getFilterTypeKey(lastFilter.type);
      const filters = [{ AND: { [filterType]: { eq: [lastFilter] } } }];

      return { ...state, comparisons: [], filters: [...state.filters, ...filters] };
    }

    case 'SET_GROUP_BY': {
      const { payload } = action;
      return {
        ...state,
        groupBy: payload,
      };
    }

    default:
      throw new Error(`${action.type} is not supported.`);
  }
};

const getSelectors = reportOptions => {
  const selectDateOptions = {
    from: reportOptions.from
      ? formatToTimezone(reportOptions.from, defaultFormat, reportOptions.timezone)
      : undefined,
    to: reportOptions.to
      ? formatToTimezone(reportOptions.to, defaultFormat, reportOptions.timezone)
      : undefined,
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
  const dispatchGlobal = useDispatch();
  const dispatchAlert = useCallback(props => dispatchGlobal(showAlert(props)), [dispatchGlobal]);
  const refreshReportOptions = useCallback(
    payload => {
      return dispatch({
        type: 'UPDATE_REPORT_OPTIONS',
        payload,
        meta: { subaccounts, dispatchAlert },
      });
    },
    [dispatch, subaccounts, dispatchAlert],
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

  const setGroupBy = useCallback(
    payload => {
      return dispatch({
        type: 'SET_GROUP_BY',
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
    setGroupBy,
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
