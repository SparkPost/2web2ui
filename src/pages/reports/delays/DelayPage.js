import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { refreshDelayReport } from 'src/actions/delayReport';
import { selectReportSearchOptions } from 'src/selectors/reportSearchOptions';
import { PanelLoading } from 'src/components/loading';
import { Page } from 'src/components/matchbox';
import ReportOptions from 'src/pages/reports/components/ReportOptions';
import MetricsSummary from '../components/MetricsSummary';
import DelaysDataTable from './components/DelaysDataTable';
import { safeRate } from 'src/helpers/math';

export class DelayPage extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.reportOptions !== this.props.reportOptions) {
      this.props.refreshDelayReport(this.props.reportOptions);
    }
  }

  renderDataTable() {
    const { loading, reasons, totalAccepted } = this.props;

    if (loading) {
      return <PanelLoading />;
    }

    return <DelaysDataTable totalAccepted={totalAccepted} rows={reasons} />;
  }

  renderTopLevelMetrics() {
    const { aggregatesLoading, aggregates } = this.props;
    const { count_delayed, count_delayed_first, count_accepted } = aggregates;

    if (aggregatesLoading) {
      return <PanelLoading minHeight="115px" />;
    }

    if (_.isEmpty(aggregates)) {
      return null;
    }

    return (
      <MetricsSummary
        rateValue={safeRate(count_delayed_first, count_accepted)}
        rateTitle="Delayed Rate"
        secondaryMessage={`There were ${count_delayed.toLocaleString()} total delays in this time period. (Note: messages may be delayed multiple times)`}
      >
        <strong>{count_delayed_first.toLocaleString()}</strong> of{' '}
        <strong>{count_accepted.toLocaleString()}</strong> accepted messages were delayed on first
        attempt
      </MetricsSummary>
    );
  }

  render() {
    const { loading, delaySearchOptions } = this.props;

    return (
      <Page title="Delay Report">
        <ReportOptions reportLoading={loading} searchOptions={delaySearchOptions} />
        {this.renderTopLevelMetrics()}
        {this.renderDataTable()}
      </Page>
    );
  }
}

const mapStateToProps = state => {
  const { aggregates } = state.delayReport;
  return {
    loading: state.delayReport.aggregatesLoading || state.delayReport.reasonsLoading,
    reasons: state.delayReport.reasons,
    totalAccepted: aggregates ? aggregates.count_accepted : 1,
    aggregates,
    aggregatesLoading: state.delayReport.aggregatesLoading,
    reportOptions: state.reportOptions,
    delaySearchOptions: selectReportSearchOptions(state),
  };
};

const mapDispatchToProps = {
  refreshDelayReport,
};

export default connect(mapStateToProps, mapDispatchToProps)(DelayPage);
