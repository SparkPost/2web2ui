import { createSelector } from 'reselect';
import moment from 'moment';
import { stringifyTypeaheadfilter } from 'src/helpers/string';
import { getMetricsFromKeys } from 'src/helpers/metrics';
import _ from 'lodash';

const selectDateOptions = state => ({
  from: moment(state.reportOptions.from)
    .utc()
    .format(),
  to: moment(state.reportOptions.to)
    .utc()
    .format(),
  range: state.reportOptions.relativeRange,
  timezone: state.reportOptions.timezone,
  precision: state.reportOptions.precision,
});

const selectTypeaheadFilters = state => ({
  filters: _.get(state, 'reportOptions.filters', []).map(stringifyTypeaheadfilter),
});

const selectSummaryMetrics = state => ({
  metrics: _.get(state, 'reportOptions.metrics', []).map(metric =>
    typeof metric === 'string' ? metric : metric.key,
  ),
  //TODO RB CLEANUP: can probably remove the check if it's an object
});

export const selectSummaryMetricsProcessed = state =>
  getMetricsFromKeys(_.get(state, 'reportOptions.metrics', []), true);

/**
 * Converts reportOptions for url sharing
 */
export const selectReportSearchOptions = createSelector(
  [selectDateOptions, selectTypeaheadFilters],
  (dates, filters) => ({ ...dates, ...filters }),
);

/**
 * Converts reportOptions for url sharing for the summary chart
 */
export const selectSummaryChartSearchOptions = createSelector(
  [selectDateOptions, selectTypeaheadFilters, selectSummaryMetrics],
  (dates, filters, metrics) => ({ ...dates, ...filters, ...metrics }),
);
