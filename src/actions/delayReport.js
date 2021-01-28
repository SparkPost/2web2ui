import { DELIVERABILITY_DELAY_METRIC_KEYS } from 'src/config/metrics';
import { fetchDeliverability, fetchDelayReasonsByDomain } from 'src/actions/metrics';
import {
  getMetricsFromKeys,
  getQueryFromOptions,
  getQueryFromOptionsV2,
} from 'src/helpers/metrics';

const DELIVERABILITY_METRICS = getMetricsFromKeys(DELIVERABILITY_DELAY_METRIC_KEYS);

export function refreshDelayReport(updates = {}) {
  return dispatch => {
    return Promise.all([
      dispatch(
        fetchDeliverability({
          type: 'GET_DELAY_REPORT_AGGREGATES',
          params: getQueryFromOptions({ ...updates, metrics: DELIVERABILITY_METRICS }),
        }),
      ),
      dispatch(fetchDelayReasonsByDomain(getQueryFromOptions(updates))),
    ]);
  };
}

export function refreshDelayReportV2(updates = {}) {
  return dispatch => {
    return Promise.all([
      dispatch(
        fetchDeliverability({
          type: 'GET_DELAY_REPORT_AGGREGATES',
          params: getQueryFromOptionsV2({ ...updates, metrics: DELIVERABILITY_METRICS }),
        }),
      ),
      dispatch(fetchDelayReasonsByDomain(getQueryFromOptionsV2(updates))),
    ]);
  };
}
