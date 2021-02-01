import React, { useState, useEffect } from 'react';
import { ComboBox, ComboBoxTextField, ComboBoxMenu } from 'src/components/matchbox';
import Downshift from 'downshift';
import PropTypes from 'prop-types';
import { useDebouncedCallback } from 'use-debounce';
import { LoadingSVG } from 'src/components';

const Loading = () => <LoadingSVG size="XSmall" />;

export const ComboBoxTypeahead = ({
  disabled,
  error,
  helpText,
  isExclusiveItem,
  itemToString,
  label,
  name,
  onChange,
  placeholder,
  readOnly,
  results,
  value,
  id,
  onInputChange,
  loading,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [selectedItems, setSelectedItems] = useState(value);

  // Updated list of selected menu items when combo box is being controlled
  // note, state must be initialized with defaultSelected to avoid a runaway effect
  useEffect(() => {
    setSelectedItems(value);
  }, [setSelectedItems, value]);

  // Report change to selected items (important for redux-form Fields)
  useEffect(() => {
    onChange(selectedItems);
  }, [onChange, selectedItems]);

  useEffect(() => {
    onInputChange(debouncedValue);
  }, [onInputChange, debouncedValue]);
  const [debounceInputChange] = useDebouncedCallback(setDebouncedValue, 500);

  useEffect(() => {
    debounceInputChange(inputValue);
  }, [debounceInputChange, inputValue]);

  const isSelectedItem = item =>
    selectedItems.some(selectedItem => {
      return selectedItem.value === item.value;
    });

  // Must use state reducer to avoid menu automatically closing
  // see, https://github.com/downshift-js/downshift#statechangetypes
  const stateReducer = (state, changes) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.clickItem:
      case Downshift.stateChangeTypes.keyDownEnter: {
        setSelectedItems([...selectedItems, changes.selectedItem]);
        setInputValue(''); // unset below won't trigger a changeInput action
        setDebouncedValue('');
        return {
          ...changes,
          inputValue: '', // unset input value, now that it has been saved in selected items
          isOpen: true, // leave menu open
          selectedItem: null,
        };
      }
      case Downshift.stateChangeTypes.changeInput:
        setInputValue(changes.inputValue);
        return changes;
      default:
        return changes;
    }
  };

  const typeaheadfn = ({
    getInputProps,
    getItemProps,
    getMenuProps,
    getRootProps,
    highlightedIndex,
    inputValue,
    isOpen,
    openMenu,
  }) => {
    const hasSelectedItems = Boolean(selectedItems.length);
    const isSelectedItemExclusive = isExclusiveItem(selectedItems[0]);

    const isMenuOpen = isOpen && Boolean(debouncedValue);
    const items = results
      .filter(
        item =>
          !isSelectedItemExclusive &&
          !isSelectedItem(item) &&
          !(hasSelectedItems && isExclusiveItem(item)),
      )
      .map((item, index) =>
        getItemProps({
          content: itemToString(item),
          highlighted: highlightedIndex === index,
          index,
          item,
        }),
      );

    const inputProps = getInputProps({
      disabled,
      error: error && !isOpen ? error : undefined,
      helpText,
      id: name,
      itemToString,
      label,
      onFocus: () => {
        openMenu();
      },
      placeholder: hasSelectedItems ? '' : placeholder,
      readOnly: readOnly || isSelectedItemExclusive,
      removeItem: itemToRemove => {
        const mappedItemToRemove = itemToRemove;
        const nextSelectedItems = selectedItems.filter(
          selectedItem => selectedItem !== mappedItemToRemove,
        );
        setSelectedItems(nextSelectedItems);
      },
      selectedItems,
      value: inputValue || '',
    });

    return (
      <ComboBox {...getRootProps({ refKey: 'rootRef' })}>
        <ComboBoxTextField {...inputProps} id={id} />
        <ComboBoxMenu
          {...getMenuProps({ items, isOpen: isMenuOpen, refKey: 'menuRef' })}
          emptyMessage={loading ? <Loading /> : undefined}
        />
      </ComboBox>
    );
  };

  return (
    <Downshift
      defaultHighlightedIndex={0}
      itemToString={itemToString}
      stateReducer={stateReducer}
      onInputValueChange={debounceInputChange}
    >
      {typeaheadfn}
    </Downshift>
  );
};

ComboBoxTypeahead.propTypes = {
  defaultSelected: PropTypes.array,
  disabled: PropTypes.bool,
  isExclusiveItem: PropTypes.func,
  itemToString: PropTypes.func,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  results: PropTypes.array,
};

ComboBoxTypeahead.defaultProps = {
  defaultSelected: [],
  isExclusiveItem: () => false,
  itemToString: item => item,
  maxNumberOfResults: 100,
  placeholder: '',
  results: [],
};
