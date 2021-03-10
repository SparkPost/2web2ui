import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { refreshBounceReportV2 as refreshBounceReport } from 'src/actions/bounceReport';
import { mapStateToProps } from 'src/selectors/bounceReport';
import { BounceReasonTable } from '../tables';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';

export function BounceReasonsTab({ aggregates, reasons, refreshBounceReport, tableLoading }) {
  const { state: reportOptions } = useReportBuilderContext();

  useEffect(() => {
    if (reportOptions.to && reportOptions.from) {
      refreshBounceReport(reportOptions);
    }
  }, [refreshBounceReport, reportOptions]);

  return <BounceReasonTable aggregates={aggregates} reasons={reasons} loading={tableLoading} />;
}

const mapDispatchToProps = {
  refreshBounceReport,
};

export default connect(mapStateToProps, mapDispatchToProps)(BounceReasonsTab);
