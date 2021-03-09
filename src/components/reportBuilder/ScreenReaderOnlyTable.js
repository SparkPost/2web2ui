import React from 'react';
import { ScreenReaderOnly } from 'src/components/matchbox';
import { formatDateTime } from 'src/helpers/date';
import { slugToFriendly } from 'src/helpers/string';
import { Unit } from 'src/components';
import EmptyCell from 'src/components/collection/EmptyCell';

export function ScreenReaderOnlyTable({
  caption = 'Analytics Data Over Time',
  captionUnit,
  metrics,
  data,
}) {
  return (
    <ScreenReaderOnly>
      <table>
        <caption>{`${caption} by ${captionUnit}`}</caption>

        <thead>
          <tr>
            <th scope="col">Timestamp</th>

            <th scope="col">Industry Benchmark Rate</th>

            {metrics.map((metric, index) => {
              return (
                <th key={`${metric.key}-${index}`} scope="col">
                  {metric.label}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => {
            // The defensive checks are a little annoying here - is there a better way to handle this?
            const [q25 = '', q75 = '', industry = ''] = row.industry_rate || [];

            return (
              <tr key={`${row.ts}-${rowIndex}`}>
                <td>{formatDateTime(row.ts)}</td>

                <td>
                  {Boolean(q25) ? (
                    <>
                      25th percentile is {q25}%, 75th percentile is {q75}% for the{' '}
                      {slugToFriendly(industry)} industry
                    </>
                  ) : (
                    <EmptyCell />
                  )}
                </td>

                {metrics.map((metric, metricIndex) => {
                  return (
                    <td key={`${metric.key}-${rowIndex}-${metricIndex}`}>
                      <Unit value={row[metric.key]} unit={metric.unit} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScreenReaderOnly>
  );
}
