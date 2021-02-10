import * as metricsHelpers from '../metrics';
import moment from 'moment';
import * as dateHelpers from 'src/helpers/date';
import cases from 'jest-in-case';
import _ from 'lodash';

jest.mock('src/helpers/date');

describe('metrics helpers', () => {
  beforeEach(() => {
    dateHelpers.getLocalTimezone = jest.fn(() => 'Mock/Timezone');
  });

  it('should build return correct options from updates', () => {
    const actual = metricsHelpers.getQueryFromOptions({
      from: '2017-12-18T00:00Z',
      to: '2017-12-18T11:00Z',
      metrics: [{ key: 'count_bounce' }, { key: 'foo_bar', computeKeys: 'test + last' }],
      filters: [
        { value: 'gmail.com', type: 'Recipient Domain' },
        { value: 'foobar', type: 'Subaccount', id: 100 },
      ],
      timezone: 'Mock/Timezone',
      precision: 'hour',
    });

    expect(actual).toMatchSnapshot();
  });

  it('should return options with limit key if given limit as a parameter', () => {
    const actual = metricsHelpers.getQueryFromOptions({
      from: '2017-12-18T00:00Z',
      to: '2017-12-18T11:00Z',
      metrics: [{ key: 'count_bounce' }],
      filters: [],
      limit: 1000,
    });

    expect(actual).toMatchObject({ limit: 1000 });
  });

  it('should return options with match key if given match as a parameter', () => {
    const actual = metricsHelpers.getQueryFromOptions({
      from: '2017-12-18T00:00Z',
      to: '2017-12-18T11:00Z',
      metrics: [{ key: 'count_bounce' }],
      filters: [],
      match: 'foo',
    });

    expect(actual).toMatchObject({ match: 'foo' });
  });

  it('should pushToKey', () => {
    const actual = metricsHelpers.pushToKey({ foo: 'bar', baz: 'bot' }, 'test', 'value');
    expect(actual).toMatchSnapshot();
  });

  it('should set appropriate delimiter', () => {
    const actual = metricsHelpers.getDelimiter([
      { value: 'test,me' },
      { value: 'foo;bar' },
      { value: 'test:me' },
    ]);

    expect(actual).toEqual('+');
  });

  it('should getPrecision from dates', () => {
    const from = moment('2016-12-18T00:00').utc();
    const to = moment('2016-12-18T00:30').utc();

    expect(metricsHelpers.getPrecision({ from, to })).toEqual('1min');

    to.add(8, 'hours');
    expect(metricsHelpers.getPrecision({ from, to })).toEqual('hour');

    to.add(10, 'days');
    expect(metricsHelpers.getPrecision({ from, to })).toEqual('day');

    to.add(30, 'days');
    expect(metricsHelpers.getPrecision({ from, to })).toEqual('week');

    to.add(200, 'days');
    expect(metricsHelpers.getPrecision({ from, to })).toEqual('month');
  });

  describe('getRollupPrecision', () => {
    const from = moment('2016-12-18T00:00').utc();
    const to = moment('2016-12-18T04:30').utc();

    it('should return recommended precision when no precision is given', () => {
      expect(metricsHelpers.getRollupPrecision({ from, to, precision: undefined })).toEqual('1min');
      expect(
        metricsHelpers.getRollupPrecision({
          from,
          to: moment('2016-12-28T00:00').utc(),
          precision: undefined,
        }),
      ).toEqual('hour');
    });

    it('should return correct precision', () => {
      expect(metricsHelpers.getRollupPrecision({ from, to, precision: 'month' })).toEqual('1min');
    });
    it('should return the same precision when it is still in the allowed precision options', () => {
      expect(metricsHelpers.getRollupPrecision({ from, to, precision: 'hour' })).toEqual('hour');
    });
  });

  it('should return correct rollup precision options when given time span', () => {
    const from = moment('2016-12-18T00:00').utc();
    const to = moment('2016-12-19T00:30').utc();
    expect(metricsHelpers.getPrecisionOptions(from, to)).toEqual([
      {
        label: '15 Min',
        value: '15min',
      },
      {
        label: 'Hour',
        value: 'hour',
      },
      {
        label: 'Day',
        value: 'day',
      },
    ]);
  });

  it('should return minute as moment precision type', () => {
    const from = moment('2016-12-18T00:00').utc();
    const to = moment('2016-12-18T00:30').utc();
    expect(metricsHelpers.getMomentPrecisionByDate(from, to)).toEqual('minutes');
  });

  it('should return hour as moment precision type', () => {
    const from = moment('2016-12-18T00:00').utc();
    const to = moment('2016-12-19T00:30').utc();
    expect(metricsHelpers.getMomentPrecisionByDate(from, to)).toEqual('hours');
  });

  it('should return day as moment precision type', () => {
    const from = moment('2016-12-18T00:00').utc();
    const to = moment('2016-12-25T00:30').utc();
    expect(metricsHelpers.getMomentPrecisionByDate(from, to)).toEqual('days');
  });

  it('should return hours as precision type for time <= 2 days', () => {
    expect(metricsHelpers.getPrecisionType('1min')).toEqual('hour');
  });

  it('should return the same precision if precision type > 2 days', () => {
    expect(metricsHelpers.getPrecisionType('day')).toEqual('day');
  });

  describe('roundBoundaries', () => {
    const caseList = [
      {
        timeLabel: '1min',
        from: '2016-12-18T10:28',
        to: '2016-12-18T11:28',
        expected: { from: '2016-12-18T10:28', to: '2016-12-18T11:28' },
      },
      {
        timeLabel: 'hour',
        from: '2016-12-16T10:59',
        to: '2016-12-18T09:01',
        expected: { from: '2016-12-16T10:00', to: '2016-12-18T09:59' },
      },
      {
        timeLabel: 'day',
        from: '2016-11-15T10:59',
        to: '2016-12-18T10:01',
        expected: { from: '2016-11-15T00:00', to: '2016-12-18T23:59' },
      },
      {
        timeLabel: 'week',
        from: '2016-06-21T10:59',
        to: '2016-12-18T10:02',
        expected: { from: '2016-06-21T00:00', to: '2016-12-18T23:59' },
      },
      {
        timeLabel: 'month',
        from: '2016-02-18T10:59',
        to: '2016-12-18T10:02',
        expected: { from: '2016-02-18T00:00', to: '2016-12-18T23:59' },
      },
    ];

    const allCases = _.flatMap(caseList, caseObj => {
      const cases = [];
      const expectedTo =
        caseObj.timeLabel === '1min' // we don't round at this precision
          ? moment(caseObj.expected.to)
          : moment(caseObj.expected.to).endOf('minutes');

      cases.push({
        name: `should round at ${caseObj.timeLabel}`,
        from: moment(caseObj.from),
        to: moment(caseObj.to),
        expectedValue: {
          from: moment(caseObj.expected.from).toISOString(),
          to: expectedTo.toISOString(),
        },
      });

      cases.push({
        name: `should not round if already at nearest precision for ${caseObj.timeLabel}`,
        from: moment(caseObj.expected.from),
        to: expectedTo,
        expectedValue: {
          from: moment(caseObj.expected.from).toISOString(),
          to: expectedTo.toISOString(),
        },
      });

      return cases;
    });

    cases(
      'should round from and to values',
      ({ from, to, expectedValue }) => {
        const { from: resFrom, to: resTo } = metricsHelpers.roundBoundaries({ from, to });

        expect(resFrom.toISOString()).toEqual(expectedValue.from);
        expect(resTo.toISOString()).toEqual(expectedValue.to);
      },
      allCases,
    );

    it('should not round to when in future', () => {
      const now = moment('2016-12-19T10:02');
      const { from, to } = metricsHelpers.roundBoundaries({
        from: moment('2016-02-18T10:59'),
        to: now,
        now: now,
      });

      expect(from.toISOString()).toEqual(moment('2016-02-18T00:00').toISOString());
      expect(to.toISOString()).toEqual(now.toISOString());
    });

    it('will round to fixed precision when given', () => {
      const { from, to } = metricsHelpers.roundBoundaries({
        from: moment('2016-02-18T10:31'),
        to: moment('2016-12-19T10:35'),
        precision: 'hour',
      });
      expect(from.toISOString()).toEqual(moment('2016-02-18T10:00').toISOString());
      expect(to.toISOString()).toEqual(
        moment('2016-12-19T10:00')
          .endOf('hour')
          .toISOString(),
      );
    });
  });

  it('should get metrics from keys', () => {
    const actual = metricsHelpers.getMetricsFromKeys(['count_delayed', 'count_injected']);
    expect(actual).toMatchSnapshot();
  });

  it('should compute keys during transform', () => {
    const data = [
      { count_rendered: 100, count_unique_confirmed_opened_approx: 1, count_targeted: 100 },
      { count_rendered: 101 },
    ];

    const metrics = [
      { key: 'count_rendered' },
      {
        key: 'open_rate_approx',
        computeKeys: ['count_unique_confirmed_opened_approx', 'count_targeted'],
        type: 'percentage',
        compute: (item, keys) => (item[keys[0]] / item[keys[1]]) * 100,
      },
    ];

    const actual = metricsHelpers.transformData(data, metrics);
    expect(actual).toMatchSnapshot();
  });

  it('should build common metric options', () => {
    dateHelpers.getRelativeDates = jest.fn(() => ({ from: 'foo', to: 'bar' }));

    const actual = metricsHelpers.buildCommonOptions(
      { domain: 'gmail' },
      { campaign: 'test', relativeRange: '7days' },
    );

    expect(actual).toMatchSnapshot();
  });

  it('should calculate average', () => {
    const item = { total_delivery_time_first: 500000, count_delivered_first: 500 };
    const keys = ['total_delivery_time_first', 'count_delivered_first'];
    expect(metricsHelpers.average(item, keys)).toEqual(1000);
  });

  it('should calculate rate', () => {
    const item = { count_accepted: 27, count_targeted: 30 };
    const keys = ['count_accepted', 'count_targeted'];
    expect(metricsHelpers.rate(item, keys)).toEqual(90);
  });

  describe('getValidDateRange', () => {
    const invalidCases = [
      {
        name: 'with undefined to',
        from: moment('2018-01-15'),
      },
      {
        name: 'with undefined from',
        to: moment('2017-12-15'),
      },
      {
        name: 'with invalid to',
        to: 'garbage',
        from: moment('2018-01-15'),
      },
      {
        name: 'with invalid from',
        to: moment('2017-12-15'),
        from: 'garbage',
      },
      {
        name: 'with invalid now',
        from: moment('2018-01-15'),
        to: moment('2017-12-15'),
        now: 'garbage',
      },
      {
        name: 'when to is before from',
        from: moment('2018-01-15'),
        to: moment('2017-12-15'),
      },
      {
        name: 'when to is after now',
        from: moment('2018-01-15'),
        to: moment('2018-02-15'),
        now: moment('2018-02-00'),
      },
      {
        name: 'when to is after now (without rounding)',
        from: moment('2018-01-15'),
        to: moment('2018-02-15'),
        now: moment('2018-02-00'),
        roundToPrecision: false,
      },
    ];

    cases(
      'should throw error',
      ({ from, to, now, roundToPrecision = true, preventFuture = true }) => {
        const getInvalidDateRange = () =>
          metricsHelpers.getValidDateRange({ from, to, now, roundToPrecision, preventFuture });
        expect(getInvalidDateRange).toThrowErrorMatchingSnapshot();
      },
      invalidCases,
    );

    it('should use input range if valid and rounded up to nearest precision', () => {
      const from = moment('2018-01-15T11:00Z');
      const to = moment('2018-01-16T11:59Z');
      const now = moment('2018-02-01T11:00Z');

      const validRange = metricsHelpers.getValidDateRange({
        from,
        to,
        now,
        roundToPrecision: true,
        preventFuture: true,
      });
      expect(validRange).toEqual({ from, to: to.endOf('minute') });
    });

    it('should use input range if valid, when not rounding', () => {
      const from = moment('2018-01-15T11:00Z');
      const to = moment('2018-01-16T11:33Z');
      const now = moment('2018-02-01T11:33Z');

      const validRange = metricsHelpers.getValidDateRange({
        from,
        to,
        now,
        roundToPrecision: false,
        preventFuture: true,
      });
      expect(validRange).toEqual({ from, to });
    });

    it('should use input range if valid when "now" is not provided', () => {
      const from = moment('2018-01-15T11:00Z');
      const to = moment('2018-01-16T11:59Z');

      const validRange = metricsHelpers.getValidDateRange({
        from,
        to,
        roundToPrecision: true,
        preventFuture: true,
      });
      expect(validRange).toEqual({ from, to: to.endOf('minute') });
    });

    it('should use current time if input "to" is later than now', () => {
      const from = moment('2018-01-15T11:00Z');
      const to = moment('2018-01-19T11:59Z'); // would use day precision if valid
      const now = moment('2018-01-15T11:23Z'); // will instead use minute precision

      const validRange = metricsHelpers.getValidDateRange({
        from,
        to,
        now,
        roundToPrecision: true,
        preventFuture: true,
      });
      expect(validRange).toEqual({ from, to: now });
    });

    it('should use current time and round it if input "to" is later than now and precision is greater than a minute', () => {
      const from = moment('2018-01-15T11:00Z');
      const to = moment('2018-01-17T10:59Z');
      const now = moment('2018-01-16T11:23Z');

      const validRange = metricsHelpers.getValidDateRange({
        from,
        to,
        now,
        roundToPrecision: true,
        preventFuture: true,
      });
      expect(validRange.from).toEqual(from);
      expect(validRange.to.toISOString()).toEqual(
        moment('2018-01-16T11:59Z')
          .endOf('minute')
          .toISOString(),
      );
    });

    it('should use rounded input if equal to rounded now', () => {
      const from = moment('2018-01-17T12:00Z');
      const to = moment('2018-01-19T11:27Z');
      const now = moment('2018-01-19T11:23Z');

      const validRange = metricsHelpers.getValidDateRange({
        from,
        to,
        now,
        roundToPrecision: true,
        preventFuture: true,
      });
      expect(validRange.from).toEqual(from);
      expect(validRange.to.toISOString()).toEqual(
        moment('2018-01-19T11:59Z')
          .endOf('minute')
          .toISOString(),
      );
    });

    it('should allow past or future dates if preventFuture is false', () => {
      const from = moment('2018-01-19T12:00Z');
      const now = moment('2018-01-20T12:00Z');
      const to = moment('2018-01-21T12:00Z');

      const validRange = metricsHelpers.getValidDateRange({
        from,
        to,
        now,
        roundToPrecision: false,
        preventFuture: false,
      });
      expect(validRange).toEqual({ from, to });
    });

    it('should use the default precision if given', () => {
      const from = moment('2018-01-20T12:01Z');
      const now = moment('2018-01-22T12:00Z');
      const to = moment('2018-01-21T12:13Z');

      const validRange = metricsHelpers.getValidDateRange({
        from,
        to,
        now,
        roundToPrecision: true,
        preventFuture: false,
        precision: '15min',
      });

      expect(validRange.from.toISOString()).toEqual(moment('2018-01-20T12:00Z').toISOString());
      expect(validRange.to.toISOString()).toEqual(
        moment('2018-01-21T12:15:59Z')
          .endOf('minute')
          .toISOString(),
      );
    });
  });

  describe('getMetricFromKey', () => {
    it('should return the relevant metric label based on the unformatted metric key', () => {
      expect(typeof metricsHelpers.getMetricFromKey('count_targeted')).toBe('object');
      expect(typeof metricsHelpers.getMetricFromKey('count_delivered_first')).toBe('object');
      expect(typeof metricsHelpers.getMetricFromKey('spam_complaint_rate')).toBe('object');
      expect(typeof metricsHelpers.getMetricFromKey('count_rendered')).toBe('object');
    });

    it('should return undefined if no metric is found', () => {
      expect(metricsHelpers.getMetricFromKey('this_is_phony')).toBeUndefined();
    });
  });

  describe('getComparisonArguments', () => {
    it('throws an error when an invalid comparison is passed', () => {
      expect(() => metricsHelpers.getFilterByComparison({ type: 'foobar' })).toThrowError();
    });

    it('returns a structured comparison object for each passed in comparison made available via FILTER_TYPES', () => {
      expect(
        metricsHelpers.getFilterByComparison({ type: 'Recipient Domain', value: 'whatever.com' }),
      ).toEqual({
        AND: {
          domains: {
            eq: [
              {
                type: 'Recipient Domain',
                value: 'whatever.com',
              },
            ],
          },
        },
      });
      expect(metricsHelpers.getFilterByComparison({ type: 'Sending IP', value: '12345' })).toEqual({
        AND: {
          sending_ips: {
            eq: [
              {
                type: 'Sending IP',
                value: '12345',
              },
            ],
          },
        },
      });
      expect(
        metricsHelpers.getFilterByComparison({ type: 'IP Pool', value: 'the-best-pool' }),
      ).toEqual({
        AND: {
          ip_pools: {
            eq: [
              {
                type: 'IP Pool',
                value: 'the-best-pool',
              },
            ],
          },
        },
      });
      expect(
        metricsHelpers.getFilterByComparison({ type: 'Campaign', value: 'campaign-yeah' }),
      ).toEqual({
        AND: {
          campaigns: {
            eq: [
              {
                type: 'Campaign',
                value: 'campaign-yeah',
              },
            ],
          },
        },
      });
      expect(
        metricsHelpers.getFilterByComparison({ type: 'Template', value: 'not-a-good-template' }),
      ).toEqual({
        AND: {
          templates: {
            eq: [
              {
                type: 'Template',
                value: 'not-a-good-template',
              },
            ],
          },
        },
      });
      expect(
        metricsHelpers.getFilterByComparison({ type: 'Sending Domain', value: 'whatadomain.com' }),
      ).toEqual({
        AND: {
          sending_domains: {
            eq: [
              {
                type: 'Sending Domain',
                value: 'whatadomain.com',
              },
            ],
          },
        },
      });
      // Subaccounts have a different structure due to the presence of a unique name and ID:
      expect(metricsHelpers.getFilterByComparison({ type: 'Subaccount', id: '123' })).toEqual({
        AND: {
          subaccounts: {
            eq: [
              {
                type: 'Subaccount',
                id: '123',
              },
            ],
          },
        },
      });
    });
  });

  describe('splitInboxMetric', () => {
    it('returns the metric if not an inbox metric', () => {
      const dataSource = ['sending', 'seed', 'panel'];
      const metric = {
        key: 'not_inbox',
      };

      expect(metricsHelpers.splitInboxMetric(metric, dataSource)).toEqual(metric);
    });

    it('returns the metric if it is not panel or seed', () => {
      const dataSource = ['sending'];
      const metric = {
        key: 'count_inbox',
      };

      expect(metricsHelpers.splitInboxMetric(metric, dataSource)).toEqual(metric);
    });

    it('returns the metric if both panel and seed', () => {
      const dataSource = ['seed', 'panel'];
      const metric = {
        key: 'count_inbox',
      };

      expect(metricsHelpers.splitInboxMetric(metric, dataSource)).toEqual(metric);
    });

    it('returns the metric if with correct information if it is seed', () => {
      const dataSource = ['sending', 'seed'];
      expect(
        metricsHelpers.splitInboxMetric(
          {
            key: 'count_inbox',
          },
          dataSource,
        ),
      ).toEqual(expect.objectContaining({ key: 'count_inbox', computeKeys: ['count_inbox_seed'] }));

      expect(
        metricsHelpers.splitInboxMetric(
          {
            key: 'inbox_folder_rate',
          },
          dataSource,
        ),
      ).toEqual(
        expect.objectContaining({
          key: 'inbox_folder_rate',
          computeKeys: ['count_spam_seed', 'count_inbox_seed'],
        }),
      );
    });

    it('returns the metric if with correct information if it is panel', () => {
      const dataSource = ['sending', 'panel'];

      expect(
        metricsHelpers.splitInboxMetric(
          {
            key: 'count_inbox',
          },
          dataSource,
        ),
      ).toEqual(
        expect.objectContaining({ key: 'count_inbox', computeKeys: ['count_inbox_panel'] }),
      );

      expect(
        metricsHelpers.splitInboxMetric(
          {
            key: 'inbox_folder_rate',
          },
          dataSource,
        ),
      ).toEqual(
        expect.objectContaining({
          key: 'inbox_folder_rate',
          computeKeys: ['count_spam_panel', 'count_inbox_panel'],
        }),
      );
    });
  });
});
