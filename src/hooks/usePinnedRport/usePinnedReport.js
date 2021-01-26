import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRelativeDates, getLocalTimezone } from 'src/helpers/date';
import { parseSearchNew as parseSearch } from 'src/helpers/reports';
import { hydrateFilters } from 'src/pages/reportBuilder/helpers';
import { PRESET_REPORT_CONFIGS } from 'src/pages/reportBuilder/constants';
import _ from 'lodash';
import { list as listSubaccounts } from 'src/actions/subaccounts';
import { getReports } from 'src/actions/reports';
import { selectCondition } from 'src/selectors/accessConditionState';
import { isUserUiOptionSet } from 'src/helpers/conditions/user';

const defaultReportName = 'Summary Report';

export default function usePinnedReport(onboarding) {
  const pinnedReport = { options: {}, name: '', linkToReportBuilder: '/' };
  const dispatch = useDispatch();

  useEffect(() => {
    if (onboarding === 'done') {
      dispatch(listSubaccounts());
      dispatch(getReports());
    }
  }, [dispatch, onboarding]);

  const { list: reports, listLoading: reportsLoading } = useSelector(state => state.reports);

  const { list: subaccounts, listLoading: subaccountsLoading } = useSelector(
    state => state.subaccounts,
  );
  const pinnedReportId = useSelector(state =>
    selectCondition(isUserUiOptionSet('pinned_report_id'))(state),
  );

  const reportOptionsWithDates = reportOptions => {
    const { relativeRange, precision } = reportOptions;
    const { from, to } = getRelativeDates(relativeRange, { precision });
    // Note: when relativeRange is set to custom, getRelativeDates won't produce from and to, so reportOptions goes last in the return struct
    return {
      from,
      to,
      ...reportOptions,
    };
  };

  pinnedReport.loading = subaccountsLoading || reportsLoading;
  let summaryReportQueryString = PRESET_REPORT_CONFIGS.find(x => x.name === defaultReportName)
    .query_string;
  const summaryReportOptions = parseSearch(summaryReportQueryString);

  const report = _.find(reports, { id: pinnedReportId });
  if (report) {
    const options = parseSearch(report.query_string);
    pinnedReport.name = report.name;
    pinnedReport.options = reportOptionsWithDates({
      timezone: getLocalTimezone(),
      metrics: summaryReportOptions.metrics,
      comparisons: [],
      relativeRange: '7days',
      precision: 'hour',
      ...options,
      isReady: true,
      filters: hydrateFilters(options.filters, { subaccounts }),
    });
    pinnedReport.query_string = report.query_string;
    pinnedReport.linkToReportBuilder = report.query_string.includes('report=')
      ? `/signals/analytics?${report.query_string}`
      : `/signals/analytics?${report.query_string}&report=${pinnedReportId}`;
  } else {
    pinnedReport.name = defaultReportName;
    pinnedReport.options = reportOptionsWithDates({
      timezone: getLocalTimezone(),
      metrics: summaryReportOptions.metrics,
      comparisons: [],
      relativeRange: '7days',
      precision: 'hour',
      isReady: true,
      filters: hydrateFilters(summaryReportOptions.filters, { subaccounts }),
    });
    pinnedReport.linkToReportBuilder = `/signals/analytics?${summaryReportQueryString}`;
    pinnedReport.query_string = summaryReportQueryString;
  }

  return { pinnedReport };
}
