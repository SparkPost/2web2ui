import React from 'react';
import { Panel, Box, Inline, LabelValue, Text } from 'src/components/matchbox';
import { ChartGroups } from 'src/components/reportBuilder';
import { ActiveFilters } from 'src/components/reportBuilder';
import { ActiveMetrics } from '../index';
import { getMetricsFromKeys } from 'src/helpers/metrics';

const metrics = [
  'count_block_bounce',
  'count_hard_bounce',
  'count_soft_bounce',
  'count_undetermined_bounce',
];

const filters = [{ AND: { domains: { eq: [{ value: 'gmail.com', type: 'Recipient Domain' }] } } }];

const data = {
  filters: [{ AND: { domains: { eq: [{ value: 'gmail.com', type: 'Recipient Domain' }] } } }],
  comparisons: [],
  metrics: [
    'count_hard_bounce',
    'count_soft_bounce',
    'count_block_bounce',
    'count_undetermined_bounce',
  ],
  from: '2019-01-01T18:00:00.000Z',
  to: '2019-03-31T18:17:11.196Z',
  relativeRange: '7days',
  precision: 'day',
  timezone: 'America/Chicago',
  isReady: true,
};

function TrackingEngagementTab() {
  const processedMetrics = getMetricsFromKeys(metrics);

  return (
    <div>
      <Box as="p" maxWidth="600px" py={500}>
        This example demonstrates how an Analytics Report can be used to diagnose sending issues to
        a particular recipient domain. By uncovering what types of bounces are occuring, corrective
        action can be taken to address this particular problem.
      </Box>
      <Panel>
        <Panel.Header>Metrics</Panel.Header>
        <Panel.Section>
          <ActiveMetrics metrics={processedMetrics} removeMetric={() => {}} />
        </Panel.Section>
        <Panel.Header>Filters</Panel.Header>
        <Panel.Section>
          <ActiveFilters filters={filters} handleFilterRemove={() => {}} />
        </Panel.Section>
        <Panel.Section>
          <ChartGroups reportOptions={data} />
        </Panel.Section>
        <Panel.Section p="0">
          <Box padding="500" backgroundColor="gray.1000">
            <Inline space={700}>
              <LabelValue>
                <LabelValue.Label>
                  <Text color="gray.500">Date</Text>
                </LabelValue.Label>
                <LabelValue.Value>
                  <Text color="white">Jan 1 - March 31, 2019</Text>
                </LabelValue.Value>
              </LabelValue>
              <LabelValue>
                <LabelValue.Label>
                  <Text color="gray.500">Metric</Text>
                </LabelValue.Label>
                <LabelValue.Value>
                  <Text color="white">00.0K</Text>
                </LabelValue.Value>
              </LabelValue>
              <LabelValue>
                <LabelValue.Label>
                  <Text color="gray.500">Metric</Text>
                </LabelValue.Label>
                <LabelValue.Value>
                  <Text color="white">100,000,000</Text>
                </LabelValue.Value>
              </LabelValue>
              <LabelValue>
                <LabelValue.Label>
                  <Text color="gray.500">Metric</Text>
                </LabelValue.Label>
                <LabelValue.Value>
                  <Text color="white">100,000,000</Text>
                </LabelValue.Value>
              </LabelValue>
            </Inline>
          </Box>
        </Panel.Section>
      </Panel>
    </div>
  );
}

export default TrackingEngagementTab;
