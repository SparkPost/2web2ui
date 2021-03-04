import React, { useState, useEffect, useCallback } from 'react';
import { AccessTime } from '@sparkpost/matchbox-icons';
import { listTimeZones, findTimeZone, getUTCOffset, setTimeZone } from 'timezone-support';
import { formatZonedTime } from 'timezone-support/dist/parse-format';
import { Typeahead } from './Typeahead';
import styles from './Typeahead.module.scss';

const Item = ({ label }) => (
  <div className={styles.Item}>
    <span className={styles.Value}>{label}</span>
  </div>
);

const UTC_OPTION = {
  value: 'UTC',
  label: 'UTC',
};

// TODO: Export a lot of this stuff as date helpers

const TIMEZONES = listTimeZones();
const now = new Date();

/**
 * @description reformat the timezone data according to its official name, offset, and UI-friendly/formatted offset value
 */
function getTimezoneWithOffset(timezoneStr) {
  const timezoneObj = findTimeZone(timezoneStr);
  const zonedTime = setTimeZone(now, timezoneObj, { useUTC: true });
  const { offset } = getUTCOffset(now, timezoneObj);
  const formattedOffset = formatZonedTime(zonedTime, 'Z');

  return {
    name: timezoneStr,
    offset,
    formattedOffset,
  };
}

/**
 * @description reformat list to UI-friendly/formatted list consumable by the Typeahead
 */
function getFriendlyTimezone(timezoneObj) {
  return {
    value: timezoneObj.name,
    label: `(UTC${
      timezoneObj.offset !== 0 ? timezoneObj.formattedOffset : ''
    }) ${timezoneObj.name.replace(/_/g, ' ')}`,
  };
}

/**
 * @description sort by the amount of UTC offset
 */
function sortByOffset(a, b) {
  return a.offset - b.offset;
}

/**
 * @description determines whether a timezone is standard or non-standard, e.g., inverse timezones (ETC/UTC-7 is equivalent to UTC+7)
 * @param {string} timezone IANA timezone string
 * @returns {boolean}
 */
function isStandardTimezone(timezone) {
  return timezone.indexOf('/') >= 0 && timezone.indexOf('Etc/') === -1;
}

/**
 * @description get a list of Typeahead options configuration derived from a static list of timezones
 * @param {Array} timezones array of [IANA timezones](https://www.iana.org/time-zones) - defaults to list retrieved from `timezone-support`
 */
function getTimeZoneOptions(timezones = TIMEZONES) {
  const timezoneOptions = timezones
    .filter(isStandardTimezone)
    .map(getTimezoneWithOffset)
    .sort(sortByOffset)
    .map(getFriendlyTimezone);

  // Adds UTC option as the first value in the list
  // Array.prototype.unshift() does not return the array itself so cannot be chained like .map or .filter
  // when an array return as a result.
  timezoneOptions.unshift(UTC_OPTION);

  return timezoneOptions;
}

export const timeZoneOptions = getTimeZoneOptions();

export const TimezoneTypeahead = props => {
  const {
    initialValue,
    onChange: parentOnChange,
    isForcedUTC,
    disabledAndUTCOnly,
    ...rest
  } = props;
  const [selected, setSelected] = useState(timeZoneOptions[0]);

  const findOptionInList = useCallback(
    value => timeZoneOptions.find(option => option.value === value),
    [],
  );

  // initialValue may change if it's coming from redux on parent
  useEffect(() => {
    if (initialValue) {
      setSelected(findOptionInList(initialValue));
    }
  }, [initialValue, findOptionInList]);

  useEffect(() => {
    if (isForcedUTC) {
      setSelected(UTC_OPTION);
      parentOnChange(UTC_OPTION);
    }
  }, [isForcedUTC, parentOnChange]);

  const onChange = item => {
    setSelected(item);
    if (item) {
      parentOnChange(item);
    }
  };

  const typeaheadProps = {
    renderItem: item => <Item label={item.label} />,
    itemToString: item => (item ? item.label : ''),
    placeholder: 'Select a Timezone',
    label: 'Time Zone',
    errorInLabel: false,
    error: false,
    name: 'timezone-typeahead',
    results: timeZoneOptions,
    selectedItem: selected,
    onChange: onChange,
    maxNumberOfResults: timeZoneOptions.length,
    icon: AccessTime,
    ...rest,
  };

  if (disabledAndUTCOnly) {
    return <Typeahead {...typeaheadProps} selectedItem={UTC_OPTION} disabled />;
  }

  return <Typeahead {...typeaheadProps} canChange />;
};
