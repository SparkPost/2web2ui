import { createSelector } from 'reselect';
import { isUserUiOptionSet } from 'src/helpers/conditions/user';
import { selectCondition } from 'src/selectors/accessConditionState';

export const selectFeatureFlaggedMetrics = createSelector(
  [
    selectCondition(isUserUiOptionSet('use-metrics-rollup')),
    // add more metrics feature flags here
  ],
  () => ({ useMetricsRollup: true }),
);
