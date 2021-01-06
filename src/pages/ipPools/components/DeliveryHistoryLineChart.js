import React from 'react';
import {
  LineChart,
  Label,
  XAxis,
  YAxis,
  Line,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { tokens } from '@sparkpost/design-tokens-hibana';
import { formatDate } from 'src/helpers/date';
import { getLineChartFormatters } from 'src/helpers/chart';
import { formatNumber } from 'src/helpers/units';
import { ScreenReaderOnly } from 'src/components/matchbox';
import { useHibana } from 'src/context/HibanaContext';
import styles from './DeliveryHistoryLineChart.module.scss';

const DeliveryHistoryLineChart = ({ data }) => {
  const [{ isHibanaEnabled }] = useHibana();
  const grayColor = isHibanaEnabled ? tokens.color_gray_900 : '#55555a';
  const blueColor = isHibanaEnabled ? tokens.color_blue_800 : '#2693c3';
  const { xTickFormatter, tooltipLabelFormatter } = getLineChartFormatters('day');

  return (
    <>
      <div className={styles.ChartWrapper} data-id="delivery-history-line-chart" aria-hidden="true">
        <ResponsiveContainer height={350} width="100%">
          <LineChart data={data}>
            <YAxis
              dataKey="deliveries"
              tickLine={false}
              scale="linear"
              width={66}
              tickFormatter={formatNumber}
              stroke={grayColor}
            >
              <Label value="Volume" angle={-90} position="insideLeft" opacity={0.5} fontSize={16} />
            </YAxis>

            <XAxis
              dataKey="date"
              tickLine={false}
              padding={{ left: 25 }}
              height={66}
              stroke={grayColor}
              tickFormatter={xTickFormatter}
            >
              <Label value="Date" offset={15} position="insideBottom" opacity={0.5} fontSize={16} />
            </XAxis>

            <Tooltip labelFormatter={tooltipLabelFormatter} isAnimationActive={false} />

            <Line
              type="monotone"
              stroke={blueColor}
              strokeWidth={2}
              dataKey="deliveries"
              name="Deliveries"
              dot={{ r: 3, strokeWidth: 1 }}
            />

            <CartesianGrid vertical={false} opacity={0.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ScreenReaderOnly as="div">
        <table>
          <caption>Deliveries Over the Last 10 Days</caption>

          <thead>
            <tr>
              <th>Date</th>

              <th>Number of Deliveries</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr key={`screen-reader-table-row-${index}`}>
                {/* Warning was being thrown by moment without converting the string to a Date */}
                <td>{formatDate(new Date(row.date))}</td>

                <td>{row.deliveries}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScreenReaderOnly>
    </>
  );
};

export default DeliveryHistoryLineChart;
