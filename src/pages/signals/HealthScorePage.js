/* eslint-disable max-lines */
import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Panel, Grid } from '@sparkpost/matchbox';
import Page from './components/SignalsPage';
import BarChart from './components/charts/barchart/BarChart';
import DivergingBar from './components/charts/divergingBar/DivergingBar';
import HealthScoreActions from './components/actionContent/HealthScoreActions';
import TooltipMetric from './components/charts/tooltip/TooltipMetric';
import DateFilter from './components/filters/DateFilter';
import { HEALTH_SCORE_INFO, HEALTH_SCORE_COMPONENT_INFO, INJECTIONS_INFO, HEALTH_SCORE_COMPONENTS } from './constants/info';
import withHealthScoreDetails from './containers/HealthScoreDetailsContainer';
import withDateSelection from './containers/withDateSelection';
import { Loading } from 'src/components';
import Callout from 'src/components/callout';
import OtherChartsHeader from './components/OtherChartsHeader';
import ChartHeader from './components/ChartHeader';
import { formatFullNumber, roundToPlaces, formatNumber } from 'src/helpers/units';
import moment from 'moment';
import _ from 'lodash';

import SpamTrapsPreview from './components/previews/SpamTrapsPreview';
import EngagementRecencyPreview from './components/previews/EngagementRecencyPreview';
import styles from './DetailsPages.module.scss';

export class HealthScorePage extends Component {
  state = {
    selectedComponent: null
  }

  componentDidUpdate(prevProps) {
    //console.log('this.props healthscorepage', this.props);
    const { data, selectedDate } = this.props;

    const dataSetChanged = prevProps.data !== data;
    const selectedDataByDay = _.find(data, ['date', selectedDate]);

    // Select first component weight type
    if (dataSetChanged) {
      const firstComponentType = _.get(selectedDataByDay, 'weights[0].weight_type');
      this.setState({ selectedComponent: firstComponentType });
    }
  }

  handleComponentSelect = (node) => {
    this.setState({ selectedComponent: _.get(node, 'payload.weight_type') });
  }

  getXAxisProps = () => {
    const { xTicks } = this.props;
    return {
      ticks: xTicks,
      tickFormatter: (tick) => moment(tick).format('M/D')
    };
  }

  renderContent = () => {
    const { data = [], handleDateSelect, loading, gap, empty, error, selectedDate } = this.props;
    //console.log('props', this.props);
    const { selectedComponent } = this.state;
    const selectedWeights = _.get(_.find(data, ['date', selectedDate]), 'weights', []);
    const selectedWeightsAreEmpty = selectedWeights.every(({ weight }) => weight === null);
    const dataForSelectedWeight = data.map(({ date, weights }) => ({ date, ..._.find(weights, ['weight_type', selectedComponent]) }));

    let panelContent;

    if (empty) {
      panelContent = <Callout title='No Data Available'>Insufficient data to populate this chart</Callout>;
    }

    if (error) {
      panelContent = <Callout title='Unable to Load Data'>{error.message}</Callout>;
    }

    if (loading) {
      panelContent = (
        <div style={{ height: '220px', position: 'relative' }}>
          <Loading />
        </div>
      );
    }

    return (
      <Grid>
        <Grid.Column sm={12} md={7}>
          <Panel sectioned>
            <ChartHeader title='Health Score - 90 Days' tooltipContent={HEALTH_SCORE_INFO} />
            {panelContent || (
              <Fragment>
                <BarChart
                  gap={gap}
                  onClick={handleDateSelect}
                  disableHover={false}
                  selected={selectedDate}
                  timeSeries={data}
                  tooltipContent={({ payload = {}}) => (
                    <TooltipMetric label='Health Score' value={`${roundToPlaces(payload.health_score * 100, 1)}`} />
                  )}
                  yAxisRefLines={[
                    { y: 0.80, stroke: 'green', strokeWidth: 2 },
                    { y: 0.55, stroke: 'red', strokeWidth: 2 }
                  ]}
                  yKey='health_score'
                  yAxisProps={{
                    tickFormatter: (tick) => tick * 100
                  }}
                  xAxisProps={this.getXAxisProps()}
                />
                <ChartHeader title='Injections' tooltipContent={INJECTIONS_INFO} />
                <BarChart
                  gap={gap}
                  height={190}
                  onClick={handleDateSelect}
                  selected={selectedDate}
                  timeSeries={data}
                  tooltipContent={({ payload = {}}) => (
                    <TooltipMetric label='Injections' value={formatFullNumber(payload.injections)} />
                  )}
                  yKey='injections'
                  yAxisProps={{
                    tickFormatter: (tick) => formatNumber(tick)
                  }}
                  xAxisProps={this.getXAxisProps()}
                />
                {(selectedComponent && !selectedWeightsAreEmpty) && (
                  <Fragment>
                    <ChartHeader title={HEALTH_SCORE_COMPONENTS[selectedComponent].chartTitle} />
                    <BarChart
                      gap={gap}
                      height={190}
                      onClick={handleDateSelect}
                      selected={selectedDate}
                      timeSeries={dataForSelectedWeight}
                      tooltipContent={({ payload = {}}) => (
                        <TooltipMetric label={selectedComponent} value={`${roundToPlaces(payload.weight_value * 100, 4)}%`} />
                      )}
                      yKey='weight_value'
                      yAxisProps={{
                        tickFormatter: (tick) => `${roundToPlaces(tick * 100, 3)}%`
                      }}
                      xAxisProps={this.getXAxisProps()}
                    />
                  </Fragment>
                )}
              </Fragment>
            )}
          </Panel>
        </Grid.Column>
        <Grid.Column sm={12} md={5} mdOffset={0}>
          <div className={styles.OffsetCol}>
            <ChartHeader
              title='Health Score Components'
              date={selectedDate}
              hideLine
              padding='1rem 0 1rem'
              tooltipContent={HEALTH_SCORE_COMPONENT_INFO}
            />
            {(!loading && selectedWeightsAreEmpty) && (
              <Callout>Insufficient data to populate this chart</Callout>
            )}
            {(!panelContent && !selectedWeightsAreEmpty) && (
              <DivergingBar
                data={selectedWeights}
                xKey='weight'
                yKey='weight_type'
                yLabel={({ value }) => _.get(HEALTH_SCORE_COMPONENTS[value], 'label')}
                tooltipContent={({ payload = {}}) => _.get(HEALTH_SCORE_COMPONENTS[payload.weight_type], 'info')}
                onClick={this.handleComponentSelect}
                selected={selectedComponent}
              />
            )}
            {!panelContent && <HealthScoreActions weights={selectedWeights} date={selectedDate} />}
          </div>
        </Grid.Column>
      </Grid>
    );
  }

  render() {
    const { facet, facetId, subaccountId } = this.props;

    return (
      <Page
        breadcrumbAction={{ content: 'Back to Overview', to: '/signals', component: Link }}
        dimensionPrefix='Health Score for'
        facet={facet}
        facetId={facetId}
        subaccountId={subaccountId}
        primaryArea={<DateFilter />}>
        {this.renderContent()}
        <OtherChartsHeader facet={facet} facetId={facetId} subaccountId={subaccountId} />
        <Grid>
          <Grid.Column xs={12} sm={6}>
            <SpamTrapsPreview />
          </Grid.Column>
          <Grid.Column xs={12} sm={6}>
            <EngagementRecencyPreview />
          </Grid.Column>
        </Grid>
      </Page>
    );
  }
}

export default withHealthScoreDetails(withDateSelection(HealthScorePage));
