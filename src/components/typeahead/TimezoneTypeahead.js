import React, { useState, useEffect, useCallback } from 'react';
import { AccessTime } from '@sparkpost/matchbox-icons';
import { convertDateToTime, listTimeZones, findTimeZone, getUTCOffset } from 'timezone-support';
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

// Tried to move into global constants but broke a lot of unit tests
export const options = timeZones
  // Filter out non-standard timezones, inverse timezones (ETC/UTC-7 is equivalent to UTC+7)
  .filter(
    tz =>
      tz.indexOf('/') >= 0 &&
      tz.indexOf('Etc/') === -1 &&
      getUTCOffset(now, findTimeZone(tz)).offset !== 0,
  )
  .map(tz => {
    const offsetObj = getUTCOffset(now, findTimeZone(tz));

    return {
      name: tz,
      offset: offsetObj.offset,
    };
  })
  // Sort by amount of UTC offset
  .sort((a, b) => a.offset - b.offset)
  // Reformat the timezone label
  .map(tz => {
    const timeZone = findTimeZone(tz.name);
    const timeObj = convertDateToTime(now, timeZone);
    const formattedOffset = formatZonedTime(timeObj, 'Z');

    return {
      value: tz.name,
      label: `(UTC${tz.offset !== 0 ? formattedOffset : ''}) ${tz.name.replace(/_/g, ' ')}`,
    };
  });

options.unshift(UTC_OPTION);

export const TimezoneTypeahead = props => {
  const {
    initialValue,
    onChange: parentOnChange,
    isForcedUTC,
    disabledAndUTCOnly,
    ...rest
  } = props;
  const [selected, setSelected] = useState(options[0]);

  const findOptionInList = useCallback(value => options.find(option => option.value === value), []);

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
    results: options,
    selectedItem: selected,
    onChange: onChange,
    maxNumberOfResults: options.length,
    icon: AccessTime,
    ...rest,
  };

  if (disabledAndUTCOnly) {
    return <Typeahead {...typeaheadProps} selectedItem={UTC_OPTION} disabled />;
  }

  return <Typeahead {...typeaheadProps} canChange />;
};
