import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApp } from 'src/__testHelpers__';
import { useSparkPostQuery } from 'src/hooks';
import { ChartGroups, Charts } from '../Charts';
jest.mock('src/hooks/api/useSparkPostQuery');

const CHART_SELECTOR = '.recharts-responsive-container';

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

const DEFAULT_COMPARISONS = [
  {
    type: 'domains',
    value: 'gmail.com',
  },
  {
    type: 'domains',
    value: 'yahoo.ca',
  },
];

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
            {...props}
          />
        </TestApp>,
      );

    it('renders the loading state when a request is idle', () => {
      mockQuery({ status: 'idle' });
      subject();

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

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

      expect(document.querySelector(CHART_SELECTOR)).toBeInTheDocument();

      // TODO: Once <ScreenReaderOnly /> tables are added to this component, add supporting tests to check for chart data
    });

    it('invokes the passed in `setActiveChart` function when hovering over the chart container', () => {
      const mockSetActiveChart = jest.fn();
      const chartId = 'my-id';
      mockQuery({
        status: 'success',
        data: TIME_SERIES_FIXTURE,
      });
      subject({ setActiveChart: mockSetActiveChart, id: chartId });
      const chartBox = screen.getByTestId('chart-box');

      userEvent.hover(chartBox);
      expect(mockSetActiveChart).toHaveBeenCalledWith(`${chartId}_chart_0`);
    });
  });

  describe('ChartGroups', () => {
    const subject = props =>
      render(
        <TestApp>
          <ChartGroups
            reportOptions={{
              comparisons: DEFAULT_COMPARISONS,
              metrics: DEFAULT_METRICS,
              filters: [],
            }}
            {...props}
          />
        </TestApp>,
      );

    it('renders a single chart if there are no active comparisons', () => {
      mockQuery({
        status: 'success',
        data: TIME_SERIES_FIXTURE,
      });
      subject({
        reportOptions: {
          metrics: DEFAULT_METRICS,
          comparisons: [],
        },
      });

      expect(document.querySelector(CHART_SELECTOR)).toBeInTheDocument();
    });

    it('renders a chart for each active comparison', () => {
      subject();

      expect(screen.getByRole('heading', { name: 'gmail.com' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'yahoo.ca' })).toBeInTheDocument();
      expect(document.querySelectorAll(CHART_SELECTOR)).toHaveLength(2);
    });
  });
});
