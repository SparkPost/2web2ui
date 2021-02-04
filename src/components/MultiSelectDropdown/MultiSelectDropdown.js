import React, { useState, useReducer, useCallback, useMemo } from 'react';
import { Box, Label, Popover, Checkbox, ScreenReaderOnly } from 'src/components/matchbox';
import { StatusPopoverContent, AlignedTextButton, AlignedButtonIcon, Chevron } from './styles';
import Divider from 'src/components/divider';

const reducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE': {
      if (action.name === 'selectAll') {
        // Toggles select all
        const selectAllCheckboxState = state.checkboxes[0]?.isChecked; //Should be the first to even get this option
        return {
          ...state,
          checkboxes: state.checkboxes.map(checkbox => ({
            ...checkbox,
            isChecked: !selectAllCheckboxState,
          })),
        };
      } else {
        const selectAllCheckbox = state.checkboxes.filter(({ name }) => name === 'selectAll');
        const mainCheckboxes = state.checkboxes.filter(({ name }) => name !== 'selectAll');
        const targetCheckboxIndex = mainCheckboxes.findIndex(({ name }) => name === action.name);
        mainCheckboxes[targetCheckboxIndex].isChecked = !Boolean(
          mainCheckboxes[targetCheckboxIndex].isChecked,
        );

        if (selectAllCheckbox.length) {
          const allChecked = mainCheckboxes.every(({ isChecked }) => isChecked);
          selectAllCheckbox[0].isChecked = allChecked;
        }
        return {
          ...state,
          checkboxes: [...selectAllCheckbox, ...mainCheckboxes],
        };
      }
    }
    default:
      throw new Error('This is not a valid action for this reducer');
  }
};

/**
 * @name useMultiSelect
 * @description Attaches selectAll and click behavior for the checkboxes.
 */
export function useMultiSelect({ checkboxes, useSelectAll = true, allowEmpty = false }) {
  const [state, dispatch] = useReducer(reducer, {
    checkboxes: [
      ...(useSelectAll ? [{ name: 'selectAll', label: 'Select All', isChecked: false }] : []),
      ...checkboxes.map(checkbox => ({ ...checkbox, isChecked: false })),
    ],
  });

  const onChange = useCallback(
    e => {
      dispatch({ type: 'TOGGLE', name: e.target.name });
    },
    [dispatch],
  );

  const mappedCheckboxes = useMemo(
    () => state.checkboxes.map(checkbox => ({ ...checkbox, onChange })),
    [state.checkboxes, onChange],
  );
  const mainCheckboxes = state.checkboxes.filter(({ name }) => name !== 'selectAll');
  const checkedCheckboxes = mainCheckboxes.filter(({ isChecked }) => isChecked);

  const targetCheckboxes =
    !allowEmpty && checkedCheckboxes.length === 0 ? mainCheckboxes : checkedCheckboxes;

  return {
    checkboxes: mappedCheckboxes,
    values: targetCheckboxes.map(({ name }) => name),
  };
}

function MultiSelectDropdown({
  checkboxes,
  disabled,
  label = 'Options',
  id = 'multi-select-dropdown',
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const checkedCheckboxes = checkboxes.filter(checkbox => checkbox.isChecked);
  const hasCheckedCheckboxes = checkedCheckboxes?.length > 0;
  const allCheckboxesChecked = checkedCheckboxes?.length === checkboxes.length;

  const checkboxLabels = checkedCheckboxes
    .filter(({ name }) => name !== 'selectAll')
    .map(({ label }) => label)
    .join(', ');
  const selectAllCheckbox = checkboxes.find(({ name }) => name === 'selectAll');

  return (
    <Box mb="400">
      <Label label={label} />
      <Popover
        id={id}
        left
        as="div"
        width="100%"
        open={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        trigger={
          <AlignedTextButton
            outline
            fullWidth
            variant="monochrome"
            aria-expanded={isPopoverOpen}
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            disabled={disabled}
          >
            {/* This content is purely visual and is not exposed to screen readers, rather, "Domain Status" is always exposed for those users */}
            <StatusPopoverContent aria-hidden="true">
              {/* Render the checked filters that visually replace the button's content */}
              {!hasCheckedCheckboxes && 'None'}
              {hasCheckedCheckboxes && allCheckboxesChecked && 'All'}
              {hasCheckedCheckboxes && !allCheckboxesChecked && checkboxLabels}
            </StatusPopoverContent>

            <ScreenReaderOnly>{label}</ScreenReaderOnly>
            <AlignedButtonIcon as={Chevron} size={25} />
          </AlignedTextButton>
        }
      >
        {selectAllCheckbox && (
          <>
            <Box padding="300">
              <ScreenReaderOnly as="p">
                Checkboxes filter the table. When checked, table elements are visible, when
                unchecked they are hidden from the table.
              </ScreenReaderOnly>

              <Checkbox
                label="Select All"
                id="select-all"
                name="selectAll"
                onChange={selectAllCheckbox.onChange}
                checked={selectAllCheckbox.isChecked}
              />
            </Box>
            <Divider />
          </>
        )}

        <Box padding="300">
          <Checkbox.Group label="Filter Options" labelHidden>
            {checkboxes
              .filter(checkbox => checkbox.name !== 'selectAll') //Will remove this regardless
              .map((checkbox, index) => (
                <Checkbox
                  key={`${checkbox.name}-${index}`}
                  label={checkbox.label}
                  id={checkbox.name}
                  name={checkbox.name}
                  onChange={checkbox.onChange}
                  checked={checkbox.isChecked}
                />
              ))}
          </Checkbox.Group>
        </Box>
      </Popover>
    </Box>
  );
}

export default MultiSelectDropdown;
