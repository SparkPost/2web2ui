import {
  fillByDate,
  getDateTicks,
  getEndOfDay,
  getStartOfDay,
  getNextHour,
  getRelativeDates,
  getRelativeDateOptions,
  getDuration,
  formatDate,
  formatTime,
  formatDateTime,
  isSameDate,
  getLocalTimezone,
  formatApiTimestamp,
  formatInputDate,
  formatInputTime,
  parseDate,
  parseTime,
  parseDatetime,
  parseDateTimeTz,
  toMilliseconds,
  formatDateTimeWithoutYear,
  getFormattedDateRangeForAggregateData,
  formatTimezonesToOptions,
} from '../date';
import { roundBoundaries } from '../metrics';
import cases from 'jest-in-case';
import moment from 'moment';

describe('Date helpers', () => {
  it('should get end of day', () => {
    const endOfDay = new Date('2017-12-18T23:59:59.999');
    expect(getEndOfDay('2017-12-18T00:00:00')).toEqual(endOfDay);
    expect(getEndOfDay('2017-12-18T23:00:00')).toEqual(endOfDay);
  });

  it('(with preventFuture: true) should get end of day as current time if end of day is in the future', () => {
    const now = new Date('2017-12-18T04:20:00-04:00');
    Date.now = jest.fn(() => now);
    expect(getEndOfDay('2017-12-18T12:20:00-04:00', { preventFuture: true })).toEqual(now);
  });

  it('(with preventFuture: true) should get end of day normally if end of day is in the past', () => {
    const now = new Date('2017-12-18T04:20:00');
    const endOfDay = new Date('2017-11-01T23:59:59.999');
    Date.now = jest.fn(() => now);
    expect(getEndOfDay('2017-11-01T12:00:00', { preventFuture: true })).toEqual(endOfDay);
  });

  it('should get start of day', () => {
    const startOfDay = new Date('2017-12-18T00:00:00.000');
    expect(getStartOfDay('2017-12-18T00:01:59')).toEqual(startOfDay);
    expect(getStartOfDay('2017-12-18T23:59:59')).toEqual(startOfDay);
  });

  it('should get start of next hour', () => {
    const now = new Date('2017-12-18T04:20:00');
    const nextHour = new Date('2017-12-18T05:00:00');
    Date.now = jest.fn(() => now);
    expect(getNextHour('2017-12-18T00:00:00')).toEqual(nextHour);
    expect(getNextHour('2017-12-18T12:34:56')).toEqual(nextHour);
  });

  it('should compare two dates', () => {
    const a1 = new Date('2018-02-14T12:00:00');
    const a2 = new Date(a1);
    const b = new Date(a1);
    b.setYear(1970);
    const c = '2018-02-14T12:00:00';

    expect(isSameDate(a1, a2)).toEqual(true);
    expect(isSameDate(a1, b)).toEqual(false);

    // must be dates to be the same
    expect(isSameDate(a1, c)).toEqual(false);
  });

  it('should get correctly formatted date range for aggregate data', () => {
    const from = new Date('2020-12-07T04:20:00');
    const to = new Date('2020-12-14T04:20:00');
    expect(getFormattedDateRangeForAggregateData(from, to)).toEqual('Dec 7th - Dec 14th, 2020');
  });

  describe('getRelativeDates', () => {
    cases(
      'calculations',
      ({ range, roundToPrecision, subtractArgs }) => {
        const date = moment(new Date('2017-12-17T12:00:00'));
        Date.now = jest.fn(() => date);
        const { from, to, relativeRange } = getRelativeDates(range, { roundToPrecision });
        let expectedFrom = moment(date.toDate()).subtract(...subtractArgs);
        let expectedTo = date;
        if (roundToPrecision) {
          const rounded = roundBoundaries({ from: expectedFrom, to: expectedTo });
          expectedFrom = rounded.from;
          expectedTo = rounded.to;
        }
        expect(to).toEqual(expectedTo.toDate());
        expect(from).toEqual(expectedFrom.toDate());
        expect(relativeRange).toEqual(range);
      },
      {
        'for an hour ago': { range: 'hour', subtractArgs: [1, 'hours'], roundToPrecision: false },
        'for a day ago': { range: 'day', subtractArgs: [1, 'days'], roundToPrecision: false },
        'for a week ago': { range: '7days', subtractArgs: [7, 'days'], roundToPrecision: false },
        'for 10 days ago': { range: '10days', subtractArgs: [10, 'days'], roundToPrecision: false },
        'for two weeks ago': {
          range: '14days',
          subtractArgs: [14, 'days'],
          roundToPrecision: false,
        },
        'for a month': { range: '30days', subtractArgs: [30, 'days'], roundToPrecision: false },
        'for a quarter ago': {
          range: '90days',
          subtractArgs: [90, 'days'],
          roundToPrecision: false,
        },
        'for an hour ago rounded': {
          range: 'hour',
          subtractArgs: [1, 'hours'],
          roundToPrecision: true,
        },
        'for a day ago rounded': {
          range: 'day',
          subtractArgs: [1, 'days'],
          roundToPrecision: true,
        },
        'for a week ago rounded': {
          range: '7days',
          subtractArgs: [7, 'days'],
          roundToPrecision: true,
        },
        'for 10 days ago rounded': {
          range: '10days',
          subtractArgs: [10, 'days'],
          roundToPrecision: true,
        },
        'for a month rounded': {
          range: '30days',
          subtractArgs: [30, 'days'],
          roundToPrecision: true,
        },
        'for a quarter ago rounded': {
          range: '90days',
          subtractArgs: [90, 'days'],
          roundToPrecision: true,
        },
      },
    );

    it('should default to rounding the range', () => {
      const date = moment(new Date('2017-12-17T12:00:00'));
      Date.now = jest.fn(() => date);
      const { from: expectedFrom, to: expectedTo } = roundBoundaries({
        from: moment(date.toDate()).subtract(7, 'days'),
        to: date,
      });
      const { from, to, relativeRange } = getRelativeDates('7days');

      expect(to).toEqual(expectedTo.toDate());
      expect(from).toEqual(expectedFrom.toDate());
      expect(relativeRange).toEqual('7days');
    });

    it('should return for a custom relative date range', () => {
      expect(getRelativeDates('custom')).toEqual({ relativeRange: 'custom' });
    });

    it('should return an empty object when argument is undefined', () => {
      const a = {};
      expect(getRelativeDates(a.nope)).toEqual({});
    });

    it('should throw an error if range is unknown', () => {
      expect(() => getRelativeDates('invalid-like-whoa')).toThrow(
        'Tried to calculate a relative date range with an invalid range value: invalid-like-whoa',
      );
    });
  });

  describe('getRelativeDateOptions', () => {
    it('should get a set of date range options', () => {
      const options = getRelativeDateOptions(['hour', 'day', 'custom']);
      expect(options).toEqual([
        { value: 'hour', label: expect.any(String) },
        { value: 'day', label: expect.any(String) },
        { value: 'custom', label: expect.any(String) },
      ]);
    });
  });

  describe('date formatting', () => {
    let testDate;

    beforeEach(() => {
      testDate = moment('2017-10-15T08:55:00');
    });

    it('should format a date consistently', () => {
      expect(formatDate(testDate)).toEqual('Oct 15 2017');
    });

    it('should format a date given a custom format string', () => {
      expect(formatDate(testDate, 'YYYY')).toEqual('2017');
    });

    it('should format a time consistently', () => {
      expect(formatTime(testDate)).toEqual('8:55am');
      testDate.hours(15);
      expect(formatTime(testDate)).toEqual('3:55pm');
    });

    it('should format a time given a custom format string', () => {
      expect(formatTime(testDate, 'ha')).toEqual('8am');
    });

    it('should format a date-time consistently', () => {
      expect(formatDateTime(testDate)).toEqual('Oct 15 2017, 8:55am');
    });

    it('should format a date-time without year consistently', () => {
      expect(formatDateTimeWithoutYear(testDate)).toEqual('Oct 15, 8:55am');
    });
  });

  describe('getLocalTimezone', () => {
    it('should return UTC if Intl is not defined', () => {
      delete global.Intl;
      expect(getLocalTimezone()).toEqual('UTC');
    });

    it('should return UTC if DateFormat is not a function', () => {
      global.Intl = {};
      expect(getLocalTimezone()).toEqual('UTC');
    });

    it('should return UTC if resolvedOptions is not a function', () => {
      const dtfMock = jest.fn(() => ({}));
      global.Intl = {
        DateTimeFormat: dtfMock,
      };

      expect(getLocalTimezone()).toEqual('UTC');
      expect(dtfMock).toHaveBeenCalledTimes(1);
    });

    it('should return the timezone', () => {
      const optionsMock = jest.fn(() => ({ timeZone: 'Cool/Story' }));
      const dtfMock = jest.fn(() => ({
        resolvedOptions: optionsMock,
      }));
      global.Intl = {
        DateTimeFormat: dtfMock,
      };
      expect(getLocalTimezone()).toEqual('Cool/Story');
      expect(dtfMock).toHaveBeenCalledTimes(1);
      expect(optionsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('formatApiTimestamp', () => {
    it('returns ISO 8601 timestamp', () => {
      expect(formatApiTimestamp('Fri, 21 Nov 1997 09:55:06 -0600')).toEqual('1997-11-21T15:55:06Z');
    });
  });

  describe('formatInputDate', () => {
    const dateTime = '2018-04-17T15:18:42Z';

    it('returns valid date', () => {
      expect(formatInputDate(dateTime).toString()).toEqual('2018-04-17');
    });
  });

  describe('formatInputTime', () => {
    const dateTime = '2018-04-17T15:18:42Z';

    it('returns valid date', () => {
      expect(formatInputTime(dateTime).toString()).toEqual('11:18am');
    });
  });

  describe('parseDate', () => {
    it('returns invalid date for undefined', () => {
      expect(parseDate()).not.toBeValidMomentDate();
    });

    it('returns invalid date for empty string', () => {
      expect(parseDate('')).not.toBeValidMomentDate();
    });

    it('returns invalid date', () => {
      expect(parseDate('04-17-2018')).not.toBeValidMomentDate();
    });

    it('returns valid date for ISO-8601 date strings', () => {
      expect(parseDate('2018-04-17')).toBeValidMomentDate();
    });
  });

  describe('parseTime', () => {
    it('returns invalid time for undefined', () => {
      expect(parseTime()).not.toBeValidMomentDate();
    });

    it('returns invalid time for empty string', () => {
      expect(parseTime('')).not.toBeValidMomentDate();
    });

    it('returns valid time for zero-hour', () => {
      expect(parseTime('00:00')).toBeValidMomentDate();
    });

    it('returns valid time for 12-hour time', () => {
      expect(parseTime('12:00am')).toBeValidMomentDate();
    });

    it('returns valid time for 24-hour time', () => {
      expect(parseTime('14:00')).toBeValidMomentDate();
    });

    it('returns valid time for 24-hour with am/pm', () => {
      expect(parseTime('14:00am')).toBeValidMomentDate();
    });
  });

  describe('parseDatetime', () => {
    it('returns invalid date time for undefined', () => {
      expect(parseDatetime()).not.toBeValidMomentDate();
    });

    it('returns invalid date time for empty string', () => {
      expect(parseDatetime('')).not.toBeValidMomentDate();
    });

    it('returns valid date time for 12-hour time', () => {
      expect(parseDatetime('2018-01-01 12:00am')).toBeValidMomentDate();
    });

    it('returns valid time for 24-hour time', () => {
      expect(parseDatetime('2018-01-01 14:00')).toBeValidMomentDate();
    });

    it('returns valid time for 24-hour with am/pm', () => {
      expect(parseDatetime('2018-01-01 14:00am')).toBeValidMomentDate();
    });
  });

  describe('parseDateTimeTz', () => {
    it('returns a valid Moment date time according to the passed in date and timezone', () => {
      const result = parseDateTimeTz({
        timezone: 'America/Belize',
        date: '2018-01-01',
        time: '1:00am',
      });

      expect(result).toBeValidMomentDate();
    });
  });

  describe('getDuration', () => {
    it('returns the duration between two dates in hours', () => {
      expect(getDuration({ from: '2017-12-18T00:00:00', to: '2017-12-19T00:00:00' })).toEqual(24);
    });

    it('returns the duration between two dates in days', () => {
      expect(
        getDuration({ from: '2017-12-18T00:00:00', to: '2017-12-19T00:00:00' }, 'days'),
      ).toEqual(1);
    });
  });

  describe('fillByDate', () => {
    it('returns sorted and filled dataset', () => {
      const dates = { to: '2018-02-03T04:20:00-04:00', from: '2018-01-26T04:20:00-04:00' };
      const dataSet = [
        { date: '2018-02-02', value: 234 },
        { date: '2018-01-30', value: 123 },
      ];
      const fill = { value: null };

      expect(fillByDate({ dataSet, fill, ...dates })).toMatchSnapshot();
    });
  });

  describe('getDateTicks', () => {
    it('returns an array of start, end and middle days', () => {
      expect(
        getDateTicks({ to: '2018-05-25T04:20:00-04:00', from: '2018-05-01T04:20:00-04:00' }),
      ).toEqual(['2018-05-01', '2018-05-13', '2018-05-25']);
    });
  });

  describe('toMilliseconds', () => {
    it('returns milliseconds', () => {
      expect(toMilliseconds(1318781876.721)).toEqual(1318781876721);
    });
  });

  describe('getTimezoneOptions', () => {
    it('returns a list of typeahead options according to timezones returned by `timezone-support`', () => {
      const options = formatTimezonesToOptions();

      expect(options).toMatchSnapshot();
      expect(options[0]).toEqual({
        label: 'UTC',
        value: 'Etc/UTC',
      });
    });
  });
});
