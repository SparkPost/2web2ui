import React from 'react';
import styled from 'styled-components';
import { FilterAlt } from '@sparkpost/matchbox-icons';
import { Unit } from 'src/components';
import { Box, Button, Column, Columns, LabelValue, Stack } from 'src/components/matchbox';
import CompareByAggregatedRow from './CompareByAggregatedRow';

const ViewFilterButton = styled(Button)`
  float: right;
  color: ${props => props.theme.colors.gray['600']};
`;

export default function CompareByAggregatedMetrics({
  date,
  reportOptions,
  showFiltersButton,
  handleClickFiltersButton,
}) {
  const { comparisons } = reportOptions;

  const renderDate = () => {
    return (
      <Column width={showFiltersButton ? 2 / 5 : 1 / 5}>
        <Box mb={showFiltersButton && '500'} data-id="aggregate-metrics-date-range">
          <LabelValue dark>
            <LabelValue.Label>Date</LabelValue.Label>

            <LabelValue.Value>
              <Unit value={date} />
            </LabelValue.Value>
          </LabelValue>
        </Box>
      </Column>
    );
  };

  const renderAggregateData = () => {
    return (
      <Column>
        <Stack space="300">
          {comparisons?.map((comparison, comparisonIndex) => {
            return (
              <CompareByAggregatedRow
                key={`comparison-${comparisonIndex}`}
                comparison={comparison}
                reportOptions={reportOptions}
                hasDivider={comparisonIndex < comparisons.length - 1}
              />
            );
          })}
        </Stack>
      </Column>
    );
  };

  if (showFiltersButton)
    return (
      <Box padding="400" backgroundColor="gray.1000" data-id="compare-by-aggregated-metrics">
        <Columns>
          {renderDate()}
          <Column width={4 / 5}>
            <ViewFilterButton variant="minimal" onClick={handleClickFiltersButton}>
              View Filters <FilterAlt size={20} />
            </ViewFilterButton>
          </Column>
        </Columns>
        <Columns>{renderAggregateData()}</Columns>
      </Box>
    );

  return (
    <Box padding="400" backgroundColor="gray.1000" data-id="compare-by-aggregated-metrics">
      <Columns>
        {renderDate()}
        {renderAggregateData()}
      </Columns>
    </Box>
  );
}
