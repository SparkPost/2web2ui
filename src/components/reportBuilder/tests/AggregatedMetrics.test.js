import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApp } from 'src/__testHelpers__';
import AggregatedMetrics from '../AggregatedMetrics';

const AGGREGATE_DATA = [
  {
    label: 'Sent',
    value: 1729842,
    key: 'count_sent',
    unit: 'number',
  },
  {
    label: 'Unique Confirmed Opens',
    value: 585900,
    key: 'count_unique_confirmed_opened_approx',
    unit: 'number',
  },
  {
    label: 'Accepted',
    value: 1560565,
    key: 'count_accepted',
    unit: 'number',
  },
  {
    label: 'Bounces',
    value: 169234,
    key: 'count_bounce',
    unit: 'number',
  },
];

const DEFAULT_PROCESSED_METRICS = [
  {
    key: 'count_sent',
    label: 'Sent',
    type: 'total',
    category: 'Delivery',
    unit: 'number',
    description:
      'Number of emails that were attempted to be delivered. Includes Deliveries and Bounces.',
    inSummary: true,
    name: 'count_sent',
    stroke: '#1273e6',
  },
  {
    key: 'count_unique_confirmed_opened_approx',
    label: 'Unique Confirmed Opens',
    type: 'total',
    category: 'Engagement',
    unit: 'number',
    description:
      'Number of emails that were displayed or had at a link clicked. Approximated with a 5% error threshold.',
    inSummary: true,
    isUniquePerTimePeriod: true,
    name: 'count_unique_confirmed_opened_approx',
    stroke: '#13bebf',
  },
  {
    key: 'count_accepted',
    label: 'Accepted',
    type: 'total',
    category: 'Delivery',
    unit: 'number',
    description: "Number of emails delivered that didn't subsequently bounce (Out-of-Band).",
    inSummary: true,
    name: 'count_accepted',
    stroke: '#7122e3',
  },
  {
    key: 'count_bounce',
    label: 'Bounces',
    type: 'total',
    category: 'Delivery',
    unit: 'number',
    description:
      'Number of bounced emails, not including Admin Bounces. Includes all In-Band and Out-of-Band Bounces.',
    inSummary: true,
    tab: 'bounce',
    name: 'count_bounce',
    stroke: '#f0549a',
  },
];

const DEFAULT_DATE = 'Feb 22nd - Mar 1st, 2021';

const subject = props =>
  render(
    <TestApp store={{ summaryChart: { aggregateData: AGGREGATE_DATA } }}>
      <AggregatedMetrics
        date={DEFAULT_DATE}
        processedMetrics={DEFAULT_PROCESSED_METRICS}
        showFiltersButton={true}
        handleViewFiltersClick={() => jest.fn()}
        {...props}
      />
    </TestApp>,
  );

describe('AggregatedMetrics', () => {
  it('renders with the passed in date', () => {
    subject();

    expect(screen.getByText(DEFAULT_DATE)).toBeInTheDocument();
  });

  it('renders the aggregated data from the Redux store', () => {
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
    subject({ showFiltersButton: false });

    expect(screen.queryByRole('button', { name: 'View Filters' })).not.toBeInTheDocument();

    subject({ showFiltersButton: true });

    expect(screen.getByRole('button', { name: 'View Filters' })).toBeInTheDocument();
  });

  it('invokes the passed in `handleViewFiltersClick` when the "View Filters" button is clicked', () => {
    const mockHandleViewFiltersClick = jest.fn();
    subject({ handleViewFiltersClick: mockHandleViewFiltersClick });
    const viewFiltersButton = screen.getByRole('button', { name: 'View Filters' });

    userEvent.click(viewFiltersButton);
    expect(mockHandleViewFiltersClick).toHaveBeenCalled();
  });
});
