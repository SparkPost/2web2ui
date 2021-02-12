import React, { useState, useReducer, useCallback, useMemo } from 'react';
import { Box, Label, Popover, Checkbox, ScreenReaderOnly } from 'src/components/matchbox';
import { StatusPopoverContent, AlignedTextButton, AlignedButtonIcon, Chevron } from './styles';
import Divider from 'src/components/divider';

const reducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_ALL':
      const selectAllCheckboxState = state.checkboxes[0]?.isChecked; //Should be the first to even get this option
      const newCheckboxes = state.checkboxes.map(checkbox => ({
        ...checkbox,
        isChecked: !selectAllCheckboxState,
      }));
      return {
        ...state,
        checkboxes: newCheckboxes,
      };
    case 'TOGGLE': {
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
    default:
      throw new Error('This is not a valid action for this reducer');
  }
};

/**
 * @name useMultiSelect
 * @param {Array[Object]} checkboxes Array of checkboxes. Format is array of objects as { label: 'Checkbox Label', name: 'checkboxName' }
 * @param {Boolean} useSelectAll Attaches a checkbox at the top for selecting all checkboxes. Will retur
 * @param {Boolean} allowEmpty Turning off allowEmpty forces if all checkboxes are emtpy, all values are returned instead of an empty array
 * @description Attaches selectAll and click behavior for the checkboxes.
 */
export function useMultiSelect({ checkboxes, allowSelectAll = true, allowEmpty = true }) {
  const [state, dispatch] = useReducer(reducer, {
    checkboxes: [
      ...(allowSelectAll ? [{ name: 'selectAll', label: 'Select All', isChecked: false }] : []),
      ...checkboxes.map(checkbox => ({ ...checkbox, isChecked: false })),
    ],
  });

  const onChange = useCallback(
    e => {
      if (e.target.name === 'selectAll') {
        dispatch({ type: 'TOGGLE_ALL' });
      } else {
        dispatch({ type: 'TOGGLE', name: e.target.name });
      }
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
  allowEmpty = true,
  checkboxComponent,
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const CheckboxComponent = checkboxComponent ? checkboxComponent : Checkbox;

  const checkedCheckboxes = checkboxes.filter(checkbox => checkbox.isChecked);
  const hasCheckedCheckboxes = Boolean(checkedCheckboxes?.length > 0);
  const allCheckboxesChecked = Boolean(checkedCheckboxes?.length === checkboxes.length);

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
            <StatusPopoverContent aria-hidden="true">
              {/* Render the checked filters that visually replace the button's content */}
              {!hasCheckedCheckboxes && allowEmpty && 'None'}
              {((hasCheckedCheckboxes && allCheckboxesChecked) ||
                (!allowEmpty && !hasCheckedCheckboxes)) &&
                'All'}
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
              <CheckboxComponent
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
                <CheckboxComponent
                  key={`${checkbox.name}-${index}`}
                  label={checkbox.label}
                  id={checkbox.name}
                  name={checkbox.name}
                  onChange={checkbox.onChange}
                  disabled={checkbox.disabled}
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
