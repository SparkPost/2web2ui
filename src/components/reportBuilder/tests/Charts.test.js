import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApp } from 'src/__testHelpers__';
import { useSparkPostQuery } from 'src/hooks';
import { ChartGroups, Charts } from '../Charts';
jest.mock('src/hooks/api/useSparkPostQuery');

const TIME_SERIES_FIXTURE = [
  {
    count_sent: 10077,
    count_accepted: 9096,
    count_bounce: 980,
    ts: '2021-03-01T10:00:00-05:00',
    count_unique_confirmed_opened_approx: 3474,
  },
  {
    count_sent: 10034,
    count_accepted: 9083,
    count_bounce: 949,
    ts: '2021-03-01T11:00:00-05:00',
    count_unique_confirmed_opened_approx: 3257,
  },
  {
    count_sent: 109,
    count_accepted: 99,
    count_bounce: 10,
    ts: '2021-03-01T12:00:00-05:00',
    count_unique_confirmed_opened_approx: 44,
  },
];

const DEFAULT_METRICS = ['count_sent', 'count_accepted', 'count_bounce'];

function mockQuery({ status, data = [], refetch = jest.fn }) {
  return useSparkPostQuery.mockReturnValue({
    status,
    data,
    refetch,
  });
}

describe('Analytics Report chart components', () => {
  describe('Charts', () => {
    const subject = props =>
      render(
        <TestApp>
          <Charts
            reportOptions={{
              comparisons: [],
              metrics: DEFAULT_METRICS,
            }}
            id="my-mock-chart"
            activeChart=""
            setActiveChart={jest.fn}
            small={false}
            {...props}
          />
        </TestApp>,
      );

    it('renders the loading state when a request is pending', () => {
      mockQuery({ status: 'loading' });
      subject();

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders the error state when the time series request fails, allowing the user to retry the request', () => {
      const mockRefetch = jest.fn();
      mockQuery({ status: 'error', refetch: mockRefetch });
      subject();

      expect(screen.getByRole('heading', { name: 'Unable to load report' })).toBeInTheDocument();
      expect(screen.getByText('Please try again')).toBeInTheDocument();
      userEvent.click(screen.getByRole('button', { name: 'Try Again' }));
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('renders a chart with data returned from the time series endpoint', () => {
      mockQuery({
        status: 'success',
        data: TIME_SERIES_FIXTURE,
      });
      subject();
      screen.debug();
      expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument();

      // TODO: Once <ScreenReaderOnly /> tables are added to this component, add supporting tests to check for chart data
    });
  });

  describe('ChartGroups', () => {
    // eslint-disable-next-line
    const subject = props =>
      render(
        <TestApp>
          <ChartGroups small={false} reportOptions={{}} {...props} />
        </TestApp>,
      );
  });
});
