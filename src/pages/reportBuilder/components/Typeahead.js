import React, { useCallback, useState, useMemo } from 'react';
import { ComboBoxTypeahead } from 'src/components/typeahead/AsyncComboBoxTypeahead';
import { METRICS_API_LIMIT } from 'src/constants';
import sortMatch from 'src/helpers/sortMatch';
import { useSparkPostQuery } from 'src/hooks';

function getItemToStr({ filterType, item }) {
  if (filterType === 'Subaccount') {
    return item.id;
  }

  return item.value;
}

function Typeahead(props) {
  const {
    id,
    setFilterValues,
    index,
    lookaheadRequest,
    lookaheadOptions = {},
    selector,
    value,
    itemToString,
    groupingIndex,
    filterIndex,
    filterType,
    ...rest
  } = props;
  const [inputValue, setInputValue] = useState('');

  const { data, status } = useSparkPostQuery(
    () =>
      lookaheadRequest({
        ...lookaheadOptions,
        match: inputValue,
        limit: METRICS_API_LIMIT,
      }),
    { enabled: inputValue && inputValue.length >= 3 },
  );
  const results = selector(data);

  const onFilterChange = useCallback(
    newValues => {
      setFilterValues({ groupingIndex, filterIndex, values: newValues });
    },
    [groupingIndex, filterIndex, setFilterValues],
  );

  const filteredResults = useMemo(() => {
    return sortMatch(results, inputValue, a => a.value);
  }, [inputValue, results]);

  return (
    <ComboBoxTypeahead
      id={id}
      onChange={onFilterChange}
      onInputChange={setInputValue}
      itemToString={item => (item ? getItemToStr({ filterType, item }) : '')}
      value={value}
      results={filteredResults}
      loading={status === 'loading'}
      {...rest}
    />
  );
}

export default Typeahead;
