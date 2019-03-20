/*eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, ComposedChart, ReferenceLine, Bar, Tooltip, XAxis, YAxis, CartesianGrid, Cell, Rectangle } from 'recharts';
import TooltipWrapper from '../tooltip/Tooltip';
import './BarChart.scss';
import _ from 'lodash';
import healthScoreThresholds from '../../../constants/healthScoreThresholds';

/**
 * @example
 * <BarChart timeSeries={data}
 *   yDomain={[0,100]}
 *   yKeys={[
 *    { key: 'bar', fill: '#B157CE' },
 *    { key: 'foo', fill: '#28C0C4' },
 *   ]}
 *   gap={0.5}
 *   onClick={this.handleBarClick}
 *   selected={this.state.selected}
 *   xAxisProps={{ interval: 88, tickFormatter: (tick) => moment(tick).format('M/D') }}
 * />
 */
class BarChart extends Component {
  renderBar = ({ yKey, selected, xKey, fill, timeSeries }) => {
    //console.log('timeSeries', timeSeries);
    return <Bar
      cursor={healthScoreThresholds['warning'].color}
      stackId='stack'
      key={yKey}
      dataKey={yKey}
      onClick={this.props.onClick}
      onMouseOver={(props) => <Rectangle {...props}
        style={{fill: healthScoreThresholds[props.ranking].color}}
      />}
      fill={fill}
      isAnimationActive={false}
      minPointSize={1}
      shape={(props) => props.ranking && (<Rectangle {...props} fill={(props.date === selected) ? healthScoreThresholds[props.ranking].color: fill} />)}
    >
    </Bar>;
  }

  renderBars = () => {
    const { yKeys, yKey, xKey, selected, fill, timeSeries } = this.props;

    if (yKeys) {
      return yKeys.map(this.renderBar);
    }

    return this.renderBar({ yKey, xKey, selected, fill, timeSeries });
  }

  render() {
    const { gap, height, disableHover, margin, timeSeries, tooltipContent, tooltipWidth, width, xAxisRefLines, yAxisRefLines, xKey, xAxisProps, yDomain, yAxisProps } = this.props;

    return (
      <div className='LiftTooltip'>
        <ResponsiveContainer height={height} width={width} className='SignalsBarChart'>
          <ComposedChart
            barCategoryGap={gap}
            data={timeSeries}
            margin={margin}
          >
            <CartesianGrid
              vertical={false}
              stroke='#e1e1e6'
              shapeRendering='crispEdges'
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={30}
              minTickGap={2}
              domain={yDomain}
              {...yAxisProps}
            />
            <XAxis
              axisLine={false}
              tickLine={false}
              dataKey={xKey}
              type='category'
              padding={{ left: 12, right: 12 }}
              shapeRendering='crispEdges'
              {...xAxisProps}
            />
            {!disableHover && (
              <Tooltip
                offset={25}
                cursor={{ stroke: 'none', fill: '#FFFFFF', fillOpacity: '0' }}
                isAnimationActive={false}
                content={<TooltipWrapper children={tooltipContent} />}
                width={tooltipWidth}
                position={{ x: 0, y: 0 }}
              />
            )}
            {this.renderBars()}
            {xAxisRefLines && xAxisRefLines.length && (
              _.map(xAxisRefLines, (xAxisRefLine) =>
                <ReferenceLine
                  style={{ pointerEvents: 'none' }}
                  x={xAxisRefLine.x}
                  stroke={xAxisRefLine.stroke}
                  strokeWidth={xAxisRefLine.strokeWidth}
                />
              )
            )}
            {yAxisRefLines && yAxisRefLines.length && (
              _.map(yAxisRefLines, (yAxisRefLine) =>
                <ReferenceLine
                  style={{ pointerEvents: 'none' }}
                  y={yAxisRefLine.y}
                  stroke={yAxisRefLine.stroke}
                  strokeWidth={yAxisRefLine.strokeWidth}
                />
              )
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

BarChart.propTypes = {
  fill: PropTypes.string,
  gap: PropTypes.number,
  onClick: PropTypes.func,
  tooltipContent: PropTypes.func,
  tooltipWidth: PropTypes.string,
  yKeys: PropTypes.arrayOf(PropTypes.object)
};

BarChart.defaultProps = {
  fill: '#B157CE',
  gap: 1,
  height: 250,
  width: '99%',
  margin: { top: 12, left: 18, right: 0, bottom: 5 },
  xAxisRefLines: [],
  yAxisRefLines: [],
  xKey: 'date',
  yKey: 'value',
  yRange: ['auto', 'auto']
};

export default BarChart;
