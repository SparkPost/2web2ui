import React, { useEffect, useState, useMemo } from 'react';
import { METRICS_API_LIMIT } from 'src/constants';
import sortMatch from 'src/helpers/sortMatch';
import { useDebouncedCallback } from 'use-debounce';

import Downshift from 'downshift';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { KeyboardArrowDown, KeyboardArrowUp } from '@sparkpost/matchbox-icons';
import { ActionList, Box, Inline, TextField } from 'src/components/matchbox';
import { LoadingSVG } from 'src/components';
import { useSparkPostQuery } from 'src/hooks';

const Loading = () => <LoadingSVG size="XSmall" />;

const PopoverActionList = styled(ActionList)`
  background: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.gray['400']};
  box-shadow: ${props => props.theme.shadows['200']};
  left: 0;
  margin-top: 4px;
  max-height: 20rem;
  opacity: ${props => (props.open ? 1 : 0)};
  overflow-y: scroll;
  pointer-events: ${props => (props.open ? 'auto' : 'none')};
  visibility: ${props => (props.open ? 'visible' : 'hidden')};
  position: absolute;
  right: 0;
  top: 100%;
  transition: opacity ${props => props.theme.motion.duration['fast']} ease-out;
  z-index: ${props => props.theme.zIndices['overlay'] + 1};
`;

const TypeaheadWrapper = styled.div`
  margin: 0 0 1rem;
  position: relative;
  &:last-child {
    margin-bottom: 0;
  }
`;

function TypeSelect({
  disabled,
  helpText,
  id,
  itemToString,
  label,
  maxHeight,
  maxWidth,
  onChange,
  placeholder,
  renderItem,
  results,
  selectedItem,
  onInputChange,
  loading,
  suffix,
  labelHidden,
}) {
  const [matches, setMatches] = useState([]);
  // Controlled input so that we can change the value after selecting dropdown.
  const [inputValue, setInputValue] = useState(selectedItem ? itemToString(selectedItem) : '');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [debounceInputChange] = useDebouncedCallback(setDebouncedValue, 300);

  useEffect(() => {
    onInputChange(debouncedValue);
  }, [onInputChange, debouncedValue]);

  useEffect(() => {
    setMatches(results);
  }, [results]);

  useEffect(() => {
    debounceInputChange(inputValue);
  }, [debounceInputChange, inputValue]);

  const handleStateChange = (changes, downshift) => {
    // Highlights first item in list by default
    if (!downshift.highlightedIndex) {
      downshift.setHighlightedIndex(0);
    }
  };

  useEffect(() => {
    if (selectedItem) {
      const selectedValue = itemToString(selectedItem);
      if (selectedValue !== inputValue) {
        setInputValue(selectedValue);
      }
    } else if (selectedItem === null) {
      setInputValue('');
    }
    // eslint-disable-next-line
  }, [selectedItem]);

  const typeaheadFn = ({
    getInputProps,
    getItemProps,
    getMenuProps,
    highlightedIndex,
    isOpen,
    selectedItem,
  }) => {
    const textFieldConfig = {
      disabled,
      label,
      labelHidden,
      placeholder,
      helpText,
      onBlur: () => {
        setInputValue(itemToString(selectedItem));
      },
      onFocus: event => {
        event.target.select();
      },
    };

    const isMenuOpen = isOpen && Boolean(debouncedValue);
    const textFieldProps = getInputProps(textFieldConfig);
    textFieldProps['data-lpignore'] = true;

    const SuffixIcon = isOpen ? KeyboardArrowUp : KeyboardArrowDown;

    return (
      <div>
        <TypeaheadWrapper>
          <Box maxWidth={maxWidth} position="relative">
            {/* hack, can't apply getMenuProps to ActionList because ref prop is not supported */}
            <div {...getMenuProps()}>
              <PopoverActionList open={isMenuOpen} maxHeight={maxHeight}>
                {loading ? (
                  <Box ml="200">
                    <Loading />
                  </Box>
                ) : (
                  <>
                    {matches.length ? (
                      matches.map((item, index) => (
                        <ActionList.Action
                          {...getItemProps({
                            highlighted: highlightedIndex === index,
                            index,
                            item,
                            key: `${id}_item_${index}`,
                          })}
                        >
                          {renderItem ? (
                            renderItem(item)
                          ) : (
                            <TypeaheadItem label={itemToString(item)} />
                          )}
                        </ActionList.Action>
                      ))
                    ) : (
                      <Box p="200">No Results</Box>
                    )}
                    {}
                  </>
                )}
              </PopoverActionList>
            </div>
            <TextField
              suffix={suffix !== undefined ? suffix : <SuffixIcon color="blue.700" size={25} />}
              {...textFieldProps}
            />
          </Box>
        </TypeaheadWrapper>
      </div>
    );
  };

  return (
    <Downshift
      id={id}
      inputValue={inputValue}
      itemToString={itemToString}
      onChange={onChange}
      onInputValueChange={setInputValue}
      onStateChange={handleStateChange}
      selectedItem={selectedItem}
    >
      {typeaheadFn}
    </Downshift>
  );
}

TypeSelect.propTypes = {
  disabled: PropTypes.bool,
  id: PropTypes.string.isRequired,
  itemToString: PropTypes.func,
  label: PropTypes.string,
  maxHeight: PropTypes.number,
  maxNumberOfResults: PropTypes.number,
  maxWidth: PropTypes.number,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  renderItem: PropTypes.func,
  results: PropTypes.array,
};

TypeSelect.defaultProps = {
  disabled: false,
  itemToString: item => item,
  maxHeight: 300,
  maxNumberOfResults: 100,
  maxWidth: 1200,
  placeholder: 'Type to search',
  results: [],
};

function TypeaheadItem({ label }) {
  return <Inline as="span">{label}</Inline>;
}

TypeaheadItem.propTypes = {
  label: PropTypes.string.isRequired,
  meta: PropTypes.string,
};

function Typeahead({ id, onChange, lookaheadRequest, lookaheadOptions, selector, ...rest }) {
  const [inputValue, setInputValue] = useState('');

  const { data, status } = useSparkPostQuery(
    () =>
      lookaheadRequest({
        ...lookaheadOptions,
        match: inputValue,
        limit: METRICS_API_LIMIT,
      }),
    { enabled: inputValue && inputValue.length >= 3, refetchOnWindowFocus: false },
  );
  const results = selector(data);

  const filteredResults = useMemo(() => {
    return sortMatch(results, inputValue, a => a.value);
  }, [inputValue, results]);

  return (
    <TypeSelect
      id={id}
      onChange={onChange}
      onInputChange={setInputValue}
      itemToString={item => {
        return item ? item.value : '';
      }}
      loading={status === 'loading'}
      suffix={null}
      {...rest}
      results={filteredResults}
    />
  );
}

export default Typeahead;
