import { refreshDelayReport } from '../delayReport';
import * as metricsActions from 'src/actions/metrics';

jest.mock('src/actions/metrics');

describe('Action Creator: Refresh Delay Report', () => {
  const subject = args => {
    refreshDelayReport(args)(a => Promise.resolve(a));
  };

  it('should dispatch actions', () => {
    subject({ filters: [{ type: 'Campaign', value: 'test-camp' }] });

    expect(metricsActions.fetchDeliverability).toHaveBeenCalledWith({
      type: 'GET_DELAY_REPORT_AGGREGATES',
      params: expect.objectContaining({
        campaigns: 'test-camp',
        metrics: 'count_accepted,count_delayed,count_delayed_first',
      }),
    });
    expect(metricsActions.fetchDelayReasonsByDomain).toHaveBeenCalledWith(
      expect.objectContaining({ campaigns: 'test-camp' }),
    );
  });

  it('should use unique delimiter when comma in filter value', () => {
    subject({ filters: [{ type: 'Campaign', value: 'test,camp' }] });

    expect(metricsActions.fetchDeliverability).toHaveBeenCalledWith({
      type: 'GET_DELAY_REPORT_AGGREGATES',
      params: expect.objectContaining({
        campaigns: 'test,camp',
        metrics: 'count_accepted;count_delayed;count_delayed_first',
      }),
    });
    expect(metricsActions.fetchDelayReasonsByDomain).toHaveBeenCalledWith(
      expect.objectContaining({ campaigns: 'test,camp' }),
    );
  });
});
