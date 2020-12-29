import React, { useState } from 'react';
import { Search } from '@sparkpost/matchbox-icons';
import {
  Box,
  Checkbox,
  Popover,
  TextField,
  ScreenReaderOnly,
  Label,
  ListBox,
} from 'src/components/matchbox';
import { useUniqueId } from 'src/hooks';
import Divider from 'src/components/divider';
import {
  StyledFilterFields,
  StatusPopoverContent,
  AlignedTextButton,
  AlignedButtonIcon,
  Chevron,
} from './styles';

function getAllSelectedState(checkboxes) {
  const checkboxesWithoutSelectAll = checkboxes
    .map(checkbox => (checkbox.name !== 'selectAll' ? checkbox : undefined))
    .filter(Boolean); // get rid of selectAll

  const allSelected =
    checkboxesWithoutSelectAll.map(checkbox => checkbox.isChecked).filter(Boolean)?.length ===
    checkboxesWithoutSelectAll?.length;

  return allSelected;
}

export function reducer(state, action) {
  switch (action.type) {
    case 'DOMAIN_FILTER_CHANGE': {
      return {
        ...state,
        domainName: action.value,
      };
    }

    case 'TOGGLE': {
      const isChecked = state.checkboxes.find(filter => filter.name === action.name).isChecked;

      if (action.name === 'selectAll' && !isChecked) {
        /* if Select All is Checked then all checkboxes should be checked */
        return {
          ...state,
          checkboxes: state.checkboxes.map(filter => {
            return {
              ...filter,
              isChecked: true,
            };
          }),
        };
      }

      let mappedCheckboxes = state.checkboxes.map(checkbox => {
        if (checkbox.name === action.name) {
          return {
            ...checkbox,
            isChecked: !isChecked,
          };
        }
        return checkbox;
      });

      // Post Toggle of the individual checkbox - check to see if we need selectAll turned on
      const allSelected = getAllSelectedState(mappedCheckboxes);

      // Force select all state here...
      mappedCheckboxes = mappedCheckboxes.map(checkbox => {
        if (checkbox.name === 'selectAll') {
          checkbox.isChecked = allSelected;
        }

        return checkbox;
      });

      return {
        ...state,
        // Return the relevant checked box and update its checked state,
        // otherwise, return any other checkbox.
        checkboxes: mappedCheckboxes,
      };
    }

    case 'LOAD': {
      let checkboxes = state.checkboxes.map(checkbox => {
        const isChecked = action.names.indexOf(checkbox.name) >= 0;
        return {
          ...checkbox,
          isChecked: isChecked,
        };
      });

      const allSelected = getAllSelectedState(checkboxes);
      checkboxes = checkboxes.map(checkbox => {
        if (checkbox.name === 'selectAll') {
          return {
            ...checkbox,
            isChecked: allSelected,
          };
        }

        return checkbox;
      });

      return {
        ...state,
        domainName: action.domainName,
        checkboxes,
      };
    }

    case 'RESET':
      return action.state;

    default:
      throw new Error(`${action.type} is not supported.`);
  }
}

function DomainField({ onChange, value, disabled, placeholder = '' }) {
  const uniqueId = useUniqueId('domains-name-filter');

  return (
    <TextField
      mb="400"
      id={uniqueId}
      maxWidth="inherit"
      label="Filter Domains"
      prefix={<Search />}
      onChange={onChange}
      value={value || ''}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}

function SortSelect({ options, onChange, disabled }) {
  const uniqueId = useUniqueId('domains-sort-select');

  return (
    <div>
      <ListBox
        id={uniqueId}
        label="Sort By"
        onChange={onChange}
        disabled={disabled}
        defaultValue={options[0].value}
      >
        {options.map((option, i) => {
          return (
            <ListBox.Option key={i} value={option.value}>
              {option.label}
            </ListBox.Option>
          );
        })}
      </ListBox>
    </div>
  );
}

function StatusPopover({ checkboxes, onCheckboxChange, disabled, domainType }) {
  const uniqueId = useUniqueId('domains-status-filter');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const checkedCheckboxes = checkboxes.filter(checkbox => checkbox.isChecked);
  const hasCheckedCheckboxes = checkedCheckboxes?.length > 0;
  const allCheckboxesChecked = checkboxes.length === checkedCheckboxes?.length;

  const activeDomainStatusLabels = checkedCheckboxes
    .filter(checkbox => checkbox.name !== 'selectAll')
    .map(checkbox => {
      return checkbox.label;
    });

  const activeStatusLabels = activeDomainStatusLabels.join(', ');

  return (
    <Box mb="400">
      <Label label="Domain Status" />
      <Popover
        left
        id={uniqueId}
        as="div"
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
              {hasCheckedCheckboxes && !allCheckboxesChecked && activeStatusLabels}
            </StatusPopoverContent>

            <ScreenReaderOnly>Domain Status</ScreenReaderOnly>
            <AlignedButtonIcon as={Chevron} size={25} />
          </AlignedTextButton>
        }
      >
        <Box padding="300">
          <ScreenReaderOnly as="p">
            Checkboxes filter the table. When checked, table elements are visible, when unchecked
            they are hidden from the table.
          </ScreenReaderOnly>

          <Checkbox
            label="Select All"
            id="select-all"
            name="selectAll"
            onChange={onCheckboxChange}
            checked={checkboxes.find(filter => filter.name === 'selectAll').isChecked}
            disabled={allCheckboxesChecked}
          />
        </Box>
        <Divider />
        <Box padding="300">
          <Checkbox.Group label="Status Filters" labelHidden>
            {checkboxes
              .filter(filter => filter.name !== 'selectAll')
              .filter(checkbox => {
                if (domainType === 'bounce') return checkbox.name !== 'readyForBounce';
                return true;
              })
              .map((filter, index) => (
                <Checkbox
                  key={`${filter.name}-${index}`}
                  label={filter.label}
                  id={filter.name}
                  name={filter.name}
                  onChange={onCheckboxChange}
                  checked={filter.isChecked}
                />
              ))}
          </Checkbox.Group>
        </Box>
      </Popover>
    </Box>
  );
}

function TableFilters({ children }) {
  return <StyledFilterFields>{children}</StyledFilterFields>;
}

DomainField.dispayName = 'TableFilters.DomainField';
SortSelect.displayName = 'TableFilters.SortSelect';
StatusPopover.displayName = 'TableFilters.StatusPopover';
TableFilters.DomainField = DomainField;
TableFilters.SortSelect = SortSelect;
TableFilters.StatusPopover = StatusPopover;

export default TableFilters;
