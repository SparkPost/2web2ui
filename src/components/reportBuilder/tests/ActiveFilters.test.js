import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApp } from 'src/__testHelpers__';
import ActiveFilters from '../ActiveFilters';

const DEFAULT_FILTERS = [
  {
    AND: {
      sending_domains: {
        like: ['hello', 'there', 'friends'],
      },
      domains: {
        notLike: ['we', 'are', 'filters'],
      },
    },
  },
];

const subject = props =>
  render(
    <TestApp>
      <ActiveFilters filters={DEFAULT_FILTERS} handleFilterRemove={jest.fn} {...props} />
    </TestApp>,
  );

describe('ActiveFilters', () => {
  it('renders filter values to the DOM with remove buttons', () => {
    subject();

    // Sections
    expect(screen.getByTestId('active-filter-tags')).toBeInTheDocument();
    expect(screen.getAllByTestId('active-filter')).toHaveLength(2);

    // Types
    expect(screen.getByText(/Sending Domain/g)).toBeInTheDocument();
    expect(screen.getByText(/Recipient Domain/g)).toBeInTheDocument();

    // Brackets surrounding groups of filters
    expect(screen.getByText('[')).toBeInTheDocument();
    expect(screen.getByText('[')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText(']')).toBeInTheDocument();
    expect(screen.getByText(']')).toHaveAttribute('aria-hidden', 'true');

    // Values
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('there')).toBeInTheDocument();
    expect(screen.getByText('friends')).toBeInTheDocument();
    expect(screen.getByText('we')).toBeInTheDocument();
    expect(screen.getByText('are')).toBeInTheDocument();
    expect(screen.getByText('filters')).toBeInTheDocument();

    // One remove button for each tag
    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(6);
  });

  it('renders with "AND" when filters contain an "AND" group', () => {
    subject();

    expect(screen.getByText('AND')).toBeInTheDocument();
    expect(screen.queryByText('OR')).not.toBeInTheDocument();
  });

  it('renders with "OR" when filters contain an "OR" group', () => {
    subject({
      filters: [
        {
          OR: {
            sending_domains: {
              like: ['hello'],
            },
            domains: {
              notLike: ['hello'],
            },
          },
        },
      ],
    });

    expect(screen.getByText('OR')).toBeInTheDocument();
    expect(screen.queryByText('AND')).not.toBeInTheDocument();
  });

  it('renders with both "AND" and "OR" when filters contain both "AND" and "OR" groups', () => {
    subject({
      filters: [
        {
          OR: {
            sending_domains: {
              like: ['hello'],
            },
            domains: {
              notLike: ['hello'],
            },
          },
        },
        {
          AND: {
            sending_ips: {
              like: ['hello'],
            },
            domains: {
              notLike: ['hello'],
            },
          },
        },
      ],
    });

    expect(screen.getByText('OR')).toBeInTheDocument();
    expect(screen.getByText('AND')).toBeInTheDocument();
  });

  it('renders with "And" between groups when multiple groups are present', () => {
    subject({
      filters: [
        {
          OR: {
            sending_domains: {
              like: ['hello'],
            },
            domains: {
              notLike: ['hello'],
            },
          },
        },
        {
          AND: {
            sending_domains: {
              like: ['hello'],
            },
            domains: {
              notLike: ['hello'],
            },
          },
        },
      ],
    });

    expect(screen.getByText('And')).toBeInTheDocument();
  });

  it('does not render with an "And" when there is only one filter group', () => {
    subject();

    expect(screen.queryByText('And')).not.toBeInTheDocument();
  });

  it('invokes the passed in `handleFilterRemove` function when clicking on a dismiss button', () => {
    const mockRemove = jest.fn();
    subject({
      filters: [{ AND: { subaccounts: { like: ['subaccount'] } } }],
      handleFilterRemove: mockRemove,
    });
    const removeButton = screen.getByRole('button', { name: 'Remove' });

    userEvent.click(removeButton);
    expect(mockRemove).toHaveBeenCalled();
  });
});
