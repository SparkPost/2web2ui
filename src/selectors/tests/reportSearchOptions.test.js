import {
  selectReportSearchOptions,
  selectSummaryChartSearchOptions,
  selectSummaryMetricsProcessed,
} from '../reportSearchOptions';

jest.mock('src/helpers/string', () => ({
  stringifyTypeaheadfilter: jest.fn(filter => filter.id),
}));

describe('ReportSearchOptions Selectors', () => {
  let state;
  beforeEach(() => {
    state = {
      reportOptions: {
        from: '2018-03-23T17:10:08-04:00',
        to: '2018-03-23T17:11:08-04:00',
        range: null,
        filters: [{ id: 101 }, { id: 102 }],
        metrics: ['count_bounce', 'count_accepted', { key: 'metric_key' }],
        precision: 'hour',
        timezone: 'America/New_York',
      },
    };
  });

  describe('selectReportSearchOptions', () => {
    it('prepares reportOptions for URL sharing', () => {
      expect(selectReportSearchOptions(state)).toMatchSnapshot();
    });
  });

  describe('selectSummaryChartSearchOptions', () => {
    it('prepares summary chart reportOptions for URL sharing', () => {
      expect(selectSummaryChartSearchOptions(state)).toMatchSnapshot();
    });
  });

  describe('selectSummaryMetricsProcessed', () => {
    it('prepares summary chart metrics with additional information', () => {
      const metricsStringState = { ...state };
      metricsStringState.reportOptions.metrics = ['count_bounce', 'count_accepted'];
      const selected = selectSummaryMetricsProcessed(metricsStringState);
      expect(selected).toHaveLength(2);
      expect(selected[1]).toEqual(
        expect.objectContaining({
          key: 'count_accepted',
          type: 'total',
          unit: 'number',
          name: 'count_accepted',
        }),
      );
    });
  });
});
