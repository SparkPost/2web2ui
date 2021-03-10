import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApp } from 'src/__testHelpers__';
import AggregatedMetrics from '../AggregatedMetrics';
import { useSparkPostQuery } from 'src/hooks';
jest.mock('src/hooks/api/useSparkPostQuery');

const DEFAULT_PROPS = {
  date: 'Mar 3rd - Mar 10th, 2021',
  reportOptions: {
    filters: [],
    comparisons: [],
    industryBenchmarkMetric: null,
    industryBenchmarkFilters: {
      industryCategory: 'all',
      mailboxProvider: 'all',
    },
    metrics: [
      'count_sent',
      'count_unique_confirmed_opened_approx',
      'count_accepted',
      'count_bounce',
    ],
    to: '2021-03-10T15:19:09.448Z',
    from: '2021-03-03T15:00:00.000Z',
    relativeRange: '7days',
    precision: 'hour',
    timezone: 'America/New_York',
  },
};

const AGGREGATE_DATA = [
  {
    count_sent: 1729842,
    count_accepted: 585900,
    count_bounce: 1560565,
    count_unique_confirmed_opened_approx: 169234,
  },
];

// Mocks `useSparkPostQuery` to return different states and data
function mockQuery({ status, data = AGGREGATE_DATA }) {
  return useSparkPostQuery.mockReturnValue({
    status,
    data,
  });
}

const subject = props =>
  render(
    <TestApp>
      <AggregatedMetrics {...DEFAULT_PROPS} handleViewFiltersClick={() => jest.fn()} {...props} />
    </TestApp>,
  );

describe('AggregatedMetrics', () => {
  it('renders with the passed in date', () => {
    mockQuery({ status: 'success' });
    subject();

    expect(screen.getByText(DEFAULT_PROPS.date)).toBeInTheDocument();
  });

  it('renders the aggregated data returned from `useSparkPostQuery`', () => {
    mockQuery({ status: 'success' });
    subject();

    expect(screen.getByText('Sent')).toBeInTheDocument();
    expect(screen.getByText('1.73M')).toBeInTheDocument();
    expect(screen.getByText('Unique Confirmed Opens')).toBeInTheDocument();
    expect(screen.getByText('585.9K')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('1.56M')).toBeInTheDocument();
    expect(screen.getByText('Bounces')).toBeInTheDocument();
    expect(screen.getByText('169.23K')).toBeInTheDocument();
  });

  it('conditionally renders the "View Filters" button according to the value of the `showFiltersButton`', () => {
    mockQuery({ status: 'success' });
    subject({ showFiltersButton: false });

    expect(screen.queryByRole('button', { name: 'View Filters' })).not.toBeInTheDocument();

    subject({ showFiltersButton: true });

    expect(screen.getByRole('button', { name: 'View Filters' })).toBeInTheDocument();
  });

  it('invokes the passed in `handleViewFiltersClick` when the "View Filters" button is clicked', () => {
    const mockHandleViewFiltersClick = jest.fn();
    mockQuery({ status: 'success' });
    subject({ handleViewFiltersClick: mockHandleViewFiltersClick, showFiltersButton: true });
    const viewFiltersButton = screen.getByRole('button', { name: 'View Filters' });

    userEvent.click(viewFiltersButton);
    expect(mockHandleViewFiltersClick).toHaveBeenCalled();
  });
});
