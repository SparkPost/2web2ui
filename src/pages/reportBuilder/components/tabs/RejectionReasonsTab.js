import React, { useEffect } from 'react';
import { refreshRejectionReportV2 as refreshRejectionReport } from 'src/actions/rejectionReport';
import { connect } from 'react-redux';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import { RejectionReasonsTable } from '../tables';

export function RejectionReasonsTab(props) {
  const { state: reportOptions } = useReportBuilderContext();
  const { loading, reasons, refreshRejectionReport } = props;

  useEffect(() => {
    if (reportOptions.to && reportOptions.from) {
      refreshRejectionReport(reportOptions);
    }
  }, [refreshRejectionReport, reportOptions]);

  return <RejectionReasonsTable reasons={reasons} loading={loading} />;
}

const mapStateToProps = state => ({
  loading: state.rejectionReport.reasonsLoading,
  reasons: state.rejectionReport.list,
});

const mapDispatchToProps = {
  refreshRejectionReport,
};
export default connect(mapStateToProps, mapDispatchToProps)(RejectionReasonsTab);
