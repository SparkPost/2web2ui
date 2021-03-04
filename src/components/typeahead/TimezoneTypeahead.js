import React, { useState, useEffect, useCallback } from 'react';
import { AccessTime } from '@sparkpost/matchbox-icons';
import { getTimeZoneOptions, UTC_TYPEAHEAD_OPTION } from 'src/helpers/date';
import { Typeahead } from './Typeahead';
import styles from './Typeahead.module.scss';

const timeZoneOptions = getTimeZoneOptions();

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
      setSelected(UTC_TYPEAHEAD_OPTION);
      parentOnChange(UTC_TYPEAHEAD_OPTION);
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
    return <Typeahead {...typeaheadProps} selectedItem={UTC_TYPEAHEAD_OPTION} disabled />;
  }

  return <Typeahead {...typeaheadProps} canChange />;
};

function Item({ label }) {
  return (
    <div className={styles.Item}>
      <span className={styles.Value}>{label}</span>
    </div>
  );
}
