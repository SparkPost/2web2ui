import { DELIVERABILITY_LINKS_METRIC_KEYS, LINKS_BY_DOMAIN_METRIC_KEYS } from 'src/config/metrics';
import { fetch as getMetrics } from 'src/actions/metrics';
import {
  getMetricsFromKeys,
  getQueryFromOptions,
  getQueryFromOptionsV2,
} from 'src/helpers/metrics';

const DELIVERABILITY_METRICS = getMetricsFromKeys(DELIVERABILITY_LINKS_METRIC_KEYS);

const LINK_METRICS = getMetricsFromKeys(LINKS_BY_DOMAIN_METRIC_KEYS);

export function refreshEngagementReport(updates = {}) {
  return dispatch => {
    return Promise.all([
      dispatch(
        getMetrics({
          params: getQueryFromOptions({ ...updates, metrics: DELIVERABILITY_METRICS }),
          path: 'deliverability',
          type: 'GET_ENGAGEMENT_AGGREGATE_METRICS',
        }),
      ),
      dispatch(
        getMetrics({
          params: getQueryFromOptions({ ...updates, metrics: LINK_METRICS }),
          path: 'deliverability/link-name',
          type: 'GET_ENGAGEMENT_LINK_METRICS',
        }),
      ),
    ]);
  };
}

// TODO: Remove once request recreated from report
export function refreshEngagementReportV2(updates = {}) {
  return dispatch => {
    return Promise.all([
      dispatch(
        getMetrics({
          params: getQueryFromOptionsV2({ ...updates, metrics: DELIVERABILITY_METRICS }),
          path: 'deliverability',
          type: 'GET_ENGAGEMENT_AGGREGATE_METRICS',
        }),
      ),
      dispatch(
        getMetrics({
          params: getQueryFromOptionsV2({ ...updates, metrics: LINK_METRICS }),
          path: 'deliverability/link-name',
          type: 'GET_ENGAGEMENT_LINK_METRICS',
        }),
      ),
    ]);
  };
}
