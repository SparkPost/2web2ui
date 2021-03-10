import { refreshEngagementReport } from '../engagementReport';
import * as metricsActions from 'src/actions/metrics';

jest.mock('src/actions/metrics');

describe('Action Creator: Refresh Engagement Report', () => {
  const subject = args => {
    refreshEngagementReport(args)(a => Promise.resolve(a));
  };

  it('should dispatch actions', () => {
    subject({ filters: [{ type: 'Campaign', value: 'test-camp' }] });

    expect(metricsActions.fetch).toHaveBeenCalledWith({
      params: expect.objectContaining({
        campaigns: 'test-camp',
        metrics:
          'count_accepted,count_clicked,count_sent,count_unique_clicked_approx,count_unique_confirmed_opened_approx',
      }),
      path: 'deliverability',
      type: 'GET_ENGAGEMENT_AGGREGATE_METRICS',
    });
    expect(metricsActions.fetch).toHaveBeenCalledWith({
      params: expect.objectContaining({
        campaigns: 'test-camp',
        metrics: 'count_clicked,count_raw_clicked_approx',
      }),
      path: 'deliverability/link-name',
      type: 'GET_ENGAGEMENT_LINK_METRICS',
    });
  });

  it('should use unique delimiter when comma in filter value', () => {
    subject({ filters: [{ type: 'Campaign', value: 'test,camp' }] });

    expect(metricsActions.fetch).toHaveBeenCalledWith({
      params: expect.objectContaining({
        campaigns: 'test,camp',
        metrics:
          'count_accepted;count_clicked;count_sent;count_unique_clicked_approx;count_unique_confirmed_opened_approx',
      }),
      path: 'deliverability',
      type: 'GET_ENGAGEMENT_AGGREGATE_METRICS',
    });
    expect(metricsActions.fetch).toHaveBeenCalledWith({
      params: expect.objectContaining({
        campaigns: 'test,camp',
        metrics: 'count_clicked;count_raw_clicked_approx',
      }),
      path: 'deliverability/link-name',
      type: 'GET_ENGAGEMENT_LINK_METRICS',
    });
  });
});
