export default function time({
  year = 1970,
  month = 1,
  day = 1,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
} = {}) {
  return new Date(Date.UTC(year, --month, day, hour, minute, second, millisecond));
}
