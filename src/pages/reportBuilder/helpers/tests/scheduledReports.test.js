import { formatFormValues, getDefaultValues, segmentDataTransform } from '../scheduledReports';

const users = [
  { name: 'bob', email: 'bob@theBuilder.com', username: 'bob-123' },
  { name: 'bob2', email: 'bob2@theBuilder.com', username: 'bob2-456' },
];

describe('ScheduledReports helpers', () => {
  describe('getDefaultValues and formatFormValues', () => {
    const formValuesBase = {
      name: 'test',
      recipients: [{ name: 'bob', email: 'bob@theBuilder.com', username: 'bob-123' }],
      subject: 'meh',
      timezone: 'America/New_York',
    };
    const apiValuesBase = {
      name: 'test',
      recipients: ['bob-123'],
      subject: 'meh',
      timezone: 'America/New_York',
    };

    it('formats form values for daily schedule correctly', () => {
      const formValues = {
        ...formValuesBase,
        day: undefined,
        period: 'AM',
        time: '12:00',
        timing: 'daily',
      };
      const apiValues = {
        ...apiValuesBase,
        schedule: {
          day_of_month: '?',
          day_of_week: '*',
          hour: 0,
          minute: 0,
          month: '*',
          second: 0,
        },
        schedule_type: 'daily',
      };
      expect(formatFormValues(formValues)).toEqual(apiValues);
      expect(getDefaultValues(apiValues, users)).toEqual(formValues);
    });

    it('formats form values for daily PM schedule correctly', () => {
      const formValues = {
        ...formValuesBase,
        day: undefined,
        week: undefined,
        period: 'PM',
        time: '12:30',
        timing: 'daily',
      };
      const apiValues = {
        ...apiValuesBase,
        schedule: {
          day_of_month: '?',
          day_of_week: '*',
          hour: 12,
          minute: 30,
          month: '*',
          second: 0,
        },
        schedule_type: 'daily',
      };
      expect(formatFormValues(formValues)).toEqual(apiValues);
      expect(getDefaultValues(apiValues, users)).toEqual(formValues);
    });

    it('formats form values for weekly schedule correctly', () => {
      const formValues = {
        ...formValuesBase,
        day: 'mon',
        week: undefined,
        period: 'PM',
        time: '1:30',
        timing: 'weekly',
      };
      const apiValues = {
        ...apiValuesBase,
        schedule: {
          day_of_month: '?',
          day_of_week: 'mon',
          hour: 13,
          minute: 30,
          month: '*',
          second: 0,
        },
        schedule_type: 'weekly',
      };
      expect(formatFormValues(formValues)).toEqual(apiValues);
      expect(getDefaultValues(apiValues, users)).toEqual(formValues);
    });

    it('formats form values for monthly schedule correctly', () => {
      const formValues = {
        ...formValuesBase,
        week: 'l',
        day: 'fri',
        period: 'PM',
        time: '1:30',
        timing: 'monthly',
      };
      const apiValues = {
        ...apiValuesBase,
        schedule: {
          day_of_month: '?',
          day_of_week: 'fril',
          hour: 13,
          minute: 30,
          month: '*',
          second: 0,
        },
        schedule_type: 'monthly',
      };
      expect(formatFormValues(formValues)).toEqual(apiValues);
      expect(getDefaultValues(apiValues, users)).toEqual(formValues);
    });

    it('getDefaultValues returns an empty object when no scheduled report is given ', () => {
      const apiValues = {};
      expect(getDefaultValues(apiValues, users)).toEqual({});
    });

    it('getDefaultValues returns an empty object when no users are given ', () => {
      const apiValues = {
        ...apiValuesBase,
        schedule: {
          day_of_month: '?',
          day_of_week: 'fril',
          hour: 13,
          minute: 30,
          month: '*',
          second: 0,
        },
        schedule_type: 'monthly',
      };
      expect(getDefaultValues(apiValues, [])).toEqual({});
    });
  });
  describe('segmentDataTransform ', () => {
    const formValues = {
      schedule_type: 'daily',
      recipients: ['foo', 'bar'],
    };
    const reportQuery = 'metrics=count_sent&metrics=count_accepted';
    it('transforms old filters correctly', () => {
      const newQueryString = `${reportQuery}&filters=Campaign%3ABlack%20Friday`;
      expect(segmentDataTransform(formValues, newQueryString)).toEqual({
        comparisons: undefined,
        metrics: ['count_sent', 'count_accepted'],
        query_filters: undefined,
        recipients: 2,
        schedule_type: 'daily',
        filters: 'Campaign:Black Friday',
      });
    });

    it('transforms new filters correctly', () => {
      const newQueryString = `${reportQuery}&query_filters=%5B%7B"AND"%3A%7B"campaigns"%3A%7B"eq"%3A%5B"Black%20Friday"%2C"Christmas%20Sale"%5D%7D%7D%7D%5D`;
      expect(segmentDataTransform(formValues, newQueryString)).toEqual({
        comparisons: undefined,
        metrics: ['count_sent', 'count_accepted'],
        query_filters: [{ AND: { campaigns: { eq: ['Black Friday', 'Christmas Sale'] } } }],
        recipients: 2,
        schedule_type: 'daily',
        filters: undefined,
      });
    });

    it('transforms comparators correctly', () => {
      const newQueryString = `${reportQuery}&comparisons%5B0%5D%5Btype%5D=Campaign&comparisons%5B0%5D%5Bvalue%5D=Black%20Friday&comparisons%5B1%5D%5Btype%5D=Campaign&comparisons%5B1%5D%5Bvalue%5D=Christmas%20Sale`;
      expect(segmentDataTransform(formValues, newQueryString)).toEqual({
        comparisons: [
          {
            type: 'Campaign',
            value: 'Black Friday',
          },
          {
            type: 'Campaign',
            value: 'Christmas Sale',
          },
        ],
        metrics: ['count_sent', 'count_accepted'],
        query_filters: undefined,
        recipients: 2,
        schedule_type: 'daily',
        filters: undefined,
      });
    });
  });
});
