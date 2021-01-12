import { formatHourString, formatMinuteString } from 'src/helpers/units';
import _ from 'lodash';

export const formatFormValues = formValues => {
  const { name, subject, period, timing, timezone, ...rest } = formValues;
  const recipients = rest.recipients.map(({ username }) => username);
  const [hour, minute] = rest.time.split(':');

  /*
  Monthly timing will be formatted like fri#2 for second friday of the month. Or monl for the last monday of the month.
  For weekly timing, use the given day, EX: 'fri'
  For daily reports, the day selector field is disabled meaning resulting in day = undefined. So in this case, we set it to '*'
  */
  const day_of_week = timing === 'monthly' ? `${rest.day}${rest.week}` : rest.day || '*';

  const schedule = {
    day_of_week,
    month: '*',
    day_of_month: '?',
    hour: period === 'AM' ? parseInt(hour) % 12 : (parseInt(hour) % 12) + 12,
    minute: parseInt(minute),
    second: 0,
  };

  return {
    name,
    subject,
    recipients,
    schedule,
    schedule_type: timing,
    timezone,
  };
};
export const getDefaultValues = (scheduledReport, users) => {
  if (Object.keys(scheduledReport).length === 0 || users?.length === 0) {
    return {};
  }
  const {
    created,
    modified,
    reportId,
    schedule_type,
    schedule = {},
    recipients,
    ...rest
  } = scheduledReport;

  const { day_of_week, hour, minute } = schedule;
  //day_of_week will be in format mon#2 for 2nd monday or monl for last monday.
  const day = schedule_type === 'daily' ? undefined : day_of_week.slice(0, 3);
  const week = schedule_type === 'monthly' ? day_of_week.slice(3) : undefined;
  const period = parseInt(hour) >= 12 ? 'PM' : 'AM';
  const formattedHour = formatHourString(hour);
  const formattedMinute = formatMinuteString(minute);
  const time = `${formattedHour}:${formattedMinute}`;
  const fullRecipients = recipients
    .map(recipient => {
      return users.find(({ username }) => username === recipient);
    })
    .filter(Boolean);

  return {
    ...rest,
    day,
    recipients: fullRecipients,
    period,
    time,
    timing: schedule_type,
    week,
  };
};

//users keeps getting recreated as a new array but with the same values
//Need to memoize the default value so that the new users array returns the same object
export const getDefaultValuesMemoized = _.memoize(getDefaultValues, (scheduledReport, users) => {
  const scheduledReportString = JSON.stringify(scheduledReport);
  const usersString = users.map(({ name, email }) => `(${name}${email})`).join('-');
  return `${scheduledReportString}${usersString}`;
});

export const hasAtLeastOneRecipient = recipientList => recipientList.length > 0;

//If this is updated, also update function in
//cypress/tests/integration/signals-analytics/analytics-report/scheduledReports.spec.js.
export const recipientUserToString = user => (user ? `${user.name} <${user.email}>` : '');
