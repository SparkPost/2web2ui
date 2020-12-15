import React from 'react';
import { Unit } from 'src/components';
import { Box, Column, Columns, LabelValue, Stack } from 'src/components/matchbox';
import CompareByAggregatedRow from './CompareByAggregatedRow';

export default function CompareByAggregatedMetrics({ date, reportOptions }) {
  const { comparisons } = reportOptions;

  return (
    <Box padding="400" backgroundColor="gray.1000" data-id="compare-by-aggregated-metrics">
      <Columns>
        <Column width={1 / 5}>
          <LabelValue dark>
            <LabelValue.Label>Date</LabelValue.Label>

            <LabelValue.Value>
              <Unit value={date} />
            </LabelValue.Value>
          </LabelValue>
        </Column>

        <Column>
          <Stack space="300">
            {comparisons.map((comparison, comparisonIndex) => {
              return (
                <CompareByAggregatedRow
                  key={`comparison-${comparisonIndex}`}
                  comparison={comparison}
                  hasDivider={comparisonIndex < comparisons.length - 1}
                  reportOptions={reportOptions}
                />
              );
            })}
          </Stack>
        </Column>
      </Columns>
    </Box>
  );
}
