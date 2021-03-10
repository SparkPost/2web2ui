import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Page } from 'src/components/matchbox';
import { refreshEngagementReport } from 'src/actions/engagementReport';
import { selectReportSearchOptions } from 'src/selectors/reportSearchOptions';
import ReportOptions from 'src/pages/reports/components/ReportOptions';
import EngagementChart from './components/EngagementChart';
import EngagementSummary from './components/EngagementSummary';
import EngagementTable from './components/EngagementTable';

export class EngagementPage extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.reportOptions !== this.props.reportOptions) {
      this.props.refreshEngagementReport(this.props.reportOptions);
    }
  }

  render() {
    const { loading, aggregateMetrics, linkMetrics, engagementSearchOptions } = this.props;

    return (
      <Page title="Engagement Report">
        <ReportOptions reportLoading={loading} searchOptions={engagementSearchOptions} />
        <EngagementSummary
          accepted={aggregateMetrics.data.count_accepted}
          clicks={aggregateMetrics.data.count_unique_clicked_approx}
          loading={aggregateMetrics.loading}
          opens={aggregateMetrics.data.count_unique_confirmed_opened_approx}
          sent={aggregateMetrics.data.count_sent}
        />
        <EngagementChart
          accepted={aggregateMetrics.data.count_accepted}
          clicks={aggregateMetrics.data.count_unique_clicked_approx}
          loading={aggregateMetrics.loading}
          opens={aggregateMetrics.data.count_unique_confirmed_opened_approx}
          sent={aggregateMetrics.data.count_sent}
        />
        <EngagementTable data={linkMetrics.data} loading={linkMetrics.loading} />
      </Page>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.engagementReport.loading,
  aggregateMetrics: state.engagementReport.aggregateMetrics,
  linkMetrics: state.engagementReport.linkMetrics,
  reportOptions: state.reportOptions,
  engagementSearchOptions: selectReportSearchOptions(state),
});
const mapDispatchToProps = { refreshEngagementReport };

export default connect(mapStateToProps, mapDispatchToProps)(EngagementPage);
