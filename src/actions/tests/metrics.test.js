import * as metrics from '../metrics';
import { snapshotActionCases } from 'src/__testHelpers__';
jest.mock('src/actions/helpers/sparkpostApiRequest');
jest.mock('src/helpers/conditions/user', () => ({ isUserUiOptionSet: jest.fn(() => () => false) }));

describe('Metrics Actions', () => {
  snapshotActionCases('fetch', [
    {
      name: 'metrics domains',
      actionCreator: metrics.fetchMetricsDomains,
    },
    {
      name: 'metrics campaigns',
      actionCreator: metrics.fetchMetricsCampaigns,
    },
    {
      name: 'metrics sending ips',
      actionCreator: metrics.fetchMetricsSendingIps,
    },
    {
      name: 'metrics ip pools',
      actionCreator: metrics.fetchMetricsIpPools,
    },
    {
      name: 'metrics templates',
      actionCreator: metrics.fetchMetricsTemplates,
    },
    {
      name: 'metrics (time series)',
      actionCreator: metrics.getTimeSeries,
    },
    {
      name: 'Deliverability',
      actionCreator: () =>
        metrics.fetchDeliverability({ params: {}, type: 'GET_ACCEPTED_AGGREGATES' }),
    },
    {
      name: 'Bounce Classifications',
      actionCreator: metrics.fetchBounceClassifications,
    },
    {
      name: 'Bounce Reasons',
      actionCreator: metrics.fetchBounceReasons,
    },
    {
      name: 'Bounce Reasons By Domain',
      actionCreator: () =>
        metrics.fetchBounceReasonsByDomain({}, 'FETCH_METRICS_BOUNCE_REASONS_BY_DOMAIN'),
    },
    {
      name: 'Rejection Reasons By Domain',
      actionCreator: metrics.fetchRejectionReasonsByDomain,
    },
    {
      name: 'Delay Reasons By Domain',
      actionCreator: metrics.fetchDelayReasonsByDomain,
    },
    {
      name: 'Deliveries By Attempt',
      actionCreator: metrics.fetchDeliveriesByAttempt,
    },
  ]);
});
