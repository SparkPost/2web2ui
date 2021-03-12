import React, { useState, useEffect, useCallback } from 'react';
import { AccessTime } from '@sparkpost/matchbox-icons';
import { UTC_TYPEAHEAD_OPTION } from 'src/constants';
import { formatTimezonesToOptions } from 'src/helpers/date';
import { Typeahead } from './Typeahead';
import styles from './Typeahead.module.scss';

const TIMEZONE_OPTIONS = formatTimezonesToOptions();

export const TimezoneTypeahead = props => {
  const {
    initialValue,
    options = TIMEZONE_OPTIONS,
    onChange: parentOnChange,
    isForcedUTC,
    disabledAndUTCOnly,
    ...rest
  } = props;
  const [selected, setSelected] = useState(options[0]);

  const findOptionInList = useCallback(value => options.find(option => option.value === value), [
    options,
  ]);

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
    results: options,
    selectedItem: selected,
    onChange: onChange,
    maxNumberOfResults: options.length,
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
