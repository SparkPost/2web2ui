import { formatFormValues, getDefaultValues } from '../scheduledReports';

const users = [
  { name: 'bob', email: 'bob@theBuilder.com' },
  { name: 'bob2', email: 'bob2@theBuilder.com' },
];

describe('getDefaultValues and ', () => {
  const formValuesBase = {
    name: 'test',
    recipients: [{ name: 'bob', email: 'bob@theBuilder.com' }],
    subject: 'meh',
    timezone: 'America/New_York',
  };
  const apiValuesBase = {
    name: 'test',
    recipients: ['bob'],
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
