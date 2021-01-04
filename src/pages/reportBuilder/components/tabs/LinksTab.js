import React, { useEffect } from 'react';
import { refreshEngagementReportV2 as refreshEngagementReport } from 'src/actions/engagementReport';
import { connect } from 'react-redux';
import { LinksTable } from '../tables';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';

export function LinksTab(props) {
  const { state: reportOptions } = useReportBuilderContext();
  const { loading, links, refreshEngagementReport, totalClicks } = props;

  useEffect(() => {
    if (reportOptions.to && reportOptions.from) {
      refreshEngagementReport(reportOptions);
    }
  }, [refreshEngagementReport, reportOptions]);

  return <LinksTable links={links} totalClicks={totalClicks} loading={loading} />;
}

const mapStateToProps = state => {
  const { aggregateMetrics = {}, linkMetrics = {} } = state.engagementReport;
  const { data: aggregateData = {} } = aggregateMetrics;
  return {
    loading: linkMetrics.loading || aggregateMetrics.loading,
    totalClicks: aggregateData.count_clicked,
    links: linkMetrics.data,
  };
};

const mapDispatchToProps = {
  refreshEngagementReport,
};
export default connect(mapStateToProps, mapDispatchToProps)(LinksTab);
