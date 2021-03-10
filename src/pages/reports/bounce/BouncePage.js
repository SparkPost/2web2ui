import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { safeRate } from 'src/helpers/math';
import { refreshBounceReport } from 'src/actions/bounceReport';
import { Empty, LongTextContainer, TableCollection, TabsWrapper } from 'src/components';
import { Percent } from 'src/components/formatters';
import { PanelLoading } from 'src/components/loading';
import { Page, Panel, Tabs } from 'src/components/matchbox';
import ReportOptions from '../components/ReportOptions';
import BounceChart from './components/BounceChart';
import MetricsSummary from '../components/MetricsSummary';
import { mapStateToProps } from 'src/selectors/bounceReport';
import AddFilterLink from '../components/AddFilterLink';

const columns = [
  { label: 'Reason', width: '45%', sortKey: 'reason' },
  { label: 'Domain', sortKey: 'domain' },
  { label: 'Category', sortKey: 'bounce_category_name' },
  { label: 'Classification', sortKey: 'classification_id' },
  { label: 'Count (%)', sortKey: 'count_bounce' },
];

export class BouncePage extends Component {
  state = {
    tab: 0,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.reportOptions !== this.props.reportOptions) {
      this.props.refreshBounceReport(this.props.reportOptions);
    }
  }

  getRowData = item => {
    const { aggregates = {} } = this.props;
    const {
      reason,
      domain,
      bounce_category_name,
      bounce_class_name,
      count_bounce,
      count_admin_bounce,
    } = item;
    // calculate the rate of admin bounces against all bounces
    let numerator = count_bounce;
    let denominator = aggregates.countBounce;

    if (bounce_category_name === 'Admin') {
      numerator = count_admin_bounce;
      denominator += aggregates.countAdminBounce;
    }

    return [
      <LongTextContainer text={reason} />,
      <AddFilterLink
        newFilter={{ type: 'Recipient Domain', value: domain }}
        reportType="bounce"
        content={domain}
      />,
      bounce_category_name,
      bounce_class_name,
      <span>
        {numerator}&nbsp;
        <small>
          (<Percent value={safeRate(numerator, denominator)} />)
        </small>
      </span>,
    ];
  };

  renderChart() {
    const { chartLoading, aggregates, categories, types, adminCategories } = this.props;

    if (!chartLoading) {
      if (
        _.isEmpty(aggregates) ||
        (!aggregates.countAdminBounce && this.state.tab === 1) ||
        (!aggregates.countBounce && this.state.tab === 0)
      ) {
        return <Empty message="No bounces to report" />;
      }
    }

    return (
      <Panel.LEGACY.Section>
        <BounceChart
          loading={chartLoading}
          aggregates={aggregates}
          categories={categories}
          types={types}
          admin={adminCategories}
          tab={this.state.tab}
        />
      </Panel.LEGACY.Section>
    );
  }

  renderCollection() {
    const { tableLoading } = this.props;
    const reasons = this.state.tab === 1 ? this.props.adminReasons : this.props.reasons;

    if (tableLoading) {
      return <PanelLoading />;
    }

    if (!reasons.length) {
      return (
        <Panel.LEGACY>
          <Empty message="No bounce reasons to report" />
        </Panel.LEGACY>
      );
    }

    return (
      <TableCollection
        columns={columns}
        rows={reasons}
        getRowData={this.getRowData}
        defaultSortColumn="count_bounce"
        defaultSortDirection="desc"
        pagination
        filterBox={{
          show: true,
          keyMap: {
            category: 'bounce_category_name',
            classification: 'bounce_class_name',
          },
          itemToStringKeys: ['bounce_category_name', 'bounce_class_name', 'domain', 'reason'],
          exampleModifiers: ['domain', 'category', 'classification'],
          matchThreshold: 5,
        }}
      />
    );
  }

  renderTopLevelMetrics() {
    const { chartLoading, aggregates } = this.props;
    const { countBounce, countSent, countAdminBounce } = aggregates;

    // TODO Add support doc link - <UnstyledLink to={LINKS.ADMIN_BOUNCE} external>Learn more</UnstyledLink>.
    const adminBounceText = countAdminBounce ? (
      <Fragment>
        {countAdminBounce.toLocaleString()} messages were categorized as Admin Bounces.
      </Fragment>
    ) : null;

    // Aggregates aren't ready until chart refreshes
    if (chartLoading) {
      return <PanelLoading minHeight="115px" />;
    }

    if (_.isEmpty(aggregates)) {
      return null;
    }

    return (
      <MetricsSummary
        rateValue={safeRate(countBounce, countSent)}
        rateTitle="Bounce Rate"
        secondaryMessage={adminBounceText}
      >
        <strong>{countBounce.toLocaleString()}</strong> of{' '}
        <strong>{countSent.toLocaleString()}</strong> sent messages bounced
      </MetricsSummary>
    );
  }

  renderTabs() {
    return (
      <Tabs
        tabs={[
          { content: 'Bounces', onClick: () => this.handleTab(0) },
          { content: 'Admin Bounces', onClick: () => this.handleTab(1) },
        ]}
        selected={this.state.tab}
      />
    );
  }

  handleTab = index => {
    this.setState({ tab: index });
  };

  render() {
    const { chartLoading, bounceSearchOptions } = this.props;
    return (
      <Page title="Bounce Report">
        <ReportOptions reportLoading={chartLoading} searchOptions={bounceSearchOptions} />
        {this.renderTopLevelMetrics()}

        <Panel.LEGACY>
          <TabsWrapper>{this.renderTabs()}</TabsWrapper>

          {this.renderChart()}
        </Panel.LEGACY>
        <hr />
        {this.renderCollection()}
      </Page>
    );
  }
}

const mapDispatchToProps = {
  refreshBounceReport,
};

export default connect(mapStateToProps, mapDispatchToProps)(BouncePage);
