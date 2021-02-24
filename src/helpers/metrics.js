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
  apiDateFormatV2,
} = config;
const DELIMITERS = ',;:+~`!@#$%^*()-={}[]"\'<>?./|\\'.split('');

/**
 * @deprecated
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
  from = moment(from);
  to = moment(to);

  const apiMetricsKeys = getKeysFromMetrics(metrics);
  const delimiter = getDelimiter(filters);
  const options = {
    metrics: apiMetricsKeys.join(delimiter),
    from: from.format(apiDateFormat),
    to: to.format(apiDateFormat),
    delimiter,
    timezone,
    precision,
  };
  Object.assign(options, getFilterSets(filters, delimiter));
  if (match.length > 0) {
    options.match = match;
  }
  if (limit) {
    options.limit = limit;
  }
  return options;
}

// TODO: Replace original once OG theme is removed
/**
 * @name getQueryFromOptionsV2
 * @description Converts various report options into API ready content
 * @param {Date} from
 * @param {Date} from
 * @param {string} timezone
 * @param {string} precision
 * @param {Array[Object]} metrics - array of metrics objects (not just the keys)
 * @param {Array[Object]} filters
 * @param {Array} match
 * @param {Number} count
 */
export function getQueryFromOptionsV2({
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
    from: from ? formatToTimezone(from, apiDateFormatV2, timezone) : undefined,
    to: to ? formatToTimezone(to, apiDateFormatV2, timezone) : undefined,
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
 * Calculates the precision value for metrics Rollup. If the precision given
 * is still within range, do not change precision. If the possible precision options
 * do not include the current precision, get the recommended precision.
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
 * Creates an array of possible precision options for a time span
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
export function isForcedUTCRollupPrecision(precision) {
  return FORCED_UTC_ROLLUP_PRECISIONS.includes(precision);
}

/**
 * Round 'from' and 'to' to nearest precision
 *
 * @param fromInput
 * @param toInput
 * @param precision,
 * @return {{to: *|moment.Moment, from: *|moment.Moment}}
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
 * Returns verified from and to dates; throws an error if date range is invalid - catch this to reset to last state
 *
 * @param from
 * @param to
 * @param now
 * @param roundToPrecision
 * @return {*}
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
 * Transforms API result into chart-ready data in 2 steps:
 * 1. compute any necessary computed metrics
 * 2. arrange metrics into groups sorted by unit/measure
 *
 * @param {Array} metrics - list of currently selected metrics objects from config
 * @param {Array} data - results from the metrics API
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
 * Prepares request options/params based on the current state of the page and the passed in comparison object.
 *
 * @param {Object} comparison - passed in comparison when the user selects comparisons via "compare by"
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
 * @description Will split metric to either source from exclusively seed or panel for deliverability metrics
 * @param {Object} metric - Object to split
 * @param {Array[String]} dataSource - Array of values included for data source
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
