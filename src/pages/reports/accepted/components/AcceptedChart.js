import React, { Component } from 'react';
import _ from 'lodash';
import { Grid, Panel } from 'src/components/matchbox';
import { Loading, PieChart } from 'src/components';
import { useHibana } from 'src/context/HibanaContext';
import { generateColors } from 'src/helpers/color';
import styles from './AcceptedChart.module.scss';
import { formatPercent } from 'src/helpers/units';
import { safeRate } from 'src/helpers/math';

export class AcceptedChartClassComponent extends Component {
  state = {
    hoveredItem: null,
    active: null,
  };

  /**
   * Handles mouse over event for LegendItems and BounceChart
   * @param  {Object} e - Recharts synthetic event - behavior mimiced from Legend
   * @param  {string} hoverSet - 'primary' | 'secondary'
   */
  handleMouseOver = (e, hoverSet) => {
    const { attempts } = this.props;
    const { active } = this.state;
    const { name, count } = e;

    let dataSet = attempts;

    if (active) {
      dataSet = active.children;
    }

    const hoveredItem = {
      name,
      count,
      index: _.findIndex(dataSet, { name }),
      dataSet: hoverSet,
    };

    this.setState({ hoveredItem });
  };

  handleMouseOut = () => {
    this.setState({ hoveredItem: null });
  };

  handleClick = ({ name, children, count }) => {
    if (children) {
      this.setState({
        active: { name, children, count },
        hoveredItem: null,
      });
    }
  };

  handleBreadcrumb = () => {
    this.setState({ active: null });
  };

  getLabelProps = () => {
    const { aggregates } = this.props;
    const { hoveredItem } = this.state;

    return hoveredItem
      ? {
          name: hoveredItem.name,
          value: formatPercent(safeRate(hoveredItem.count, aggregates.count_accepted)),
        }
      : {
          name: 'Accepted Rate',
          value: formatPercent(safeRate(aggregates.count_accepted, aggregates.count_sent)),
        };
  };

  getLegendHeaderData = () => {
    const { aggregates } = this.props;
    const { active } = this.state;

    // Header with breadcrumb & active data
    if (active) {
      return [
        {
          name: 'Accepted',
          breadcrumb: true,
          onClick: this.handleBreadcrumb,
          count: aggregates.count_accepted,
        },
        { name: 'Sent', count: aggregates.count_sent },
        { name: active.name, count: active.count },
      ];
    }

    // Default header
    return [
      { name: 'Accepted', count: aggregates.count_accepted },
      { name: 'Sent', count: aggregates.count_sent },
    ];
  };

  // Gets primary and secondary data for BounceChart & Legend
  getData = () => {
    const { attempts } = this.props;
    const { active } = this.state;

    let data = attempts;

    if (active) {
      data = active.children;
    }

    return {
      primaryData: generateColors(data, {
        baseColor: this.props.primaryColor,
        saturate: 0,
        rotate: -40,
      }),
    };
  };

  render() {
    const { loading } = this.props;

    if (loading) {
      return (
        <Panel.LEGACY title="Accepted Rates" sectioned className={styles.LoadingPanel}>
          <Loading />
        </Panel.LEGACY>
      );
    }

    return (
      <Panel.LEGACY title="Accepted Rates" sectioned>
        <Grid>
          <Grid.Column xs={12} lg={5}>
            <div className={styles.ChartWrapper}>
              <PieChart.Chart
                {...this.getData()}
                hoveredItem={this.state.hoveredItem}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
                onClick={this.handleClick}
              />
              <PieChart.ActiveLabel {...this.getLabelProps()} />
            </div>
          </Grid.Column>
          <Grid.Column xs={12} lg={7}>
            <PieChart.Legend
              headerData={this.getLegendHeaderData()}
              {...this.getData()}
              hoveredItem={this.state.hoveredItem}
              onMouseOver={this.handleMouseOver}
              onMouseOut={this.handleMouseOut}
              onClick={this.handleClick}
            />
          </Grid.Column>
        </Grid>
      </Panel.LEGACY>
    );
  }
}

// TODO: This wrapping functional component won't be necessary when the OG theme is removed
export default function AcceptedChart(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;
  const primaryColor = isHibanaEnabled ? '#429BFF' : '#8CCA3A';

  return <AcceptedChartClassComponent primaryColor={primaryColor} {...props} />;
}
