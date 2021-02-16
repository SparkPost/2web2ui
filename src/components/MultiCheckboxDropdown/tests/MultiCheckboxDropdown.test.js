import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { render } from '@testing-library/react';
import MultiCheckboxDropdown, { useMultiCheckbox } from '../MultiCheckboxDropdown';
import TestApp from 'src/__testHelpers__/TestApp';

describe('useMultiCheckbox', () => {
  const defaultProps = {
    checkboxes: [
      { name: 'checkbox1', label: 'Checkbox 1' },
      { name: 'checkbox2', label: 'Checkbox 2' },
    ],
  };

  const findSelectAllCheckbox = checkboxes => checkboxes.find(({ name }) => name === 'selectAll');
  const subject = (props = {}) => renderHook(() => useMultiCheckbox({ ...defaultProps, ...props }));
  const hookReturn = subject => subject.result.current;

  it('provides default values for the checkbox', () => {
    const hook = subject();
    const { checkboxes, values } = hookReturn(hook);
    expect(checkboxes.length).toEqual(3);
    expect(values.length).toEqual(0);
  });

  it('provides all values if empty and allowEmpty is false', () => {
    const hook = subject({ allowEmpty: false });
    const { checkboxes, values } = hookReturn(hook);
    expect(checkboxes.length).toEqual(3);
    expect(values.length).toEqual(2);
  });

  it('omits selectAll checkbox if "allowSelectAll" set to false', () => {
    const hook = subject({ allowSelectAll: false });
    const { checkboxes } = hookReturn(hook);
    expect(checkboxes.length).toEqual(2);
    expect(findSelectAllCheckbox(checkboxes)).toEqual(undefined);
  });

  it('checks all if selectAll works', () => {
    const hook = subject();
    const { checkboxes, values } = hookReturn(hook);
    expect(checkboxes.length).toEqual(3);
    expect(findSelectAllCheckbox(checkboxes).isChecked).toEqual(false);
    expect(values.length).toEqual(0);

    //Hits select all
    act(() => {
      findSelectAllCheckbox(checkboxes).onChange({ target: { name: 'selectAll' } });
    });
    expect(hook.result.current.values.length).toEqual(2);
    expect(findSelectAllCheckbox(hook.result.current.checkboxes).isChecked).toEqual(true);

    //Hits another checkbox while select all enabled
    act(() => {
      checkboxes[1].onChange({ target: { name: 'checkbox1' } });
    });
    expect(hook.result.current.values.length).toEqual(1);
    expect(findSelectAllCheckbox(hook.result.current.checkboxes).isChecked).toEqual(false);

    //hits same checkbox while select all unchecked
    act(() => {
      checkboxes[1].onChange({ target: { name: 'checkbox1' } });
    });
    expect(hook.result.current.values.length).toEqual(2);
    expect(findSelectAllCheckbox(hook.result.current.checkboxes).isChecked).toEqual(true);
  });
});

describe('MultiCheckboxDropdown', () => {
  const defaultProps = {
    checkboxes: [
      { name: 'checkbox1', label: 'Checkbox 1', isChecked: false, onChange: jest.fn() },
      { name: 'checkbox2', label: 'Checkbox 2', isChecked: true, onChange: jest.fn() },
    ],
  };
  const subject = (props = {}) =>
    render(
      <TestApp>
        <MultiCheckboxDropdown {...defaultProps} {...props} />
      </TestApp>,
    );

  it('should open with a click', () => {
    const { queryByRole, queryAllByRole, queryByTestId } = subject();
    expect(queryAllByRole('checkbox')).toHaveLength(0);

    expect(queryByTestId('multi-checkbox-button-content').textContent).toEqual('Checkbox 2');

    queryByRole('button').click();
    expect(queryAllByRole('checkbox')[0].checked).toEqual(false);
    expect(queryAllByRole('checkbox')[1].checked).toEqual(true);
  });

  it('should say "All" if all values of checkboxes are checked', () => {
    const { queryByTestId } = subject({
      checkboxes: [
        { name: 'checkbox1', label: 'Checkbox 1', isChecked: true, onChange: jest.fn() },
        { name: 'checkbox2', label: 'Checkbox 2', isChecked: true, onChange: jest.fn() },
      ],
    });

    expect(queryByTestId('multi-checkbox-button-content').textContent).toEqual('All');
  });

  it('should say "None" if all values of checkboxes are not checked', () => {
    const { queryByTestId } = subject({
      checkboxes: [
        { name: 'checkbox1', label: 'Checkbox 1', isChecked: false, onChange: jest.fn() },
        { name: 'checkbox2', label: 'Checkbox 2', isChecked: false, onChange: jest.fn() },
      ],
    });

    expect(queryByTestId('multi-checkbox-button-content').textContent).toEqual('None');
  });

  it('should say "All" if all values of checkboxes are not checked and allowEmpty is false', () => {
    const { queryByTestId } = subject({
      checkboxes: [
        { name: 'checkbox1', label: 'Checkbox 1', isChecked: false, onChange: jest.fn() },
        { name: 'checkbox2', label: 'Checkbox 2', isChecked: false, onChange: jest.fn() },
      ],
      allowEmpty: false,
    });

    expect(queryByTestId('multi-checkbox-button-content').textContent).toEqual('All');
  });

  it('renders with passed in `screenReaderDirections` when the popover is open', () => {
    const { getByText, getByRole } = subject({ screenReaderDirections: 'Hello, world.' });

    getByRole('button').click();
    expect(getByText('Hello, world.')).toBeInTheDocument();
  });
});
