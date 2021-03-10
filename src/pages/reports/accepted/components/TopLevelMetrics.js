import React from 'react';
import { Grid } from 'src/components/matchbox';
import { Size, Duration } from 'src/components';
import { MetricCard, MetricsSummary } from '../../components';
import { safeRate } from 'src/helpers/math';
import _ from 'lodash';

/**
 * Presentational component for the accepted report metric cards
 */
const TopLevelMetrics = ({ filters, metrics, aggregates }) => {
  const {
    count_accepted,
    count_sent,
    avg_delivery_time_first,
    avg_delivery_time_subsequent,
    avg_msg_size,
  } = aggregates;

  const latencyFirstCard = (
    <MetricCard
      value={<Duration value={avg_delivery_time_first} />}
      tooltipContent={_.find(metrics, { key: 'avg_delivery_time_first' }).description}
      label="Avg Latency (First)"
    />
  );

  const latencySubCard = (
    <MetricCard
      value={<Duration value={avg_delivery_time_subsequent} />}
      tooltipContent={_.find(metrics, { key: 'avg_delivery_time_subsequent' }).description}
      label="Avg Latency (Subsequent)"
    />
  );

  const sizeCard = (
    <MetricCard
      value={<Size value={avg_msg_size} />}
      tooltipContent={_.find(metrics, { key: 'avg_msg_size' }).description}
      label="Avg Message Size"
    />
  );

  return (
    <div>
      <MetricsSummary
        rateValue={safeRate(count_accepted, count_sent)}
        rateTitle="Accepted Rate"
        {...filters}
      >
        <strong>{count_accepted.toLocaleString()}</strong> of{' '}
        <strong>{count_sent.toLocaleString()}</strong> sent messages were accepted
      </MetricsSummary>
      <Grid>
        <Grid.Column xs={12} md={4}>
          {latencyFirstCard}
        </Grid.Column>
        <Grid.Column xs={12} md={4}>
          {latencySubCard}
        </Grid.Column>
        <Grid.Column xs={12} md={4}>
          {sizeCard}
        </Grid.Column>
      </Grid>
    </div>
  );
};

export default TopLevelMetrics;
