import React, { useCallback } from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDebouncedCallback } from 'use-debounce';
import TestApp from 'src/__testHelpers__/TestApp';
import TypeSelect from '../TypeSelect';

jest.mock('use-debounce');

describe('TypeSelect', () => {
  const subject = (props = {}) =>
    render(
      <TestApp isHibanaEnabled={true}>
        <TypeSelect
          id="test-type-select"
          label="Things"
          itemToString={item => item?.key}
          results={[
            { key: 'eleven', name: 'Eleven' },
            { key: 'mike-wheeler', name: 'Mike Wheeler' },
            { key: 'dustin-henderson', name: 'Dustin Henderson' },
          ]}
          {...props}
        />
      </TestApp>,
    );

  beforeEach(() => {
    // need to memoize with useCallback
    useDebouncedCallback.mockImplementation(fn => [useCallback(fn, [])]);
  });

  it('renders default placeholder', () => {
    const { queryByPlaceholderText } = subject();
    expect(queryByPlaceholderText('Type to search')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    const { queryByPlaceholderText } = subject({ placeholder: 'Type something awesome' });
    expect(queryByPlaceholderText('Type something awesome')).toBeInTheDocument();
  });

  it('renders an empty listbox', () => {
    const { getByRole, queryAllByRole } = subject({ results: [] });
    userEvent.click(getByRole('textbox')); // to focus
    expect(queryAllByRole('option')).toHaveLength(0);
  });

  it('renders all listbox options', () => {
    const { getAllByRole, getByRole } = subject();

    userEvent.click(getByRole('textbox')); // to focus

    const listboxItems = getAllByRole('option');

    expect(listboxItems).toHaveLength(3);
    expect(listboxItems[0]).toHaveTextContent('eleven');
    expect(listboxItems[1]).toHaveTextContent('mike-wheeler');
    expect(listboxItems[2]).toHaveTextContent('dustin-henderson');
  });

  it('renders custom items', () => {
    const { getAllByRole, getByRole } = subject({
      renderItem: item => <TypeSelect.Item label={item.name} meta={item.key} />,
    });

    userEvent.click(getByRole('textbox')); // to focus

    const listboxItems = getAllByRole('option');

    expect(listboxItems).toHaveLength(3);
    expect(listboxItems[0]).toHaveTextContent('Eleven');
    expect(listboxItems[0]).toHaveTextContent('eleven');
    expect(listboxItems[1]).toHaveTextContent('Mike Wheeler');
    expect(listboxItems[1]).toHaveTextContent('mike-wheeler');
    expect(listboxItems[2]).toHaveTextContent('Dustin Henderson');
    expect(listboxItems[2]).toHaveTextContent('dustin-henderson');
  });

  it('renders matching items', async () => {
    const { getAllByRole, getByRole } = subject();

    await userEvent.type(getByRole('textbox'), 'e');

    const listboxItems = getAllByRole('option');

    expect(listboxItems).toHaveLength(1);
    expect(listboxItems[0]).toHaveTextContent('eleven');
  });

  it('shows all items after blurring and refocusing', async () => {
    const { getAllByRole, getByRole } = subject();
    getByRole('textbox').focus();
    await userEvent.type(getByRole('textbox'), 'e');
    const listboxItems = getAllByRole('option');

    expect(listboxItems).toHaveLength(1);
    expect(listboxItems[0]).toHaveTextContent('eleven');
    fireEvent.blur(getByRole('textbox'));
    fireEvent.focus(getByRole('textbox'));

    expect(getAllByRole('option')).toHaveLength(3);
  });

  it('when disabled renders a disabled text field', async () => {
    const { getByRole } = subject({ disabled: true });
    expect(getByRole('textbox')).toHaveAttribute('disabled');
  });
});
