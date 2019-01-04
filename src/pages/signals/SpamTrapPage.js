import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Panel, Grid } from '@sparkpost/matchbox';
import Page from './components/SignalsPage';
import BarChart from './components/charts/barchart/BarChart';
import Actions from './components/Actions';
import TooltipMetric from './components/charts/tooltip/TooltipMetric';
import DateFilter from './components/filters/DateFilter';
import withSpamTrapDetails from './containers/SpamTrapDetailsContainer';
import { Loading } from 'src/components';
import Callout from 'src/components/callout';
import OtherChartsHeader from './components/OtherChartsHeader';
import Calculation from './components/viewControls/Calculation';
import ChartHeader from './components/ChartHeader';
import { formatFullNumber, roundToPlaces } from 'src/helpers/units';
import moment from 'moment';
import _ from 'lodash';

import EngagementRecencyPreview from './components/previews/EngagementRecencyPreview';

export class SpamTrapPage extends Component {
  state = {
    calculation: 'absolute'
  }

  handleCalculationToggle = (value) => {
    this.setState({ calculation: value });
  }

  getYAxisProps = () => {
    const { calculation } = this.state;

    return {
      tickFormatter: calculation === 'relative' ? (tick) => `${roundToPlaces(tick * 100, 2)}%` : null
    };
  }

  getXAxisProps = () => {
    const { xTicks } = this.props;
    return {
      ticks: xTicks,
      tickFormatter: (tick) => moment(tick).format('M/D')
    };
  }

  getTooltipContent = ({ payload = {}}) => (
    <Fragment>
      <TooltipMetric label='Spam Trap Hits' value={formatFullNumber(payload.trap_hits)} />
      <TooltipMetric label='Injections' value={formatFullNumber(payload.injections)} />
      <TooltipMetric label='Spam Trap Rate' value={`${roundToPlaces(payload.relative_trap_hits * 100, 4)}%`} />
    </Fragment>
  )

  renderContent = () => {
    const { data = [], loading, gap, empty, error } = this.props;
    const { calculation } = this.state;
    let chartPanel;

    if (empty) {
      chartPanel = <Callout title='No Data Available'>Insufficient data to populate this chart</Callout>;
    }

    if (error) {
      chartPanel = <Callout title='Unable to Load Data'>{error.message}</Callout>;
    }

    if (loading) {
      chartPanel = (
        <div style={{ height: '220px', position: 'relative' }}>
          <Loading />
        </div>
      );
    }

    return (
      <Grid>
        <Grid.Column sm={12} md={7}>
          <Panel sectioned>
            <ChartHeader
              title='Spam Trap Monitoring'
              primaryArea={
                <Calculation
                  initialSelected={calculation}
                  onChange={this.handleCalculationToggle}
                />
              }
            />
            {chartPanel || (
              <BarChart
                gap={gap}
                timeSeries={data}
                tooltipContent={this.getTooltipContent}
                yKey={calculation === 'absolute' ? 'trap_hits' : 'relative_trap_hits'}
                xKey='dt'
                yAxisProps={this.getYAxisProps()}
                xAxisProps={this.getXAxisProps()}
              />
            )}
          </Panel>
        </Grid.Column>
        <Grid.Column sm={12} md={5} mdOffset={0}>
          {/* TODO finish actions */}
          <Actions actions={[
            { content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod.', link: 'https://www.sparkpost.com' }
          ]}/>
        </Grid.Column>
      </Grid>
    );
  }

  render() {
    const { facetId } = this.props;

    return (
      <Page
        breadcrumbAction={{ content: 'Back to Overview', to: '/signals', component: Link }}
        subtitle={`Spam Trap Monitoring for ${facetId}`}
        primaryArea={<DateFilter />}>
        {this.renderContent()}
        <OtherChartsHeader facetId={facetId} />
        <Grid>
          <Grid.Column xs={12} sm={6}>
            <EngagementRecencyPreview />
          </Grid.Column>
          <Grid.Column xs={12} sm={6}>
            {/* TODO replace with health score preview */}
          </Grid.Column>
        </Grid>
      </Page>
    );
  }
}

export default withSpamTrapDetails(SpamTrapPage);
