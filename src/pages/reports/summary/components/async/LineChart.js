/*
  This component is meant to be loaded asynchronously, do not import directly.
  See ../LineChart.js for async export
*/

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import moment from 'moment';
import styles from './LineChart.module.scss';

const identity = a => a;

function orderDesc(a, b) {
  return b.value - a.value;
}

export default class SpLineChart extends React.Component {
  renderLines() {
    const { lines = [] } = this.props;
    return lines.map(line => {
      const lineProps = {
        strokeWidth: 2,
        animationDuration: 400,
        activeDot: { r: 6 },
        dot: false,
        type: 'linear',
        ...line,
      };
      return <Line {...lineProps} />;
    });
  }

  renderReferenceLines() {
    const { referenceLines = [] } = this.props;
    return referenceLines.map(props => <ReferenceLine {...props} />);
  }

  // Manually generates X axis ticks
  getXTicks() {
    const { data, precision } = this.props;
    let ticks;

    // Shows ticks every Sunday
    if (precision === 'day' && data.length > 15) {
      ticks = data.reduce((acc, { ts }) => {
        if (moment(ts).isoWeekday() === 7) {
          acc.push(ts);
        }
        return acc;
      }, []);
    }

    // Show ticks every 15 minutes
    if (precision === '1min') {
      ticks = data.reduce((acc, { ts }) => {
        if (moment(ts).minutes() % 15 === 0) {
          acc.push(ts);
        }
        return acc;
      }, []);
    }

    // Show ticks every 30 minutes
    if (precision === '15min') {
      ticks = data.reduce((acc, { ts }) => {
        if (moment(ts).minutes() % 30 === 0) {
          acc.push(ts);
        }
        return acc;
      }, []);
    }

    return ticks;
  }

  render() {
    const {
      data,
      lines = [],
      syncId,
      xTickFormatter = identity,
      yTickFormatter = identity,
      yScale = 'linear', // eslint-disable-line
      tooltipLabelFormatter = identity,
      tooltipValueFormatter = identity,
      showXAxis,
      yLabel,
    } = this.props;

    return (
      <div className={styles.ChartWrapper}>
        <ResponsiveContainer width="99%" height={170 + 30 * lines.length}>
          <LineChart data={data} syncId={syncId}>
            <CartesianGrid vertical={false} strokeDasharray="4 1" />
            <XAxis
              tickFormatter={xTickFormatter}
              ticks={this.getXTicks()}
              dataKey="ts"
              scale="auto"
              interval="preserveEnd"
              height={30}
              hide={!showXAxis}
            />
            <YAxis
              tickFormatter={yTickFormatter}
              tickLine={false}
              interval="preserveStartEnd"
              padding={{ top: 8, bottom: 8 }}
              width={60}
              scale={yScale}
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip
              isAnimationActive={false}
              labelFormatter={tooltipLabelFormatter}
              formatter={tooltipValueFormatter}
              itemSorter={orderDesc}
            />
            {this.renderReferenceLines()}
            {this.renderLines()}
          </LineChart>
        </ResponsiveContainer>
        <span className="sp-linechart-yLabel">{yLabel}</span>
      </div>
    );
  }
}
