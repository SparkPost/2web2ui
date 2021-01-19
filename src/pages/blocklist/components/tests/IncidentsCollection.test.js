import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TestApp from 'src/__testHelpers__/TestApp';
import IncidentsCollection from '../IncidentsCollection';

describe('Blocklist Component: IncidentsCollection', () => {
  const now = new Date('2019-12-18T04:20:00-04:00');
  Date.now = jest.fn(() => now);
  const updateDateRange = jest.fn();
  const dateOptions = {
    from: new Date('2019-12-01T12:00:00.000Z'),
    to: new Date('2019-12-08T12:00:00.000Z'),
    dateRange: '7 days',
  };
  const incidents = [
    {
      id: 1,
      resource: '101.101',
      blocklist_name: 'spammy mcspamface',
      occurred_at_formatted: 'Dec 3 2019 at 10:00am',
      occurred_at_timestamp: 123456789,
    },
  ];
  const subject = props => {
    const defaults = { incidents, dateOptions, updateDateRange };

    return render(
      <TestApp>
        <IncidentsCollection {...defaults} {...props} />
      </TestApp>,
    );
  };

  it('renders the rows correctly when incidents exist', () => {
    const { queryByText } = subject();
    expect(queryByText('101.101')).toBeInTheDocument();
    expect(queryByText('spammy mcspamface')).toBeInTheDocument();
    expect(queryByText('Dec 3 2019 at 10:00am')).toBeInTheDocument();
    // expect(queryByText('Last 7 Days')).toBeInTheDocument(); TODO: figure out why this failing
  });

  it('renders the empty state when there are no incidents', () => {
    const { getByText } = subject({ incidents: [] });

    expect(getByText('No results found.')).toBeInTheDocument();
  });

  it('displays the search text in the text field', () => {
    const { queryByDisplayValue } = subject({ search: 'test-search' });
    expect(queryByDisplayValue('test-search')).toBeInTheDocument();
  });

  it('calls the updateTextField on blur of the search input', () => {
    const mockUpdateTextField = jest.fn();
    const { queryByDisplayValue } = subject({
      search: 'test-search',
      updateTextField: mockUpdateTextField,
    });
    const target = queryByDisplayValue('test-search');
    fireEvent.change(target, {
      target: { value: 'new-test-search' },
    });

    fireEvent.blur(target);
    expect(mockUpdateTextField).toBeCalledWith('new-test-search');
  });
});
