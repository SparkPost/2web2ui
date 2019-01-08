import React, { Component } from 'react';
import { Panel } from '@sparkpost/matchbox';
import { PanelLoading, PageLink } from 'src/components';
import Callout from 'src/components/callout';
import withHealthScoreDetails from '../../containers/HealthScoreDetailsContainer';
import BarChart from '../charts/barchart/BarChart';
import ChartHeader from '../ChartHeader';

export class HealthScorePreview extends Component {
  renderContent = () => {
    const { data, gap, empty, error } = this.props;

    if (error) {
      return <Callout height='170px' title='Unable to Load Data'>{error.message}</Callout>;
    }

    if (empty) {
      return <Callout height='170px' title='No Data Available'>Insufficient data to populate this chart</Callout>;
    }

    return (
      <BarChart
        height={170}
        disableHover
        margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
        gap={gap}
        timeSeries={data}
        yKey='health_score'
        yAxisProps={{ hide: true }}
        xAxisProps={{ hide: true }}
      />
    );
  }

  render() {
    const { facet, facetId, loading } = this.props;

    if (loading) {
      return <PanelLoading minHeight='170px' />;
    }

    return (
      <PageLink to={`/signals/health-score/${facet}/${facetId}`}>
        <Panel>
          <Panel.Section>
            <ChartHeader
              title='Health Score'
              hideLine
              tooltipContent='TODO'
            />
          </Panel.Section>
          <Panel.Section>
            {this.renderContent()}
          </Panel.Section>
        </Panel>
      </PageLink>
    );
  }
}

export default withHealthScoreDetails(HealthScorePreview);
