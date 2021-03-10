import { createSelector } from 'reselect';

const selectSummaryMetrics = (state) => state.summaryChart.metrics;

export const selectSelectedMetrics = createSelector(
  [selectSummaryMetrics],
  (metrics = []) => metrics.map((metric) => metric.key));
