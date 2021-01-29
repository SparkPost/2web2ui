import React, { useCallback, useState, useMemo } from 'react';
import { ComboBoxTypeahead } from 'src/components/typeahead/AsyncComboBoxTypeahead';
import { METRICS_API_LIMIT } from 'src/constants';
import sortMatch from 'src/helpers/sortMatch';

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
    value,
    results = [],
    itemToString,
    groupingIndex,
    filterIndex,
    filterType,
    ...rest
  } = props;
  const [omitResults, setOmitResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const onFilterChange = useCallback(
    newValues => {
      setFilterValues({ groupingIndex, filterIndex, values: newValues });
    },
    [groupingIndex, filterIndex, setFilterValues],
  );

  const updateLookahead = useCallback(
    pattern => {
      setInputValue(pattern);
      if (!lookaheadRequest) return;

      if (!pattern || pattern.length <= 2) {
        setLoading(false);
        setOmitResults(true);
        return;
      }

      setOmitResults(false);
      setLoading(true);

      const options = {
        ...lookaheadOptions,
        match: pattern,
        limit: METRICS_API_LIMIT,
      };
      lookaheadRequest(options).then(() => {
        setLoading(false);
      });
    },
    [setLoading, setOmitResults, lookaheadRequest, setInputValue, lookaheadOptions],
  );

  const filteredResults = useMemo(() => {
    return sortMatch(results, inputValue, a => a.value);
  }, [inputValue, results]);

  return (
    <ComboBoxTypeahead
      id={id}
      onChange={onFilterChange}
      onInputChange={updateLookahead}
      itemToString={item => (item ? getItemToStr({ filterType, item }) : '')}
      value={value}
      results={omitResults ? [] : filteredResults}
      loading={loading}
      {...rest}
    />
  );
}

export default Typeahead;
