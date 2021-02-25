import React from 'react';
import { render, screen, within } from '@testing-library/react';
import TestApp from 'src/__testHelpers__/TestApp';
import CompareByAggregatedRow from '../CompareByAggregatedRow';
import { useSparkPostQuery } from 'src/hooks';
jest.mock('src/hooks/api/useSparkPostQuery');

const METRICS_GRID_ID = 'metrics-grid';
const DEFAULT_PROPS = {
  comparison: {
    id: '141',
    type: 'Subaccount',
    value: 'Fake Subaccount Name (ID 141)',
  },
  reportOptions: {
    filters: [
      {
        AND: {
          subaccounts: { eq: [{ value: 'Raju Subaccount (ID 161)', id: 161, type: 'Subaccount' }] },
        },
      },
    ],
    comparisons: [
      { type: 'Subaccount', value: 'subby with key (ID 145)', id: '145' },
      { type: 'Subaccount', value: 'sub name (ID 141)', id: '141' },
    ],
    metrics: [
      'count_sent',
      'count_unique_confirmed_opened_approx',
      'count_accepted',
      'count_unique_clicked_approx',
    ],
    from: '2020-12-09T16:00:00.000Z',
    to: '2020-12-16T16:10:10.839Z',
    relativeRange: '7days',
    precision: 'hour',
    timezone: 'America/New_York',
    isReady: true,
  },
  hasDivider: false,
};

function renderSubject(props) {
  const portalRoot = document.createElement('div');
  portalRoot.setAttribute('id', 'tooltip-portal');
  document.body.appendChild(portalRoot);

  return render(
    <TestApp isHibanaEnabled={true}>
      <CompareByAggregatedRow {...DEFAULT_PROPS} {...props} />
    </TestApp>,
  );
}

// Mocks `useSparkPostQuery` to return different states and data
function mockQuery({ status, data }) {
  return useSparkPostQuery.mockReturnValue({
    status,
    data,
  });
}

describe('CompareByAggregatedRow', () => {
  it('renders returned aggregated data from the metrics deliverability API', () => {
    mockQuery({
      status: 'success',
      data: [
        {
          count_sent: 325000,
          count_unique_confirmed_opened_approx: 250000,
          count_accepted: 200000,
          count_unique_clicked_approx: 150000,
        },
      ],
    });
    renderSubject();

    expect(screen.getAllByText('Fake Subaccount Name (ID 141)').length).toEqual(2);

    const metricsGrid = screen.getByTestId(METRICS_GRID_ID);

    expect(within(metricsGrid).getByText('Sent')).toBeInTheDocument();
    expect(within(metricsGrid).getByText('325K')).toBeInTheDocument();
    expect(within(metricsGrid).getByText('Unique Confirmed Opens')).toBeInTheDocument();
    expect(within(metricsGrid).getByText('250K')).toBeInTheDocument();
    expect(within(metricsGrid).getByText('Accepted')).toBeInTheDocument();
    expect(within(metricsGrid).getByText('200K')).toBeInTheDocument();
    expect(within(metricsGrid).getByText('Unique Clicks')).toBeInTheDocument();
    expect(within(metricsGrid).getByText('150K')).toBeInTheDocument();
  });

  it('renders calculated aggregated data for metrics that are not returned directly by the API', () => {
    mockQuery({
      status: 'success',
      data: [
        {
          count_sent: 500,
          count_accepted: 250,
        },
      ],
    });

    renderSubject({ reportOptions: { metrics: ['accepted_rate'] } });

    const metricsGrid = screen.getByTestId(METRICS_GRID_ID);

    expect(within(metricsGrid).getByText('Accepted Rate')).toBeInTheDocument();
    expect(within(metricsGrid).getByText('50%')).toBeInTheDocument();
  });

  it('does not render aggregated metrics when there are no active metrics available via `reportOptions`', () => {
    mockQuery({
      status: 'success',
      data: [],
    });
    renderSubject({ reportOptions: { metrics: [] } });

    expect(screen.getAllByText('Fake Subaccount Name (ID 141)').length).toEqual(2);
    expect(screen.queryByTestId(METRICS_GRID_ID)).not.toBeInTheDocument();
  });

  it('renders nothing when the deliverability request throws an error', () => {
    mockQuery({ status: 'error' });
    renderSubject();

    expect(screen.queryByText('Fake Subaccount Name (ID 141)')).not.toBeInTheDocument();
  });

  it('renders nothing when the deliverability request is loading', () => {
    mockQuery({ status: 'loading' });
    renderSubject();

    expect(screen.queryByText('Fake Subaccount Name (ID 141)')).not.toBeInTheDocument();
  });

  it('renders with an <hr> element when `hasDivider` is `true`', () => {
    mockQuery({
      status: 'success',
      data: [
        {
          count_sent: 325000,
          count_unique_confirmed_opened_approx: 250000,
          count_accepted: 200000,
          count_unique_clicked_approx: 150000,
        },
      ],
    });
    renderSubject({ hasDivider: true });

    const divider = document.querySelector('hr');

    expect(divider).toBeInTheDocument();
  });

  it('does not render with an <hr> element when `hasDivider` is false', () => {
    mockQuery({
      status: 'success',
      data: [
        {
          count_sent: 325000,
          count_unique_confirmed_opened_approx: 250000,
          count_accepted: 200000,
          count_unique_clicked_approx: 150000,
        },
      ],
    });
    renderSubject({ hasDivider: false });

    const divider = document.querySelector('hr');

    expect(divider).not.toBeInTheDocument();
  });
});
