import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Box, Grid, Inline, LabelValue } from 'src/components/matchbox';
import { FilterAlt } from '@sparkpost/matchbox-icons';
import { Unit, LegendCircle } from 'src/components';
import styled from 'styled-components';

const ViewFilterButton = styled(Button)`
  float: right;
  color: ${props => props.theme.colors.gray['600']};
`;

export default function AggregatedMetrics({
  date,
  processedMetrics,
  showFiltersButton,
  handleClickFiltersButton,
}) {
  const chart = useSelector(state => state.summaryChart);

  return (
    <Box padding="400" backgroundColor="gray.1000">
      <Grid>
        <Grid.Column sm={showFiltersButton ? 9 : 3} data-id="aggregate-metrics-date-range">
          <LabelValue dark>
            <LabelValue.Label>Date</LabelValue.Label>

            <LabelValue.Value>
              <Unit value={date} />
            </LabelValue.Value>
          </LabelValue>
        </Grid.Column>
        {showFiltersButton && (
          <>
            <Grid.Column sm={3}>
              <ViewFilterButton onClick={handleClickFiltersButton}>
                View Filters <FilterAlt size={20} />
              </ViewFilterButton>
            </Grid.Column>
            <Box height="300" width="100%">
              &nbsp;
            </Box>
          </>
        )}

        <Grid.Column sm={9}>
          <Inline space="600">
            {chart.aggregateData.map(({ key, label, value, unit }) => {
              const stroke = processedMetrics.find(({ key: newKey }) => {
                return newKey === key;
              })?.stroke;

              return (
                <Box key={`aggregated-metric-${key}`}>
                  <LabelValue dark>
                    <LabelValue.Label>{label}</LabelValue.Label>

                    <LabelValue.Value>
                      <Box display="flex" alignItems="center">
                        {stroke && <LegendCircle marginRight="200" color={stroke} />}
                        <Unit value={value} unit={unit} />
                      </Box>
                    </LabelValue.Value>
                  </LabelValue>
                </Box>
              );
            })}
          </Inline>
        </Grid.Column>
      </Grid>
    </Box>
  );
}
