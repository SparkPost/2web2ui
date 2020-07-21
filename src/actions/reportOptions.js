import moment from 'moment';

import {
  fetchMetricsDomains,
  fetchMetricsCampaigns,
  fetchMetricsSendingIps,
  fetchMetricsIpPools,
  fetchMetricsTemplates,
} from './metrics';

import { list as listSubaccounts } from './subaccounts';
import { list as listSendingDomains } from './sendingDomains';
import { getRelativeDates } from 'src/helpers/date';
import {
  getQueryFromOptions,
  getPrecision,
  getRollupPrecision,
  getRecommendedRollupPrecision,
} from 'src/helpers/metrics';
import { isSameDate, getLocalTimezone } from 'src/helpers/date';
import { dedupeFilters } from 'src/helpers/reports';
import _ from 'lodash';
import { selectFeatureFlaggedMetrics } from 'src/selectors/metrics';
import { isUserUiOptionSet } from 'src/helpers/conditions/user';
import config from 'src/config';

// array of all lists that need to be re-filtered when time changes
const metricLists = [
  fetchMetricsDomains,
  fetchMetricsCampaigns,
  fetchMetricsSendingIps,
  fetchMetricsIpPools,
  fetchMetricsTemplates,
];

/**
 * Returns a thunk that initializes the non-metric lists used
 * for populating the typeahead cache.
 *
 * The thunk skips calling any of the lists that already have values
 * in the redux store
 */
export function initTypeaheadCache() {
  return (dispatch, getState) => {
    const { subaccounts, sendingDomains } = getState();
    const requests = [];

    if (subaccounts.list.length === 0) {
      requests.push(dispatch(listSubaccounts()));
    }

    if (sendingDomains.list.length === 0) {
      requests.push(dispatch(listSendingDomains()));
    }
    return Promise.all(requests);
  };
}

/**
 * Refreshes the typeahead cache with the metrics lists. This occurs dynamically
 * whenever the user types in the search field but with a debounce.
 *
 * It will first try to pull the data from cache, if it exists and the time range is the same.
 * If there is no cache entry, it will make the api calls and add the results to the cache.
 */
export function refreshTypeaheadCache(options) {
  const params = getQueryFromOptions(options);
  return (dispatch, getState) => {
    const { typeahead } = getState();
    const { to: cachedTo, from: cachedFrom, cache } = typeahead;
    const { match, to: currentTo, from: currentFrom } = options;
    if (isSameDate(cachedFrom, currentFrom) && isSameDate(cachedTo, currentTo) && cache[match]) {
      dispatch({
        type: 'UPDATE_METRICS_FROM_CACHE',
        payload: cache[match],
      });
      return Promise.resolve();
    }
    const requests = metricLists.map(list => dispatch(list(params)));
    return Promise.all(requests).then(arrayOfMetrics => {
      // Flattens the array from array of metrics objects to an object with each metric as a key
      const metricsList = _.reduce(
        arrayOfMetrics,
        (accumulator, metric) => _.assign(accumulator, metric),
        {},
      );
      const payload = {
        from: currentFrom,
        to: currentTo,
        itemToCache: { [match]: metricsList },
      };

      dispatch({
        type: 'UPDATE_TYPEAHEAD_METRICS_CACHE',
        payload,
      });
    });
  };
}

export function addFilters(payload) {
  return {
    type: 'ADD_FILTERS',
    payload,
  };
}

export function removeFilter(payload) {
  return {
    type: 'REMOVE_FILTER',
    payload,
  };
}

export function setFilters(payload) {
  return {
    type: 'SET_FILTERS',
    payload,
  };
}

export function clearFilters() {
  return {
    type: 'CLEAR_FILTERS',
  };
}

// Updating timezone should only affect timezone
// Updating precision should only affect precision
// Updating relative range generates new datetimes
// Updating datetimes generates precision
// Datetimes update with any update if non-custom relative range

export function refreshReportOptions(payload) {
  return (dispatch, getState) => {
    const { reportOptions } = getState();
    let update = { ...reportOptions, ...payload };
    const { useMetricsRollup } = selectFeatureFlaggedMetrics(getState());
    const isHibanaEnabled = isUserUiOptionSet('isHibanaEnabled')(getState());

    if (!update.timezone) {
      update.timezone = getLocalTimezone();
    }

    if (!update.metrics) {
      update.metrics = isHibanaEnabled
        ? config.reportBuilder.defaultMetrics
        : config.summaryChart.defaultMetrics;
    }

    if (payload.filters) {
      update.filters = dedupeFilters(payload.filters);
    }

    if (!update.relativeRange) {
      update.relativeRange = isHibanaEnabled ? '7days' : 'day'; //Default relative range
    }

    if (isHibanaEnabled) {
      // explicit update of range, new dates, try to preserve precision
      let updateFrom = update.from;
      let updateTo = update.to;
      let updatePrecision = update.precision;
      if (update.relativeRange !== 'custom') {
        //regardless, update the dates
        const { from, to } = getRelativeDates(update.relativeRange, {
          precision: updatePrecision,
        });
        updateFrom = from;
        updateTo = to;
      }
      const precision =
        getRollupPrecision({ from: updateFrom, to: updateTo, precision: updatePrecision }) ||
        getRecommendedRollupPrecision(updateFrom, moment(updateTo));
      update = { ...update, from: updateFrom, to: updateTo, precision };
    } else {
      //old version of update

      const rollupPrecision = useMetricsRollup && update.precision;

      if (update.relativeRange !== 'custom') {
        const { from, to } = getRelativeDates(update.relativeRange, {
          precision: rollupPrecision,
        });
        //for metrics rollup, when using the relative dates, get the precision, else use the given precision
        //If precision is not in the URL, get the recommended precision.
        const precision = useMetricsRollup
          ? getRollupPrecision({ from, to, precision: rollupPrecision }) ||
            getRecommendedRollupPrecision(from, moment(to))
          : getPrecision(from, moment(to));
        update = { ...update, from, to, precision };
      } else {
        const precision = useMetricsRollup
          ? rollupPrecision || getRecommendedRollupPrecision(update.from, moment(update.to))
          : getPrecision(update.from, moment(update.to));
        update = { ...update, precision };
      }
    }

    return dispatch({
      type: 'UPDATE_REPORT_OPTIONS',
      payload: update,
    });
  };
}
