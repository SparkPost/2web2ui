import moment from 'moment';
import _ from 'lodash';
import { list as METRICS_LIST } from 'src/config/metrics';
import config from 'src/config';
import { HIBANA_METRICS_COLORS, REPORT_BUILDER_FILTER_KEY_MAP } from 'src/constants';
import { getRelativeDates, formatToTimezone } from 'src/helpers/date';
import { dehydrateFilters, getFilterTypeKey } from 'src/pages/reportBuilder/helpers';
import { safeDivide, safeRate } from './math';

const {
  metricsPrecisionMap: precisionMap,
  metricsRollupPrecisionMap: rollupPrecisionMap,
  apiDateFormat,
} = config;
const DELIMITERS = ',;:+~`!@#$%^*()-={}[]"\'<>?./|\\'.split('');

/**
 * @name getQueryFromOptions
 * @description Convert's report state options to valid API parameter values for
 *
 * @param {Date} from The beginning of the user's desired date range for a report.
 * @param {Date} to The end of the user's desired date range for a report.
 * @param {string} timezone The user's selected timezone as an [IANA timezone string](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
 * @param {string} precision The precision of returned timeseries data selected by the user, e.g. '7days', 'custom',
 * @param {Array[metric]} metrics array of metrics objects with relevant properties (not just string keys)
 *   @param {string} metric.category metric category used to render metrics within several groups
 *   @param {string} metric.key unique identifier for the metric, e.g., `count_targeted`. [Maps to the API](https://developers.sparkpost.com/api/metrics/#header-terminology)
 *   @param {string} metric.description unique description for each metric
 *   @param {string} metric.label human-readable metric label used for rendering in the UI
 *   @param {string} metric.name ⚠️ Duplicate: appears to match the value for metric.key
 *   @param {string} metric.type whether the metric is a 'total' or 'percentage' - 'percentage' metrics are typically calculated in the UI
 *   @param {string} metric.computeKeys metric keys used to calculate the metric value when the metric is 'type' 'percentage'
 *   @param {string} metric.compute function used to derive the calculated metric value from the relevant 'computeKeys'
 *   @param {string} metric.unit metric unit of measurement. 'number' | 'bytes' | 'percent'
 *   @param {boolean} metric.inSummary ⚠️ Deprecated: Used to determine metrics rendered within a particular modal that is slated for removal from the app
 * @param {Array[filter]} filters array of filter objects with relevant properties
 * @param {Array} match string by which to filter returned results from [metrics list endpoints](https://developers.sparkpost.com/api/metrics/#metrics-lists)
 * @param {Number} limit maximum number of results to return from [metrics list endpoints](https://developers.sparkpost.com/api/metrics/#metrics-lists)
 *
 * @returns {Object} options returns structured object of [query string parameters](https://developers.sparkpost.com/api/metrics/#metrics-get-time-series-metrics) as required by metrics endpoints
 */
export function getQueryFromOptions({
  from,
  to,
  timezone,
  precision,
  metrics,
  filters = [],
  match = '',
  limit,
}) {
  const apiMetricsKeys = getKeysFromMetrics(metrics);
  const delimiter = getDelimiter(filters);
  const options = {
    metrics: apiMetricsKeys.join(delimiter),
    from: from ? formatToTimezone(from, apiDateFormat, timezone) : undefined,
    to: to ? formatToTimezone(to, apiDateFormat, timezone) : undefined,
    delimiter,
    timezone,
    precision,
  };
  const dehydratedFilters = dehydrateFilters(filters);

  options.query_filters = filters.length
    ? JSON.stringify({ groupings: dehydratedFilters })
    : undefined;

  if (match.length > 0) {
    options.match = match;
  }

  if (limit) {
    options.limit = limit;
  }

  return options;
}

export function pushToKey(obj, key, value) {
  const updated = { [key]: [], ...obj };
  updated[key].push(value);
  return updated;
}

export function getFilterSets(filters = [], delimiter) {
  const hash = filters.reduce(
    (result, { type, value, id }) =>
      pushToKey(result, REPORT_BUILDER_FILTER_KEY_MAP[type], type === 'Subaccount' ? id : value),
    {},
  );
  return _.mapValues(hash, v => v.join(delimiter));
}

/**
 * Get an array of unique chars based on all filters and
 * find all delimiters that don't appear in that list, then
 * return the first one to use as the delimiter
 *
 * @param {array} filters
 */
export function getDelimiter(filters = []) {
  const uniques = _.uniq(filters.map(f => f.value).join(''));
  return _.difference(DELIMITERS, uniques).shift();
}

/**
 * Calculates the difference between 2 moment dates
 * and returns the closest precision value
 *
 */
export function getPrecision({ from, to = moment() }) {
  const diff = moment(to).diff(moment(from), 'minutes');
  return precisionMap.find(({ time }) => diff <= time).value;
}

/**
 * @name getRollupPrecision
 * @description Calculates the precision value for metrics Rollup. If the precision given
 * is still within range, do not change precision. If the possible precision options
 * do not include the current precision, get the recommended precision.
 *
 * @param {Date} from The beginning of the user's desired date range for a report.
 * @param {Date} to The end of the user's desired date range for a report.
 * @param {string} precision The precision of returned timeseries data selected by the user, e.g. '7days', 'custom',
 *
 * @returns {string} the precision of timeseries data to be returned - see the [API docs for examples](https://developers.sparkpost.com/api/metrics/#metrics-get-time-series-metrics)
 */
export function getRollupPrecision({ from, to = moment(), precision }) {
  if (!precision) {
    return getRecommendedRollupPrecision(from, to);
  }
  const precisionOptions = getPrecisionOptions(moment(from), moment(to));
  const precisionOptionsValues = precisionOptions.map(({ value }) => value);
  if (precisionOptionsValues.includes(precision)) {
    return precision;
  }
  return getRecommendedRollupPrecision(from, to);
}

export function getRecommendedRollupPrecision(from, to = moment()) {
  const diff = moment(to).diff(moment(from), 'minutes');
  return rollupPrecisionMap.find(({ recommended }) => diff <= recommended).value;
}

/**
 * @name getPrecisionOptions
 * @description Creates an array of possible precision options for a time span
 *
 * @param {Date} from The beginning of the user's desired date range for a report.
 * @param {Date} to The end of the user's desired date range for a report.
 *
 * @returns {string} the precision of timeseries data to be returned - see the [API docs for examples](https://developers.sparkpost.com/api/metrics/#metrics-get-time-series-metrics)
 */
export function getPrecisionOptions(from, to = moment()) {
  const diff = to.diff(from, 'minutes');
  return _getPrecisionOptions(diff);
}

const _getPrecisionOptions = _.memoize(diff => {
  const result = rollupPrecisionMap
    .filter(({ min, max }) => diff >= min && diff <= max)
    .map(({ value }) => ({ value, label: _.startCase(_.words(value).join(' ')) }));
  return result;
});

export function getMomentPrecisionByDate(from, to = moment()) {
  const diff = to.diff(from, 'minutes');
  if (diff <= 60 * 24) {
    return 'minutes';
  }
  return diff <= 60 * 24 * 2 ? 'hours' : 'days';
}

export function getMomentPrecisionByPrecision(precision) {
  if (precision.includes('min')) {
    return 'minutes';
  }
  if (['day', 'week', 'month'].includes(precision)) {
    return 'day';
  }
  return 'hour';
}

export function getPrecisionType(precision) {
  switch (precision) {
    case '1min':
    case '5min':
    case '15min':
      return 'hour';
    default:
      return precision;
  }
}

// We are forced to use UTC for any precision greater or equal to 'day'
const FORCED_UTC_ROLLUP_PRECISIONS = ['day', 'week', 'month'];

/**
 * @name isForcedUTCRollupPrecision
 * @description determines whether the passed in precision means a UTC date must be used as the timezone for metrics API requests
 *
 * @param {string} precision - the user's selected date precision
 *
 * @returns {boolean}
 */
export function isForcedUTCRollupPrecision(precision) {
  return FORCED_UTC_ROLLUP_PRECISIONS.includes(precision);
}

/**
 * @name roundBoundaries
 * @description Round 'from' and 'to' to nearest precision
 *
 * @param {Date} from The beginning of the user's desired date range for a report.
 * @param {Date} to The end of the user's desired date range for a report.
 * @param {string} precision The precision of returned timeseries data
 *
 * @returns {{to: *|moment.Moment, from: *|moment.Moment}}
 */
export function roundBoundaries({
  from: fromInput,
  to: toInput,
  now = moment(),
  precision: defaultPrecision,
}) {
  const from = moment(fromInput);
  const to = moment(toInput);

  const precision = defaultPrecision || getPrecision({ from: from, to: to });
  const momentPrecision = getMomentPrecisionByPrecision(precision);
  // extract rounding interval from precision query param value
  const roundInt = momentPrecision === 'minutes' ? parseInt(precision.replace('min', '')) : 1;

  floorMoment(from, roundInt, momentPrecision);

  // if we're only at a minute precision, don't round up to the next minute
  const isToSameAsNow = Math.abs(moment(now).diff(to, 'minutes')) < 1;

  if (precision !== '1min' && !isToSameAsNow) {
    ceilMoment(to, roundInt, momentPrecision);
  }

  return { to, from };
}

/**
 * Rounds down moment to precision and interval
 * @param time
 * @param roundInt
 * @param precision
 */
function floorMoment(time, roundInt = 1, precision = 'minutes') {
  const value = time.get(precision);
  const roundedValue = Math.floor(value / roundInt) * roundInt;
  time.set(precision, roundedValue).startOf(precision);
}

/**
 * Rounds up moment to precision and interval
 * @param time
 * @param roundInt
 * @param precision
 */
function ceilMoment(time, roundInt = 1, precision = 'minutes') {
  const value = time.get(precision);
  const roundedValue = Math.ceil(value / roundInt) * roundInt;
  time.set(precision, roundedValue).endOf(precision);
}

/**
 * @name getValidDateRange
 * @description returns verified from and to dates; throws an error if date range is invalid - catch this to reset to last state
 *
 * @param {Date} from The beginning of the user's desired date range for a report.
 * @param {Date} to The end of the user's desired date range for a report.
 * @param {Date} now the current date
 * @param {boolean} roundToPrecision whether to round the returned from and to dates according to the passed in precision
 * @param {boolean} preventFuture whether or not to prevent future dates from returning
 * @param {string} precision The precision of returned timeseries data selected by the user, e.g. '7days', 'custom',
 *
 * @returns {from, to} returns a valid from and to date range
 */
export function getValidDateRange({
  from,
  to,
  now = moment(),
  roundToPrecision,
  preventFuture,
  precision,
}) {
  // If we're not rounding, check to see if we want to prevent future dates. if not, we're good.
  const nonRoundCondition = roundToPrecision || precision || !preventFuture || to.isBefore(now);
  const validDates = _.every(
    _.map([from, to, now], date => moment.isMoment(date) && date.isValid()),
  );

  if (validDates && from.isBefore(to) && nonRoundCondition) {
    if (!roundToPrecision) {
      return { from, to };
    }

    // Use the user's rounded 'to' input if it's less than or equal to 'now' rounded up to the nearest precision,
    // otherwise use the valid range and precision of floor(from) to ceil(now).
    // This is necessary because the precision could change between the user's invalid range, and a valid range.
    const { from: roundedFromNow, to: roundedNow } = roundBoundaries({ from, to: now, precision });
    const { from: roundedFrom, to: roundedTo } = roundBoundaries({ from, to, precision });

    if (roundedTo.isSameOrBefore(roundedNow)) {
      from = roundedFrom;
      to = roundedTo;
    } else {
      from = roundedFromNow;
      to = roundedNow;
    }

    return { from, to };
  }

  throw new Error('Invalid date range selected');
}

/**
 * Retrieve metrics configuration information based on the passed in key
 * @param {string} metricKey relevant key based on available metrics
 */
export function getMetricFromKey(metricKey) {
  return METRICS_LIST.find(metric => metric.key === metricKey);
}

export function _getMetricsFromKeys(keys = []) {
  const metricsColors = HIBANA_METRICS_COLORS;

  return keys.map((metric, i) => {
    const found = METRICS_LIST.find(M => M.key === metric || M.key === metric.key);

    if (!found) {
      throw new Error(`Cannot find metric: ${JSON.stringify(metric)}`);
    }

    return { ...found, name: found.key, stroke: metricsColors[i % metricsColors.length] };
  });
}

/**
 * @name getMetricFromKey
 * @description Retrieves an array of metrics objects from the passed in array of metric string keys
 *
 * @param keys array of metric string
 *
 * @returns {Array[metric]} returns an array of metrics objects derived from metrics configuration, formatted for use in the UI
 */
export const getMetricsFromKeys = _.memoize(_getMetricsFromKeys, (keys = []) => `${keys.join('')}`);

export function getKeysFromMetrics(metrics = []) {
  const flattened = _.flatMap(metrics, ({ key, computeKeys }) => (computeKeys ? computeKeys : key));
  return _.uniq(flattened);
}

export function computeKeysForItem(metrics = []) {
  return item =>
    metrics.reduce((acc, metric) => {
      if (metric.compute) {
        acc[metric.key] = metric.compute(acc, metric.computeKeys) || 0;
      }
      return acc;
    }, item);
}

/**
 * @name transformData
 * @description Transforms API result into chart-ready data in 2 steps:
 * 1. computes any necessary computed metrics
 * 2. arranges metrics into groups sorted by unit/measure
 *
 * @param {Array} metrics list of currently selected metrics objects from config
 * @param {Array} data results from the metrics API
 *
 * @return {Array} returns data in a format consumable by charts UI
 */
export function transformData(data = [], metrics = []) {
  return data.map(computeKeysForItem(metrics));
}

// Extract from, to, filters (campaign, template, ...) and any other included update fields
// into a set of common options for metrics queries.
export function buildCommonOptions(reportOptions, updates = {}) {
  return {
    ...reportOptions,
    ...updates,
    ...getRelativeDates(reportOptions.relativeRange),
    ...getRelativeDates(updates.relativeRange),
  };
}

export function average(item, keys = []) {
  return safeDivide(item[keys[0]], item[keys[1]]);
}

export function rate(item, keys = []) {
  return safeRate(item[keys[0]], item[keys[1]]);
}

/**
 * @name getFilterByComparison
 * @description prepares request options/params based on the current state of the page and the passed in comparison object.
 *
 * @param {Object} comparison - passed in comparison object when the user selects comparisons via "compare by"
 *
 * @returns {Object} returns an [advanced filter object](https://developers.sparkpost.com/api/metrics/#header-advanced-filters]) derived from the user's selected comparison
 */
export function getFilterByComparison(comparison) {
  const filterId = getFilterTypeKey(comparison.type);

  if (!filterId)
    throw new Error(
      `Invalid comparison ${comparison} - please supply a valid comparison to "useComparisonArguments".`,
    );

  // Returns according to the metrics advanced filters:
  // https://developers.sparkpost.com/api/metrics/#header-advanced-filters
  return {
    AND: {
      [filterId]: {
        eq: [comparison], // The `dehydrateFilters` helper expects this structure
      },
    },
  };
}

/**
 * @name splitDeliverabilityMetric
 * @description Splits metric to either source from exclusively seed or panel data for deliverability metrics
 *
 * @param {Object} metric metrics object to split
 * @param {Array[String]} dataSource array of values included for data source
 *
 * @returns {Object} returns metrics object with the relevant `_seed` or `_panel` key - see list of [metrics keys in the API docs](https://developers.sparkpost.com/api/metrics/#metrics-get-time-series-metrics)
 */
export function splitDeliverabilityMetric(metric, dataSource) {
  if (metric.product !== 'deliverability') {
    return metric;
  }

  const hasPanel = dataSource.includes('panel');
  const hasSeed = dataSource.includes('seed');
  const hasBoth = hasSeed && hasPanel;
  const targetString = hasPanel ? 'panel' : 'seed';

  if (!hasPanel && !hasSeed) {
    return metric;
  }

  if (hasBoth) {
    return metric;
  }

  switch (metric.key) {
    case 'count_inbox':
      return {
        ...metric,
        computeKeys: [`count_inbox_${targetString}`],
        compute: data => data[`count_inbox_${targetString}`],
      };
    case 'count_spam':
      return {
        ...metric,
        computeKeys: [`count_spam_${targetString}`],
        compute: data => data[`count_inbox_${targetString}`],
      };
    case 'inbox_folder_rate':
      return {
        ...metric,
        computeKeys: [`count_spam_${targetString}`, `count_inbox_${targetString}`],
        compute: data =>
          safeRate(
            data[`count_inbox_${targetString}`],
            data[`count_inbox_${targetString}`] + data[`count_spam_${targetString}`],
          ),
      };
    case 'spam_folder_rate':
      return {
        ...metric,
        computeKeys: [`count_spam_${targetString}`, `count_inbox_${targetString}`],
        compute: data =>
          safeRate(
            data[`count_spam_${targetString}`],
            data[`count_inbox_${targetString}`] + data[`count_spam_${targetString}`],
          ),
      };
    default:
      return metric; //Other deliverability metrics have no changes
  }
}
