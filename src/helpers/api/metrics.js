const METRICS_BASE_URL = `/v1/metrics`;
const DELIVERABILITY_BASE_URL = `${METRICS_BASE_URL}/deliverability`;

export function getDomains(params) {
  return {
    method: 'GET',
    url: `${METRICS_BASE_URL}/domains`,
    params: { ...params, rollup: true },
  };
}

export function getCampaigns(params) {
  return {
    method: 'GET',
    url: `${METRICS_BASE_URL}/campaigns`,
    params: { ...params, rollup: true },
  };
}

export function getSendingIps(params) {
  return {
    method: 'GET',
    url: `${METRICS_BASE_URL}/sending-ips`,
    params: { ...params, rollup: true },
  };
}

export function getTemplates(params) {
  return {
    method: 'GET',
    url: `${METRICS_BASE_URL}/templates`,
    params: { ...params, rollup: true },
  };
}

export function getDeliverability(params, path) {
  const joinedPath = `${DELIVERABILITY_BASE_URL}${path ? `/${path}` : ''}`;
  return {
    method: 'GET',
    url: joinedPath,
    params: { ...params, rollup: true },
  };
}

export function getTimeSeries(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/time-series`,
    params: { ...params, rollup: true },
  };
}

export function getBounceClassification(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/bounce-classification`,
    params: { ...params, rollup: true },
  };
}

export function getBounceReason(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/bounce-reason`,
    params: { ...params, rollup: true },
  };
}

export function getBounceReasonByDomain(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/bounce-reason/domain`,
    params: { ...params, rollup: true },
  };
}

export function getRejectionReasonByDomain(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/rejection-reason/domain`,
    params: { ...params, rollup: true },
  };
}

export function getDelayReasonByDomain(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/delay-reason/domain`,
    params: { ...params, rollup: true },
  };
}

export function getAttempted(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/deliverability/attempt`,
    params: { ...params, rollup: true },
  };
}

export function getEngagement(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/link-name`,
    params: { ...params, rollup: true },
  };
}
