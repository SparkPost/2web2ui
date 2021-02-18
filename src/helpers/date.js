import moment from 'moment';
import config from 'src/config';
import { roundBoundaries } from './metrics';
import { FORMATS } from 'src/constants';
import { format, utcToZonedTime } from 'date-fns-tz';

export const relativeDateOptions = [
  { value: 'hour', label: 'Last Hour' },
  { value: 'day', label: 'Last 24 Hours' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '10days', label: 'Last 10 Days' },
  { value: '14days', label: 'Last 14 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom' },
];

export const relativeDateOptionsIndexed = relativeDateOptions.reduce((result, { value, label }) => {
  result[value] = label;
  return result;
}, {});

export const getRelativeDateOptions = ranges =>
  relativeDateOptions.filter(item => ranges.includes(item.value));

/**
 * Takes a date string and returns the end of that day (11:59PM)
 *
 * If preventFuture is true and the given day IS the current day,
 * it returns the current time, i.e. the closest to the end
 * of the day without going into the future.
 *
 * @param {String} date - date string to base date on
 * @return {Date}
 */
export function getEndOfDay(date, { preventFuture } = {}) {
  const now = moment();
  const end = new Date(date);

  if (preventFuture && now.isSame(end, 'day')) {
    return now.toDate();
  }

  end.setHours(23, 59, 59, 999);
  return end;
}

export function getStartOfDay(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getNextHour(date) {
  const roundedDate = new Date(date);
  const now = new Date(Date.now());
  roundedDate.setHours(now.getHours() + 1, 0, 0, 0);
  return roundedDate;
}

export function isSameDate(a, b) {
  return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
}

/**
 * Use native JS methods to get user's local
 * timezone, if those methods are present
 *
 * Defaults to UTC otherwise
 */
export function getLocalTimezone() {
  // eslint-disable-next-line new-cap
  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
    return 'UTC';
  }

  // eslint-disable-next-line new-cap
  const format = Intl.DateTimeFormat();

  if (typeof format.resolvedOptions !== 'function') {
    return 'UTC';
  }

  return format.resolvedOptions().timeZone;
}

export function getRelativeDates(
  range,
  { now = moment().toDate(), roundToPrecision = true, precision } = {},
) {
  let preciseFrom;

  switch (range) {
    case 'hour':
      preciseFrom = moment(now)
        .subtract(1, 'hour')
        .toDate();
      break;

    case 'day':
      preciseFrom = moment(now)
        .subtract(1, 'day')
        .toDate();
      break;

    case '7days':
    case '10days':
    case '14days':
    case '30days':
    case '90days': {
      const numberOfDays = parseInt(range.replace('days', ''));
      preciseFrom = moment(now)
        .subtract(numberOfDays, 'day')
        .toDate();
      break;
    }
    case 'custom':
      return { relativeRange: range };

    default: {
      if (range) {
        throw new Error(
          `Tried to calculate a relative date range with an invalid range value: ${range}`,
        );
      }
      return {};
    }
  }

  if (roundToPrecision) {
    const { to, from } = roundBoundaries({ from: preciseFrom, to: now, precision });
    return { to: to.toDate(), from: from.toDate(), relativeRange: range };
  }

  return { to: now, from: preciseFrom, relativeRange: range };
}

export function getDuration(dates, unit = 'hours') {
  if (!dates) return;

  const { from, to } = dates;

  return moment(to).diff(moment(from), unit);
}

export function formatToTimezone(date, dateFormat, timeZone = getLocalTimezone()) {
  if (!date) {
    throw new Error('Invalid date passed in');
  } else if (!dateFormat) {
    throw new Error('No date formatter passed in');
  }
  return format(utcToZonedTime(new Date(date), timeZone), dateFormat, { timeZone });
}

export function formatDate(date, FORMAT = config.dateFormat) {
  return moment(date).format(FORMAT);
}

export function formatTime(time, FORMAT = config.timeFormat) {
  return moment(time).format(FORMAT);
}

export function formatDateTime(datetime, FORMAT) {
  return FORMAT
    ? moment(datetime).format(FORMAT)
    : `${formatDate(datetime)}, ${formatTime(datetime)}`;
}

export function formatDateTimeWithoutYear(datetime) {
  return formatDateTime(datetime, `${config.dateFormatWithoutYear}, ${config.timeFormat}`);
}

export function getFormattedDateRangeForAggregateData(from, to) {
  return `${formatDate(from, 'MMM Do')} - ${formatDate(to, 'MMM Do, YYYY')}`;
}
// format as ISO 8601 timestamp to match SP API
export const formatApiTimestamp = time => moment.utc(time).format();
export const formatApiDate = date => moment.utc(date).format(FORMATS.MOMENT.SHORT_DATE);
export const formatInputDate = date => moment(date).format(FORMATS.MOMENT.SHORT_DATE);
export const formatInputTime = time => moment(time).format(FORMATS.MOMENT.TIME);
export const parseDate = str => moment(str, FORMATS.MOMENT.INPUT_DATES, true);
export const parseTime = str => moment(str, FORMATS.MOMENT.INPUT_TIMES, true);
export const parseDatetime = (...args) =>
  moment(args.join(' '), FORMATS.MOMENT.INPUT_DATETIMES, true);
export const parseDateTimeTz = (timezone, ...args) =>
  moment.tz(args.join(' '), FORMATS.MOMENT.INPUT_DATETIMES, true, timezone);
export const fillByDate = ({ dataSet, fill = {}, from, to } = {}) => {
  const orderedData = dataSet.sort((a, b) => new Date(a.date) - new Date(b.date));
  let filledDataSet = [];

  for (let time = moment(from), index = 0; time.isBefore(moment(to)); time.add(1, 'day')) {
    const data = orderedData[index];
    const fillData = { ...fill, date: formatInputDate(time) };

    if (!data || data.date !== fillData.date) {
      filledDataSet = [...filledDataSet, fillData];
    } else {
      filledDataSet = [...filledDataSet, data];
      index++;
    }
  }

  return filledDataSet;
};

/**
 * Generates 3 dates based off provided dates
 * Returns first date, middle date, and end
 */
export function getDateTicks({ to, from }) {
  const diff = moment(to).diff(from, 'days');
  const middle = moment(from).add(diff / 2, 'days');

  return [formatInputDate(from), formatInputDate(middle), formatInputDate(to)];
}

// see, https://momentjs.com/docs/#/parsing/unix-timestamp-milliseconds/
export const toMilliseconds = seconds => seconds * 1000;
