import { DELIVERABILITY_BOUNCE_METRIC_KEYS } from 'src/config/metrics';
import {
  fetchDeliverability,
  fetchBounceClassifications,
  fetchBounceReasonsByDomain,
} from 'src/actions/metrics';
import {
  getMetricsFromKeys,
  getQueryFromOptions,
  getQueryFromOptionsV2,
} from 'src/helpers/metrics';

const ADMIN_REASON_METRICS = getMetricsFromKeys(['count_admin_bounce']);
const CLASSIFICATION_METRICS = getMetricsFromKeys(['count_bounce', 'count_admin_bounce']);
const DELIVERABILITY_METRICS = getMetricsFromKeys(DELIVERABILITY_BOUNCE_METRIC_KEYS);
const REASON_METRICS = getMetricsFromKeys(['count_bounce']);

export function refreshBounceReport(updates = {}) {
  return dispatch => {
    // get new data
    return Promise.all([
      dispatch(
        fetchDeliverability({
          type: 'GET_BOUNCE_REPORT_AGGREGATES',
          params: getQueryFromOptions({ ...updates, metrics: DELIVERABILITY_METRICS }),
        }),
      ),
      dispatch(
        fetchBounceClassifications(
          getQueryFromOptions({ ...updates, metrics: CLASSIFICATION_METRICS }),
        ),
      ),
      dispatch(
        fetchBounceReasonsByDomain(
          getQueryFromOptions({ ...updates, metrics: REASON_METRICS }),
          'FETCH_METRICS_BOUNCE_REASONS_BY_DOMAIN',
        ),
      ),
      dispatch(
        fetchBounceReasonsByDomain(
          getQueryFromOptions({ ...updates, metrics: ADMIN_REASON_METRICS }),
          'FETCH_METRICS_ADMIN_BOUNCE_REASONS_BY_DOMAIN',
        ),
      ),
    ]);
  };
}

export function refreshBounceReportV2(updates = {}) {
  return dispatch => {
    // get new data
    return Promise.all([
      dispatch(
        fetchDeliverability({
          type: 'GET_BOUNCE_REPORT_AGGREGATES',
          params: getQueryFromOptionsV2({ ...updates, metrics: DELIVERABILITY_METRICS }),
        }),
      ),
      dispatch(
        fetchBounceClassifications(
          getQueryFromOptionsV2({ ...updates, metrics: CLASSIFICATION_METRICS }),
        ),
      ),
      dispatch(
        fetchBounceReasonsByDomain(
          getQueryFromOptionsV2({ ...updates, metrics: REASON_METRICS }),
          'FETCH_METRICS_BOUNCE_REASONS_BY_DOMAIN',
        ),
      ),
      dispatch(
        fetchBounceReasonsByDomain(
          getQueryFromOptionsV2({ ...updates, metrics: ADMIN_REASON_METRICS }),
          'FETCH_METRICS_ADMIN_BOUNCE_REASONS_BY_DOMAIN',
        ),
      ),
    ]);
  };
}
