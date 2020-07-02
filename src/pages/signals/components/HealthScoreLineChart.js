import React from 'react';
import moment from 'moment';
import { Bar, Line, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts';
import { tokens } from '@sparkpost/design-tokens-hibana';
import { LineChart, lineChartConfig } from 'src/components/charts';
import { formatDate, getDateTicks } from 'src/helpers/date';
import thresholds from 'src/pages/signals/constants/healthScoreThresholds';

export default function HealthScoreLineChart({ data, filters, onBarMouseOver }) {
  return (
    <LineChart>
      <LineChart.Container height={300} data={data}>
        <Bar
          key="this-is-a-key"
          dataKey="noKey"
          stackId="stack"
          cursor="pointer"
          isAnimationActive={false}
          background={lineChartConfig.barsBackground}
          onMouseOver={onBarMouseOver}
        />

        <XAxis
          dataKey="date"
          axisLine={false}
          scale="auto"
          height={30}
          tickLine={false}
          {...getXAxisProps(filters)}
        />

        <YAxis
          dataKey="health_score"
          axisLine={false}
          tickLine={false}
          width={30}
          minTickGap={2}
          ticks={[0, 55, 80, 100]}
        />

        <Tooltip
          cursor={<LineChart.Cursor data={data} />}
          content={({ payload, ...props }) => {
            return <LineChart.CustomTooltip {...props} payload={formatTooltipPayload(payload)} />;
          }}
          wrapperStyle={lineChartConfig.tooltipStyles}
          isAnimationActive={false}
          labelFormatter={formatDate}
          nameFormatter={() => 'Health Score'}
          formatter={val => val}
        />

        <ReferenceLine {...lineChartConfig.referenceLineProps} strokeDasharray="none" y={100} />

        <ReferenceLine
          {...lineChartConfig.referenceLineProps}
          y={80}
          style={{ stroke: tokens.color_green_700 }}
        />

        <ReferenceLine
          {...lineChartConfig.referenceLineProps}
          y={55}
          style={{ stroke: tokens.color_red_700 }}
        />

        <Line
          {...lineChartConfig.lineProps}
          dataKey="health_score"
          stroke={tokens.color_blue_700}
        />
      </LineChart.Container>
    </LineChart>
  );
}

function formatTooltipPayload(data) {
  const firstItem = data[0];
  const payload = firstItem ? firstItem.payload : {};

  if (payload) {
    return [
      ...data.map(item => {
        return {
          ...item,
          stroke: thresholds[payload.ranking].color,
        };
      }),
    ];
  }

  return payload;
}

function getXAxisProps(filters) {
  const xTicks = getDateTicks(filters);
  return {
    ticks: xTicks,
    tickFormatter: tick => moment(tick).format('M/D'),
  };
}
