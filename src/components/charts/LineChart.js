import React from 'react';
import {
  Area,
  Bar,
  ComposedChart,
  Line,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import moment from 'moment';
import styles from './LineChart.module.scss';
import { tokens } from '@sparkpost/design-tokens-hibana';

const identity = a => a;

function orderDesc(a, b) {
  return b.value - a.value;
}

const Cursor = ({ data, height, points: [{ x, y }], width: chartWidth }) => {
  const sectionWidth = chartWidth / data.length;
  const gap = sectionWidth * 0.03;
  const width = sectionWidth - gap * 2;

  return (
    <Rectangle x={x - width / 2} y={y} height={height} width={width} fill={tokens.color_gray_400} />
  );
};

export default function SpLineChart(props) {
  const renderLines = () => {
    const { lines = [] } = props;
    return lines.map(line => {
      const lineProps = {
        strokeWidth: 2,
        animationDuration: 400,
        activeDot: false,
        dot: false,
        type: 'linear',
        connectNulls: true,
        ...line,
      };
      return <Line {...lineProps} />;
    });
  };

  // Manually generates X axis ticks
  const getXTicks = () => {
    const { data, precision } = props;
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
  };

  const {
    data,
    height,
    syncId,
    showTooltip,
    xTickFormatter = identity,
    yTickFormatter = identity,
    yScale = 'linear',
    tooltipLabelFormatter = identity,
    tooltipValueFormatter = identity,
    showXAxis,
    xAxisKey = 'ts',
    yLabel,
    tooltip: CustomTooltip,
    unit,
  } = props;

  const xAxisHeight = 30;

  return (
    <div className={styles.ChartWrapper}>
      <ResponsiveContainer width="99%" height={showXAxis ? height + xAxisHeight : height}>
        <ComposedChart syncId={syncId} barCategoryGap="3%" data={data}>
          <Bar key="noKey" dataKey="noKey" background={{ fill: tokens.color_gray_200 }} />
          <XAxis
            axisLine={false}
            dataKey={xAxisKey}
            height={xAxisHeight}
            hide={!showXAxis}
            interval="preserveStartEnd"
            tickFormatter={xTickFormatter}
            tickLine={false}
            ticks={getXTicks()}
          />
          <YAxis
            axisLine={false}
            domain={['dataMin', 'dataMax']}
            interval="preserveStartEnd"
            padding={{ top: 8, bottom: 8 }}
            scale={yScale}
            tickFormatter={yTickFormatter}
            tickLine={false}
            width={60}
          />
          <Tooltip
            cursor={<Cursor data={data} />}
            content={CustomTooltip ? <CustomTooltip data={data} showTooltip={showTooltip} /> : null}
            wrapperStyle={{ zIndex: tokens.zIndex_overlay }}
            isAnimationActive={false}
            itemSorter={orderDesc}
            labelFormatter={tooltipLabelFormatter}
            formatter={tooltipValueFormatter}
          />
          {renderLines()}
          {unit === 'percent' && (
            <Area
              dataKey="industry_rate"
              stroke={tokens.color_blue_800}
              fill={tokens.color_blue_800}
              opacity={0.15}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <span className="sp-linechart-yLabel">{yLabel}</span>
    </div>
  );
}
