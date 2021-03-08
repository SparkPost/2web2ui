import _ from 'lodash';
import qs from 'qs';
import queryString from 'query-string'; //TODO: Deprecate
import { getRelativeDates, relativeDateOptions } from 'src/helpers/date';
import { stringifyTypeaheadfilter } from 'src/helpers/string';
import { REPORT_BUILDER_FILTER_KEY_MAP } from 'src/constants';

export function dedupeFilters(filters) {
  return _.uniqBy(filters, stringifyTypeaheadfilter);
}

/**
 * Parses search string
 * @param  {string} search - location.search
 * @return {Object}
 *   {
 *     options - options for refresh actions
 *     filters - array of objects ready to be called with reportOptions.addFilter action
 *   }
 */
export function parseSearch(search) {
  if (!search) {
    return { options: {} };
  }

  const { from, to, range, metrics, timezone, precision, filters = [], report } = queryString.parse(
    search,
  );
  const filtersList = (typeof filters === 'string' ? [filters] : filters).map(filter => {
    const parts = filter.split(':');
    const type = parts.shift();
    let value;
    let id;

    // Subaccount filters include 3 parts
    // 'Subaccount:1234 (ID 554):554' -> { type: 'Subaccount', value: '1234 (ID 554)', id: '554' }
    if (type === 'Subaccount') {
      id = parts.pop();
      value = parts.join(':');
    } else {
      value = parts.join(':');
    }

    return { value, type, id };
  });

  let options = {};

  if (metrics) {
    options.metrics = typeof metrics === 'string' ? [metrics] : metrics;
  }

  const fromTime = new Date(from);
  const toTime = new Date(to);

  if (from && !isNaN(fromTime)) {
    options.from = fromTime;
  }

  if (to && !isNaN(toTime)) {
    options.to = toTime;
  }

  if (range) {
    const invalidRange = !_.find(relativeDateOptions, ['value', range]);
    const effectiveRange = invalidRange ? 'day' : range;
    options = { ...options, ...getRelativeDates(effectiveRange) };
  }

  if (precision) {
    options.precision = precision;
  }

  if (timezone) {
    options.timezone = timezone;
  }

  // filters are used in pages to dispatch updates to Redux store
  return { options, filters: filtersList, report };
}

export function parseSearchNew(search) {
  if (!search) {
    return {};
  }

  const {
    from,
    to,
    range,
    metrics,
    timezone,
    precision,
    filters = [],
    query_filters,
    comparisons,
    report,
    industryBenchmarkMetric,
    industryBenchmarkFilters,
  } = qs.parse(search, { ignoreQueryPrefix: true });

  let ret = {};

  if (report) {
    ret.report = report;
  }

  if (query_filters) {
    try {
      ret.filters = JSON.parse(decodeURI(query_filters));
    } catch {
      ret.filters = [];
    }
  } else {
    const filtersList = (typeof filters === 'string' ? [filters] : filters).map(filter => {
      const parts = filter.split(':');
      const type = parts.shift();
      let value;
      let id;

      // Subaccount filters include 3 parts
      // 'Subaccount:1234 (ID 554):554' -> { type: 'Subaccount', value: '1234 (ID 554)', id: '554' }
      if (type === 'Subaccount') {
        id = parts.pop();
        value = parts.join(':');
      } else {
        value = parts.join(':');
      }
      return { value, type, id };
    });

    ret.filters = mapFiltersToComparators(filtersList);
  }

  if (comparisons) {
    ret.comparisons = comparisons;
  }

  if (metrics) {
    ret.metrics = typeof metrics === 'string' ? [metrics] : metrics;
  }

  const fromTime = new Date(from);
  const toTime = new Date(to);

  if (from && !isNaN(fromTime)) {
    ret.from = fromTime;
  }

  if (to && !isNaN(toTime)) {
    ret.to = toTime;
  }

  if (range) {
    const invalidRange = !_.find(relativeDateOptions, ['value', range]);
    const effectiveRange = invalidRange ? 'day' : range;
    ret = { ...ret, ...getRelativeDates(effectiveRange) };
  }

  if (precision) {
    ret.precision = precision;
  }

  if (timezone) {
    ret.timezone = timezone;
  }

  if (industryBenchmarkMetric) {
    ret.industryBenchmarkMetric = industryBenchmarkMetric;
    if (industryBenchmarkFilters) {
      try {
        ret.industryBenchmarkFilters = JSON.parse(decodeURI(industryBenchmarkFilters));
      } catch {
        ret.industryBenchmarkFilters = { industryCategory: 'all', mailboxProvider: 'all' };
      }
    }
  }

  // filters are used in pages to dispatch updates to Redux store
  return ret;
}

export function mapFiltersToComparators(filters) {
  const mappedFilters = filters.reduce((acc, { value, type, id }) => {
    const filterKey = REPORT_BUILDER_FILTER_KEY_MAP[type];
    acc[filterKey] = acc[filterKey] || { eq: [] };
    acc[filterKey].eq.push(filterKey === 'subaccounts' ? id : value);
    return acc;
  }, {});

  if (_.isEmpty(mappedFilters)) return [];

  return [{ AND: mappedFilters }];
}
