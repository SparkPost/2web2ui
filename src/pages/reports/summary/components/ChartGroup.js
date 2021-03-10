import React, { Component } from 'react';
import _ from 'lodash';
import { getDayLines, getLineChartFormatters } from 'src/helpers/chart';
import LineChart from './LineChart'; // async
import METRICS_UNIT_CONFIG from 'src/config/metrics-units';
const DEFAULT_UNIT = 'number';

function getUniqueUnits(metrics) {
  return _.uniq(metrics.map(({ unit = DEFAULT_UNIT }) => unit));
}

export default class ChartGroup extends Component {
  createDayReferenceLines() {
    const { chartData, precision } = this.props;

    return getDayLines(chartData, precision).map(({ ts }) => ({
      key: ts,
      x: ts,
      stroke: '#bbb',
      strokeWidth: 2,
    }));
  }

  render() {
    const { chartData = [], metrics, chartLoading, precision, yScale, to } = this.props;

    if (!chartData.length || !metrics) {
      return null;
    }

    const formatters = getLineChartFormatters(precision, to);
    const referenceLines = this.createDayReferenceLines();
    const charts = getUniqueUnits(metrics).map(unit => ({
      metrics: metrics.filter(metric => metric.unit === unit),
      ...METRICS_UNIT_CONFIG[unit],
    }));

    return (
      <div>
        {charts.map((chart, i) => (
          <LineChart
            key={`chart=${i}`}
            syncId="summaryChart"
            data={chartData}
            precision={precision}
            lines={chart.metrics.map(({ name, label, stroke }) => ({
              key: name,
              dataKey: name,
              name: label,
              stroke: chartLoading ? '#f8f8f8' : stroke,
            }))}
            {...formatters}
            yTickFormatter={chart.yAxisFormatter}
            yScale={yScale}
            yLabel={chart.label}
            tooltipValueFormatter={chart.yAxisFormatter}
            referenceLines={referenceLines}
            showXAxis={i === charts.length - 1}
          />
        ))}
      </div>
    );
  }
}
