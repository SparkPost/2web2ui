import { createSelector } from 'reselect';
import { formatAggregates } from 'src/helpers/bounce';
import _ from 'lodash';

const selectAggregates = ({ bounceReport }) => bounceReport.aggregates;

export const selectReasons = ({ bounceReport }) =>
  bounceReport.reasons.filter(reason => reason.count_bounce > 0);

export const selectFormattedAggregates = createSelector([selectAggregates], aggregates => {
  if (!aggregates.count_bounce && !aggregates.count_admin_bounce) {
    return [];
  }
  return formatAggregates(aggregates);
});
