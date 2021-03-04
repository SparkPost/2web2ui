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

const timeZones = listTimeZones();
const now = new Date();

export const timeZoneOptions = timeZones
  // Filter out non-standard timezones, inverse timezones (ETC/UTC-7 is equivalent to UTC+7)
  .filter(
    tz =>
      tz.indexOf('/') >= 0 &&
      tz.indexOf('Etc/') === -1 &&
      getUTCOffset(now, findTimeZone(tz)).offset !== 0,
  )
  // Remap the timezone data according to its official name, offset, and UI-friendly/formatted offset value
  .map(tz => {
    const timezoneObj = findTimeZone(tz);
    const zonedTime = setTimeZone(now, timezoneObj, { useUTC: true });
    const { offset } = getUTCOffset(now, timezoneObj);
    const formattedOffset = formatZonedTime(zonedTime, 'Z');

    return {
      name: tz,
      offset,
      formattedOffset,
    };
  })
  // Sort by the amount of UTC offset
  .sort((a, b) => a.offset - b.offset)
  // Remap list to UI-friendly/formatted list consumable by the Typeahead
  .map(tz => {
    return {
      value: tz.name,
      label: `(UTC${tz.offset !== 0 ? tz.formattedOffset : ''}) ${tz.name.replace(/_/g, ' ')}`,
    };
  });

timeZoneOptions.unshift(UTC_OPTION);

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
