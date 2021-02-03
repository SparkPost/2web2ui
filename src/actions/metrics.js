import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';

export function fetch({ type = 'FETCH_METRICS', path, params = {}, context }) {
  return dispatch => {
    const meta = {
      method: 'GET',
      url: `/v1/metrics/${path}`,
      params,
    };

    if (context) {
      meta.context = context;
    }

    return dispatch(
      sparkpostApiRequest({
        type,
        meta,
      }),
    );
  };
}

export function fetchMetricsDomains(params = {}) {
  const type = 'FETCH_METRICS_DOMAINS';
  const path = 'domains';
  return fetch({ type, path, params });
}

export function fetchMetricsCampaigns(params = {}) {
  const type = 'FETCH_METRICS_CAMPAIGNS';
  const path = 'campaigns';
  return fetch({ type, path, params });
}

export function fetchMetricsSendingIps(params = {}) {
  const type = 'FETCH_METRICS_SENDING_IPS';
  const path = 'sending-ips';
  return fetch({ type, path, params });
}

export function fetchMetricsIpPools(params = {}) {
  const type = 'FETCH_METRICS_IP_POOLS';
  const path = 'ip-pools';
  return fetch({ type, path, params });
}

export function fetchMetricsTemplates(params = {}) {
  const type = 'FETCH_METRICS_TEMPLATES';
  const path = 'templates';
  return fetch({ type, path, params });
}

export function fetchDeliverability({ params, type }) {
  const path = 'deliverability';
  return fetch({ path, params, type });
}

export function getTimeSeries(params = {}) {
  const path = 'deliverability/time-series';
  return fetch({ path, params });
}

export function fetchBounceClassifications(params = {}) {
  const type = 'FETCH_METRICS_BOUNCE_CLASSIFICATIONS';
  const path = 'deliverability/bounce-classification';
  return fetch({ type, path, params });
}

export function fetchBounceReasons(params = {}) {
  const type = 'FETCH_METRICS_BOUNCE_REASONS';
  const path = 'deliverability/bounce-reason';
  return fetch({ type, path, params });
}

export function fetchBounceReasonsByDomain(params = {}, type) {
  const path = 'deliverability/bounce-reason/domain';
  return fetch({ type, path, params });
}

export function fetchRejectionReasonsByDomain(params = {}) {
  const type = 'FETCH_METRICS_REJECTION_REASONS_BY_DOMAIN';
  const path = 'deliverability/rejection-reason/domain';
  return fetch({ type, path, params });
}

export function fetchDelayReasonsByDomain(params) {
  const type = 'FETCH_METRICS_DELAY_REASONS_BY_DOMAIN';
  const path = 'deliverability/delay-reason/domain';
  return fetch({ type, path, params });
}

export function fetchDeliveriesByAttempt(params = {}) {
  const type = 'FETCH_METRICS_DELIVERIES_BY_ATTEMPT';
  const path = 'deliverability/attempt';
  return fetch({ type, path, params });
}
