import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { refreshDelayReportV2 as refreshDelayReport } from 'src/actions/delayReport';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import { DelayReasonTable } from '../tables';

export function DelayReasonsTab({ reasons, totalAccepted, refreshDelayReport, tableLoading }) {
  const { state: reportOptions } = useReportBuilderContext();

  useEffect(() => {
    if (reportOptions.to && reportOptions.from) {
      refreshDelayReport(reportOptions);
    }
  }, [refreshDelayReport, reportOptions]);

  return (
    <DelayReasonTable reasons={reasons} totalAccepted={totalAccepted} loading={tableLoading} />
  );
}

const mapStateToProps = state => {
  const { aggregates } = state.delayReport;

  return {
    tableLoading: state.delayReport.aggregatesLoading || state.delayReport.reasonsLoading,
    reasons: state.delayReport.reasons,
    totalAccepted: aggregates ? aggregates.count_accepted : 1,
  };
};

const mapDispatchToProps = {
  refreshDelayReport,
};

export default connect(mapStateToProps, mapDispatchToProps)(DelayReasonsTab);
