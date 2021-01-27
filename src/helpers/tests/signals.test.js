import {
  getFriendlyTitle,
  getDoD,
  getCaretProps,
  getDates,
  getValidSignalsDateRange,
} from '../signals';
import cases from 'jest-in-case';
import thresholds from 'src/pages/signals/constants/healthScoreThresholds';
import { roundBoundaries } from 'src/helpers/metrics';
import moment from 'moment';

cases(
  '.getFriendlyTitle',
  ({ expected, values }) => {
    expect(getFriendlyTitle(values)).toEqual(expected);
  },
  {
    'returns nothing with no facet set': {
      expected: null,
      values: { facetId: 'facetId' },
    },
    'translate mailbox provider': {
      expected: 'UK Providers',
      values: { facet: 'mb_provider', facetId: 'uk_providers' },
    },
    'translate mailbox provider that is not defined': {
      expected: 'rando_provider',
      values: { facet: 'mb_provider', facetId: 'rando_provider' },
    },
    'translate ip pool': {
      expected: 'IP Pool shared',
      values: { facet: 'ip_pool', facetId: 'shared' },
    },
    'translate domain': {
      expected: 'test.co',
      values: { facet: 'sending_domain', facetId: 'test.co' },
    },
    'translate campaign': {
      expected: 'Campaign welcome',
      values: { facet: 'campaign_id', facetId: 'welcome' },
    },
    'translate primary account': {
      expected: 'Primary Account',
      values: { facet: 'sid', facetId: '0' },
    },
    'translate subaccount': {
      expected: 'Subaccount 101',
      values: { facet: 'sid', facetId: '101' },
    },
    'appends a subaccount': {
      expected: 'test.co for Subaccount 102',
      values: { facet: 'sending_domain', facetId: 'test.co', subaccountId: '102' },
    },
    'should trim': {
      expected: 'test.co for Subaccount 105',
      values: { facet: 'sending_domain', facetId: '   test.co', subaccountId: '105' },
    },
  },
);

describe('.getDoD', () => {
  it('returns correct day over day change', () => {
    expect(getDoD(20, 10)).toEqual(100);
    expect(getDoD(20, 12)).toEqual(66.7);
    expect(getDoD(0, 1)).toEqual(-100);
    expect(getDoD(1, 0)).toEqual(Infinity);
  });

  it('returns null if current value is nil', () => {
    expect(getDoD(undefined, 10)).toBeNull();
  });

  it('returns null if previous value is nil', () => {
    expect(getDoD(10, undefined)).toBeNull();
  });
});

describe('.getCaretProps', () => {
  it('returns props for a positive value', () => {
    expect(getCaretProps(10)).toEqual({
      direction: 'up',
      color: thresholds.good.color,
    });
  });

  it('returns props for a negative value', () => {
    expect(getCaretProps(-10)).toEqual({
      direction: 'down',
      color: thresholds.danger.color,
    });
  });

  it('returns props for a positive value with reversed colors', () => {
    expect(getCaretProps(10, true)).toEqual({
      direction: 'up',
      color: thresholds.danger.color,
    });
  });

  it('returns props for a negative value with reversed colors', () => {
    expect(getCaretProps(-10, true)).toEqual({
      direction: 'down',
      color: thresholds.good.color,
    });
  });
});

describe('.getDates', () => {
  it('sets relative range', () => {
    const { from, to } = roundBoundaries({
      from: moment('2017-10-02T04:00:00Z'),
      to: moment('2017-12-31T05:59:59.999Z'),
    });
    expect(
      getDates({
        relativeRange: '90days',
        now: '2018-01-01T05:00:00Z',
      }),
    ).toEqual({
      relativeRange: '90days',
      from: from.toDate(),
      to: to.toDate(),
    });
  });

  it('sets custom dates', () => {
    expect(
      getDates({
        relativeRange: 'custom',
        from: new Date('2015-01-04T05:00:00Z'),
        to: new Date('2015-01-09T05:00:00Z'),
        now: '2018-01-01T05:00:00Z',
      }),
    ).toEqual({
      relativeRange: 'custom',
      from: new Date('2015-01-04T05:00:00Z'),
      to: new Date('2015-01-09T05:00:00Z'),
    });
  });
});

describe('getValidSignalsDateRange', () => {
  const from = moment('2019-10-02T00:00:00Z');
  const to = moment('2019-12-30T23:59:59.99Z');
  const now = new Date('2019-12-31T04:00:00-04:00');
  Date.now = jest.fn(() => now);

  it('returns formatted to and from if dates are valid', () => {
    const { from: adjustedFrom, to: adjustedTo } = getValidSignalsDateRange({
      from,
      to,
    });
    expect(adjustedFrom.format('YYYY-MM-DD')).toEqual('2019-10-02');
    expect(adjustedTo.format('YYYY-MM-DD')).toEqual('2019-12-30');
  });

  it('returns invalid date format error when to/from are in incorrect format', () => {
    expect(() =>
      getValidSignalsDateRange({
        from: moment('foo'),
        to,
      }),
    ).toThrow('Invalid date format given');
  });

  it('returns minimum date range error when range is < 7 days', () => {
    expect(() =>
      getValidSignalsDateRange({
        from: moment('2019-12-29T04:00:00Z'),
        to,
      }),
    ).toThrow('Range must be at least 7 days');
  });

  it('returns invalid date range error when to/from/now are not in order', () => {
    expect(() =>
      getValidSignalsDateRange({
        from: moment('2020-12-29T04:00:00Z'),
        to,
      }),
    ).toThrow('Invalid date range given');
  });
});
