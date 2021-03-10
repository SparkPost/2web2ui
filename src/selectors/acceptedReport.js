import { createSelector } from 'reselect';
import { reshapeAttempts } from 'src/helpers/accepted';
import { computeKeysForItem } from 'src/helpers/metrics';
import { getAcceptedMetrics } from 'src/helpers/accepted';

const computeAccepted = computeKeysForItem(getAcceptedMetrics());

const selectAcceptedReport = (state) => state.acceptedReport;
const selectAttempts = createSelector(
  [selectAcceptedReport],
  ({ attempts }) => attempts
);
const selectAggregates = createSelector(
  [selectAcceptedReport],
  ({ aggregates }) => aggregates
);

export const selectAcceptedAttempts = createSelector(
  [selectAggregates, selectAttempts],
  (aggregates, attempts) => {
    if (!aggregates.count_accepted) {
      return [];
    }
    return reshapeAttempts(attempts);
  }
);

export const selectAcceptedAggregates = createSelector(
  [selectAggregates],
  (aggregates) => {
    if (!aggregates.count_accepted) {
      return [];
    }
    return computeAccepted(aggregates);
  }
);

