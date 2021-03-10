import React, { Component } from 'react';
import _ from 'lodash';
import { Grid } from 'src/components/matchbox';
import { PanelSectionLoading } from 'src/components/loading';
import { PieChart } from 'src/components';
import { generateColors } from 'src/helpers/color';
import styles from './BounceChart.module.scss';
import { formatPercent } from 'src/helpers/units';
import { safeRate } from 'src/helpers/math';

// Chart color palette generated from:
const primaryColor = '#DB2F3D';
const secondaryColor = '#37aadc';

export default class BounceChart extends Component {
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
    const { categories, types, tab, admin } = this.props;
    const { active } = this.state;
    const { name, count } = e;
    let dataSet = hoverSet === 'primary' ? categories : types;
    if (active) {
      dataSet = active.children;
    }

    if (tab === 1) {
      dataSet = admin;
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
    const { aggregates, tab } = this.props;
    const { hoveredItem } = this.state;

    let defaultLabel = {
      name: 'Bounce Rate',
      value: formatPercent(safeRate(aggregates.countBounce, aggregates.countSent)),
    };

    if (tab === 1) {
      defaultLabel = {
        name: 'Admin Bounce Rate',
        value: formatPercent(safeRate(aggregates.countAdminBounce, aggregates.countTargeted)),
      };
    }

    return hoveredItem
      ? {
          name: hoveredItem.name,
          value: formatPercent(
            safeRate(
              hoveredItem.count,
              tab === 1 ? aggregates.countAdminBounce : aggregates.countBounce,
            ),
          ),
        }
      : defaultLabel;
  };

  getLegendHeaderData = () => {
    const { aggregates, tab } = this.props;
    const { active } = this.state;

    // Header with breadcrumb & active data
    if (active && tab === 0) {
      return [
        {
          name: 'Bounces',
          breadcrumb: true,
          onClick: this.handleBreadcrumb,
          count: aggregates.countBounce,
        },
        { name: 'Sent', count: aggregates.countSent },
        { name: active.name, count: active.count },
      ];
    }

    if (tab === 1) {
      return [
        { name: 'Admin Bounces', count: aggregates.countAdminBounce },
        { name: 'Targeted', count: aggregates.countTargeted },
      ];
    }

    // Default header
    return [
      { name: 'Bounces', count: aggregates.countBounce },
      { name: 'Sent', count: aggregates.countSent },
    ];
  };

  // Gets primary and secondary data for BounceChart & Legend
  getData = () => {
    const { categories, types, tab, admin } = this.props;
    const { active } = this.state;

    let primaryData = categories;
    let secondaryData = types;

    if (active) {
      primaryData = active.children;
      secondaryData = null;
    }

    if (tab === 1) {
      primaryData = admin;
      secondaryData = null;
    }

    return {
      primaryData: generateColors(primaryData, {
        baseColor: primaryColor,
        rotate: 80,
        saturate: 0.06,
      }),
      secondaryData: secondaryData && generateColors(secondaryData, { baseColor: secondaryColor }),
    };
  };

  render() {
    const { loading } = this.props;

    if (loading) {
      return <PanelSectionLoading minHeight="300px" />;
    }

    return (
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
    );
  }
}
