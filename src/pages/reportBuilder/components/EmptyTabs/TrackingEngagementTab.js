import React from 'react';
import { Panel, Box, Inline, LabelValue, Text } from 'src/components/matchbox';
import { Bold } from 'src/components/text';
import LineChart from 'src/components/charts/LineChart';
import { ActiveFilters } from 'src/components/reportBuilder';
import { ActiveMetrics } from '../index';
import { getMetricsFromKeys } from 'src/helpers/metrics';
import { formatYAxisPercent } from 'src/helpers/chart';
import SampleLabel from './SampleLabel';

import { trackingEngagementChartData } from '../../constants/emptyState';

const metrics = ['accepted_rate', 'open_rate_approx', 'click_through_rate_approx'];

const filters = [{ AND: { campaigns: { eq: [{ value: 'My Campaign', type: 'Campaign' }] } } }];

function TrackingEngagementTab() {
  const processedMetrics = getMetricsFromKeys(metrics);

  return (
    <div>
      <Box as="p" maxWidth="600px" py={500}>
        This example shows how <Bold>Acceptance Rate</Bold>, <Bold>Open Rate</Bold>, and{' '}
        <Bold>Click-Through Rate</Bold> can be combined with a <Bold>campaign</Bold> to reveal the
        engagement performance of a particular campaign <Bold>sent through SparkPost</Bold>.
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
          <Box position="relative">
            <SampleLabel />
            <LineChart
              height={300}
              syncId="trackingEngagementSampleChart"
              data={trackingEngagementChartData}
              precision="day"
              // showTooltip={true}
              lines={processedMetrics.map(({ name, label, stroke }) => ({
                key: name,
                dataKey: name,
                name: label,
                stroke,
              }))}
              // {...formatters}
              yTickFormatter={formatYAxisPercent}
              tooltipValueFormatter={formatYAxisPercent}
              // showXAxis={index === charts.length - 1}
              // tooltip={CustomTooltip}
            />
          </Box>
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
