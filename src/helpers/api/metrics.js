const METRICS_BASE_URL = `/v1/metrics`;
const DELIVERABILITY_BASE_URL = `${METRICS_BASE_URL}/deliverability`;
const BENCHMARK_BASE_URL = `${METRICS_BASE_URL}/benchmarks`;

export function getDomains(params) {
  return {
    method: 'GET',
    url: `${METRICS_BASE_URL}/domains`,
    params,
  };
}

export function getCampaigns(params) {
  return {
    method: 'GET',
    url: `${METRICS_BASE_URL}/campaigns`,
    params,
  };
}

export function getSubjectCampaigns(params) {
  return {
    method: 'GET',
    url: `${METRICS_BASE_URL}/subject-campaigns`,
    params,
  };
}

export function getSendingIps(params) {
  return {
    method: 'GET',
    url: `${METRICS_BASE_URL}/sending-ips`,
    params,
  };
}

export function getIpPools(params) {
  return {
    method: 'GET',
    url: `${METRICS_BASE_URL}/ip-pools`,
    params,
  };
}

export function getTemplates(params) {
  return {
    method: 'GET',
    url: `${METRICS_BASE_URL}/templates`,
    params,
  };
}

export function getDeliverability(params, path) {
  const joinedPath = `${DELIVERABILITY_BASE_URL}${path ? `/${path}` : ''}`;
  return {
    method: 'GET',
    url: joinedPath,
    params,
  };
}

export function getTimeSeries(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/time-series`,
    params,
  };
}

export function getBounceClassification(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/bounce-classification`,
    params,
  };
}

export function getBounceReason(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/bounce-reason`,
    params,
  };
}

export function getBounceReasonByDomain(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/bounce-reason/domain`,
    params,
  };
}

export function getRejectionReasonByDomain(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/rejection-reason/domain`,
    params,
  };
}

export function getDelayReasonByDomain(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/delay-reason/domain`,
    params,
  };
}

export function getAttempted(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/deliverability/attempt`,
    params,
  };
}

export function getEngagement(params) {
  return {
    method: 'GET',
    url: `${DELIVERABILITY_BASE_URL}/link-name`,
    params,
  };
}

export function getIndustryBenchmark(params) {
  return {
    method: 'GET',
    url: `${BENCHMARK_BASE_URL}/inbox-rate`,
    params,
  };
}
