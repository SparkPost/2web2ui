import { createSelector, createStructuredSelector } from 'reselect';
import { getBandTypes, reshapeCategories, formatAggregates } from 'src/helpers/bounce';
import { selectReportSearchOptions } from './reportSearchOptions';
import _ from 'lodash';

const selectReportOptions = state => state.reportOptions;
const selectChartLoading = ({ bounceReport }) =>
  bounceReport.aggregatesLoading || bounceReport.categoriesLoading;
const selectReasonsLoading = ({ bounceReport }) => bounceReport.reasonsLoading;
const selectTableLoading = createSelector(
  [selectChartLoading, selectReasonsLoading],
  (chartLoading, reasonsLoading) => chartLoading || reasonsLoading,
);
const selectAggregates = ({ bounceReport }) => bounceReport.aggregates;
const selectClassifications = state => _.get(state, 'bounceReport.classifications', []);
export const selectReasons = ({ bounceReport }) =>
  bounceReport.reasons.filter(reason => reason.count_bounce > 0);
const selectAdminReasons = ({ bounceReport }) =>
  bounceReport.adminReasons.filter(reason => reason.count_admin_bounce > 0);

export const selectFormattedAggregates = createSelector([selectAggregates], aggregates => {
  if (!aggregates.count_bounce && !aggregates.count_admin_bounce) {
    return [];
  }
  return formatAggregates(aggregates);
});

const selectReshapedCategories = createSelector([selectClassifications], classifications =>
  reshapeCategories(classifications),
);

const selectCategories = createSelector([selectReshapedCategories], categories =>
  _.filter(categories, ({ name }) => name !== 'Admin'),
);

const selectAdminCategories = createSelector([selectReshapedCategories], categories => {
  const adminBounces = _.find(categories, ({ name }) => name === 'Admin');
  if (adminBounces) {
    return adminBounces.children;
  }
  return [];
});

const selectBandTypes = createSelector([selectFormattedAggregates], formattedAggregates =>
  getBandTypes(formattedAggregates),
);

// TODO: decide if these should live in selectors or in eventual containers
export const mapStateToProps = createStructuredSelector({
  chartLoading: selectChartLoading,
  tableLoading: selectTableLoading,
  reasons: selectReasons,
  adminReasons: selectAdminReasons,
  aggregates: selectFormattedAggregates,
  categories: selectCategories,
  types: selectBandTypes,
  adminCategories: selectAdminCategories,
  reportOptions: selectReportOptions,
  bounceSearchOptions: selectReportSearchOptions,
});
