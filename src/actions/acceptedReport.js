import { fetchDeliverability, fetchDeliveriesByAttempt } from 'src/actions/metrics';
import { getQueryFromOptions } from 'src/helpers/metrics';
import { getAcceptedMetrics } from 'src/helpers/accepted';

// Load new metrics for the accepted chart
export function refreshAcceptedReport(updates = {}) {
  return (dispatch) => {
    const params = getQueryFromOptions({ ...updates, metrics: getAcceptedMetrics() });

    return Promise.all([
      dispatch(fetchDeliverability({ type: 'GET_ACCEPTED_AGGREGATES', params })),
      dispatch(fetchDeliveriesByAttempt(params))
    ]);
  };
}
