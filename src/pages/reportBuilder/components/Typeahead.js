import React, { useCallback, useState, useMemo } from 'react';
import { ComboBoxTypeahead } from 'src/components/typeahead/AsyncComboBoxTypeahead';
import { METRICS_API_LIMIT } from 'src/constants';
import sortMatch from 'src/helpers/sortMatch';
import { useSparkPostQuery } from 'src/hooks';

function Typeahead(props) {
  const {
    id,
    setFilterValues,
    index,
    lookaheadRequest,
    lookaheadOptions = {},
    selector,
    value,
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
        staleTime: 1000 * 30, // 30 seconds
      }),
    { enabled: Boolean(inputValue && inputValue.length >= 3), refetchOnWindowFocus: false },
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
      value={value}
      results={filteredResults}
      loading={status === 'loading'}
      customItemHelpText="Add Filter"
      {...rest}
    />
  );
}

export default Typeahead;
