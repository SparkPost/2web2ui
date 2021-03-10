import * as reports from '../reports';
import * as dateHelpers from 'src/helpers/date';
import { list as METRICS_LIST } from 'src/config/metrics';
import cases from 'jest-in-case';

jest.mock('src/helpers/date');
jest.mock('src/helpers/string', () => ({
  stringifyTypeaheadfilter: jest.fn(filter => filter.id),
}));

describe('report helpers', () => {
  describe('parseSearch', () => {
    const filters = 'filters=Domain:test.com&filters=Subaccount:test:123';
    const metrics = 'metrics=count-something';

    beforeEach(() => {
      dateHelpers.getRelativeDates = jest.fn(() => ({}));
      dateHelpers.relativeDateOptions = [{ value: '7days', label: 'Last 7 Days' }];
    });

    it('should parse search with missing range', () => {
      const date = 'from=2017-11-03T14:43:00Z&to=2017-11-04T14:43:00Z';
      const search = `?${filters}&${date}&${metrics}`;

      expect(reports.parseSearch(search)).toMatchSnapshot();
    });

    it('should parse search with no empty value', () => {
      expect(reports.parseSearch('').options).toEqual({});
    });

    it('should parse search with a colon in a subaccount name', () => {
      const search = '?filters=Subaccount%3ASubaccount%20with%20a%20bad%3A%20symbol%3A100';
      expect(reports.parseSearch(search).filters).toEqual([
        {
          id: '100',
          type: 'Subaccount',
          value: 'Subaccount with a bad: symbol',
        },
      ]);
    });

    it('uses to relative range with valid from & to', () => {
      const search = `?${filters}&range=7days&from=2019-02-09T02%3A00%3A00Z&to=2019-02-16T02%3A59%3A59Z&${metrics}`;
      reports.parseSearch(search);
      expect(dateHelpers.getRelativeDates).toHaveBeenCalledWith('7days');
    });

    it('uses to default to one day with an invalid range', () => {
      const search = `?${filters}&range=1millionyears&from=2019-02-09T02%3A00%3A00Z&to=2019-02-16T02%3A59%3A59Z&${metrics}`;
      reports.parseSearch(search);
      expect(dateHelpers.getRelativeDates).toHaveBeenCalledWith('day');
    });

    it('defaults to relative range for invalid custom from or to', () => {
      reports.parseSearch(`?${filters}&range=week&from=aaa&to=2019-02-16T02%3A59%3A59Z&${metrics}`);
      expect(dateHelpers.getRelativeDates).toHaveBeenCalledWith('day');

      dateHelpers.getRelativeDates.mockClear();
      reports.parseSearch(
        `?${filters}&range=week&from=2019-02-09T02%3A00%3A00Z&to=2019-02-16T02%3A59%3A59Zzzzzz&${metrics}`,
      );
      expect(dateHelpers.getRelativeDates).toHaveBeenCalledWith('day');
    });

    it('parses long list of metrics to Array correctly', () => {
      const metricsBeer = new Array(21).fill(0).reduce((accumulator, _value, index) => {
        return `${accumulator}&metrics[${index}]=${METRICS_LIST[index].key}`;
      }, '');
      //Because it's over 21
      //Formatted like metrics[0]=foo&metrics[1]=bar

      const { metrics } = reports.parseSearchNew(`?range=week${metricsBeer}`);
      expect(Array.isArray(metrics)).toEqual(true);
    });

    cases(
      'handles invalid datetimes with custom format',
      opts => {
        expect(reports.parseSearch(opts.search).options).toEqual(opts.match);
      },
      [
        {
          name: 'valid from',
          search: 'from=2017-11-03T14:43:00Z',
          match: { from: new Date('2017-11-03T14:43:00.000Z') },
        },
        { name: 'invalid from', search: 'from=2017-11-03T14:43:00Zz', match: {} },
        {
          name: 'invalid from with custom range',
          search: 'from=2017-11-03T14:43:00Zz&range=custom',
          match: {},
        },
        {
          name: 'invalid from valid to with custom range',
          search: 'from=2017-11-03T14:43:00Zk&range=custom&to=2017-11-04T14:43:00Z',
          match: { to: new Date('2017-11-04T14:43:00Z') },
        },
        {
          name: 'valid from invalid to with custom range',
          search: 'from=2017-11-03T14:43:00Z&range=custom&to=2017-11-04T14:43:00Zk',
          match: { from: new Date('2017-11-03T14:43:00Z') },
        },
        {
          name: 'invalid from invalid to with custom range',
          search: 'from=2017-11-03T14:43:00Zk&range=custom&to=2017-11-04T14:43:00Zk',
          match: {},
        },
        {
          name: 'invalid from invalid to with day range',
          search: 'from=2017-11-03T14:43:00Zk&range=day&to=2017-11-04T14:43:00Zk',
          match: {},
        },
      ],
    );
  });

  describe('dedupeFilters', () => {
    it('returns deduped filters', () => {
      const filters = [
        { type: 'Subaccount', value: 'created (ID 698)', id: 698 },
        { type: 'Subaccount', value: 'test create no key (ID 656)', id: 656 },
        { type: 'Subaccount', value: 'created (ID 698)', id: 698 },
        { type: 'not-subaccount', value: 'some random value', id: 550 },
      ];
      expect(reports.dedupeFilters(filters)).toMatchSnapshot();
    });
  });

  describe('mapFiltersToComparators', () => {
    it('returns the new structure for filters', () => {
      const filters = [
        { type: 'Subaccount', value: 'created (ID 698)', id: 698 },
        { type: 'Subaccount', value: 'test create no key (ID 656)', id: 656 },
        { type: 'Template', value: 'oiwjefoijwef' },
        { type: 'Recipient Domain', value: 'some random value' },
      ];
      expect(reports.mapFiltersToComparators(filters)).toMatchSnapshot();
    });

    it('returns an empty array when no mapped filters are returned', () => {
      const filters = [];
      expect(reports.mapFiltersToComparators(filters)).toMatchSnapshot();
    });
  });
});
