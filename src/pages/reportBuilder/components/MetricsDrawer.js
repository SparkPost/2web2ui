import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Drawer,
  Expandable,
  Grid,
  Tooltip,
  Stack,
} from 'src/components/matchbox';

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
  Engagement: 'Interaction in messages in the inbox',
};

export default function MetricsDrawer(props) {
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

  const renderMetrics = metrics =>
    metrics.map(metric => {
      return (
        <Grid.Column xs={6} key={metric.key}>
          <Tooltip id={metric.key} content={metric.description} portalID="tooltip-portal">
            <Box marginRight="300" width="200px" paddingLeft="100">
              <Checkbox
                id={metric.key}
                onChange={() => handleCheckbox(metric.key)}
                checked={selectedMetrics[metric.key]}
                label={metric.label}
              />
            </Box>
          </Tooltip>
        </Grid.Column>
      );
    });

  const MetricsCategories = () => {
    return (
      <Stack>
        {categorizedMetricsList.map(({ category, metrics }) => {
          return (
            <Box key={category}>
              <Expandable
                defaultOpen
                id={category}
                subtitle={DESCRIPTIONS[category]}
                title={`${category} Metrics`}
              >
                <ColumnList count={Math.ceil(metrics.length / 2)}>
                  {renderMetrics(metrics)}
                </ColumnList>
              </Expandable>
            </Box>
          );
        })}
      </Stack>
    );
  };

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
      <Box padding="500" paddingBottom="100px">
        <MetricsCategories />
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
