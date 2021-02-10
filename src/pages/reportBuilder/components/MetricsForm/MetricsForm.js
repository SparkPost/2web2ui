import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  isAccountUiOptionSet,
  hasProductOnBillingSubscription,
} from 'src/helpers/conditions/account';
import { Box, Button, Checkbox, Drawer, Expandable, Stack, Tooltip } from 'src/components/matchbox';
import { DeliverabilityBanner } from './components';
import { categorizedMetricsList, list } from 'src/config/metrics';
import _ from 'lodash';
import styled from 'styled-components';

const ColumnList = styled.div`
  padding: inherit;
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: ${props => `repeat(${props.count}, auto)`};
  grid-auto-flow: column;
  word-wrap: break-word;
  max-width: 100%;
`;

const INITIAL_STATE = list.reduce((accumulator, { key }) => {
  accumulator[key] = false;
  return accumulator;
}, {});

const DESCRIPTIONS = {
  Injection: 'Processing of messages through SparkPost',
  Delivery: 'Transmission of messages to the mailbox',
  Deliverability: 'Placement of messages in the inbox',
  Engagement: 'Interaction in messages in the inbox',
};

export default function MetricsForm(props) {
  const getStateFromProps = useCallback(() => {
    return props.selectedMetrics.reduce(
      (accumulator, current) => {
        accumulator[current.key] = true;
        return accumulator;
      },
      { ...INITIAL_STATE },
    );
  }, [props.selectedMetrics]);

  const [selectedMetrics, setSelectedMetrics] = useState(getStateFromProps());
  const hasD12yMetricsEnabled = useSelector(state =>
    isAccountUiOptionSet('allow_deliverability_metrics')(state),
  );
  const hasD12yProduct = useSelector(state =>
    hasProductOnBillingSubscription('deliverability')(state),
  );

  useEffect(() => {
    const newSelectedMetrics = getStateFromProps();
    setSelectedMetrics(newSelectedMetrics);
  }, [getStateFromProps, props.selectedMetrics]);

  const handleCheckbox = key => {
    const newSelectedMetric = { ...selectedMetrics };
    newSelectedMetric[key] = !newSelectedMetric[key];
    setSelectedMetrics(newSelectedMetric);
  };

  const handleApply = () => {
    props.handleSubmit({ metrics: getSelectedMetrics() });
  };

  const getSelectedMetrics = () => _.keys(selectedMetrics).filter(key => !!selectedMetrics[key]);

  const isSelectedMetricsSameAsCurrentlyAppliedMetrics =
    props.selectedMetrics
      .map(({ key }) => key)
      .sort()
      .join(',') ===
    getSelectedMetrics()
      .sort()
      .join(',');

  //Needs this for current tests as hibana is not enabled for tests but is required for the Drawer component
  const { DrawerFooter = Drawer.Footer } = props;
  return (
    <>
      {Boolean(hasD12yMetricsEnabled && !hasD12yProduct) && <DeliverabilityBanner />}
      <Box padding="500" paddingBottom="100px">
        <Stack>
          {/* Renders categories */}
          {categorizedMetricsList.map(({ category, metrics }) => {
            if (!hasD12yMetricsEnabled && category === 'Deliverability') return null;

            return (
              <Box key={category}>
                <Expandable
                  defaultOpen
                  id={category}
                  subtitle={DESCRIPTIONS[category]}
                  title={`${category} Metrics`}
                >
                  {/* Renders metrics inside each category */}
                  <ColumnList count={Math.ceil(metrics.length / 2)}>
                    {metrics.map(metric => {
                      return (
                        <div key={metric.key}>
                          <Tooltip
                            id={metric.key}
                            content={metric.description}
                            portalID="tooltip-portal"
                            disabled={!Boolean(metric.description)}
                          >
                            <Box marginRight="300" width="200px" paddingLeft="100">
                              <Checkbox
                                id={metric.key}
                                key={`${category}-${metric.key}`}
                                onChange={() => handleCheckbox(metric.key)}
                                checked={selectedMetrics[metric.key]}
                                disabled={metric.product === 'deliverability' && !hasD12yProduct}
                                label={metric.label}
                              />
                            </Box>
                          </Tooltip>
                        </div>
                      );
                    })}
                  </ColumnList>
                </Expandable>
              </Box>
            );
          })}
        </Stack>
      </Box>
      <DrawerFooter margin="400">
        <Box display="flex">
          <Box pr="100" flex="1">
            <Button
              width="100%"
              onClick={handleApply}
              variant="primary"
              disabled={
                getSelectedMetrics().length < 1 || isSelectedMetricsSameAsCurrentlyAppliedMetrics
              }
            >
              Apply Metrics
            </Button>
          </Box>
          <Box pl="100" flex="1">
            <Button
              width="100%"
              onClick={() => setSelectedMetrics(INITIAL_STATE)}
              variant="secondary"
            >
              Clear Metrics
            </Button>
          </Box>
        </Box>
      </DrawerFooter>
    </>
  );
}
