import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApp } from 'src/__testHelpers__';
import AggregatedMetrics from '../AggregatedMetrics';
import { useSparkPostQuery } from 'src/hooks';
import { useIndustryBenchmark } from 'src/hooks/reportBuilder';
jest.mock('src/hooks/api/useSparkPostQuery');
jest.mock('src/hooks/reportBuilder');

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

function mockUseIndustryBenchmark({ data = [] } = {}) {
  return useIndustryBenchmark.mockReturnValue({ data });
}

const renderSubject = props =>
  render(
    <TestApp>
      <AggregatedMetrics {...DEFAULT_PROPS} handleViewFiltersClick={() => jest.fn()} {...props} />
    </TestApp>,
  );

describe('AggregatedMetrics', () => {
  it('renders with the passed in date', () => {
    mockQuery({ status: 'success' });
    mockUseIndustryBenchmark();
    renderSubject();

    expect(screen.getByText(DEFAULT_PROPS.date)).toBeInTheDocument();
  });

  it('renders the aggregated data returned from `useSparkPostQuery`', () => {
    mockQuery({ status: 'success' });
    mockUseIndustryBenchmark();
    renderSubject();

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
    mockUseIndustryBenchmark();
    renderSubject({ showFiltersButton: false });

    expect(screen.queryByRole('button', { name: 'View Filters' })).not.toBeInTheDocument();

    renderSubject({ showFiltersButton: true });

    expect(screen.getByRole('button', { name: 'View Filters' })).toBeInTheDocument();
  });

  it('invokes the passed in `handleViewFiltersClick` when the "View Filters" button is clicked', () => {
    const mockHandleViewFiltersClick = jest.fn();
    mockQuery({ status: 'success' });
    mockUseIndustryBenchmark();
    renderSubject({ handleViewFiltersClick: mockHandleViewFiltersClick, showFiltersButton: true });
    const viewFiltersButton = screen.getByRole('button', { name: 'View Filters' });

    userEvent.click(viewFiltersButton);
    expect(mockHandleViewFiltersClick).toHaveBeenCalled();
  });

  it('renders industry benchmark data when present', () => {
    const dataWithBenchmark = [
      {
        count_sent: 439696,
        count_accepted: 375629,
        count_bounce: 64067,
        count_inbox_panel: 1048,
        count_inbox_seed: 1358,
        count_spam_panel: 42,
        count_spam_seed: 164,
        count_unique_confirmed_opened_approx: 178662,
        inbox_folder_rate: 92.11332312404288,
      },
    ];
    const reportOptionsWithBenchmark = {
      industryBenchmarkMetric: 'inbox_folder_rate',
      industryBenchmarkFilters: {
        industryCategory: 'all',
        mailboxProvider: 'all',
      },
      metrics: [
        'count_sent',
        'count_accepted',
        'count_unique_confirmed_opened_approx',
        'count_bounce',
        'inbox_folder_rate',
      ],
    };
    mockQuery({ status: 'success', data: dataWithBenchmark });
    mockUseIndustryBenchmark({
      data: [
        {
          median: 0.9375,
          q25: 0.8148,
          q75: 0.9787,
          ts: '2021-03-04T00:00:00.000Z',
        },
        {
          median: 0.9375,
          q25: 0.8156,
          q75: 0.9787,
          ts: '2021-03-05T00:00:00.000Z',
        },
        {
          median: 0.9375,
          q25: 0.816,
          q75: 0.9787,
          ts: '2021-03-06T00:00:00.000Z',
        },
        {
          median: 0.9375,
          q25: 0.8162,
          q75: 0.9788,
          ts: '2021-03-07T00:00:00.000Z',
        },
        {
          median: 0.9375,
          q25: 0.8141,
          q75: 0.9787,
          ts: '2021-03-08T00:00:00.000Z',
        },
        {
          median: 0.9375,
          q25: 0.8137,
          q75: 0.9787,
          ts: '2021-03-09T00:00:00.000Z',
        },
      ],
    });
    renderSubject({ reportOptions: reportOptionsWithBenchmark });

    expect(screen.getByText('Inbox Folder Rate')).toBeInTheDocument();
    expect(screen.getByText('92.11%')).toBeInTheDocument();
    expect(screen.getByText('(81.51% - 97.87%)')).toBeInTheDocument();
  });
});
