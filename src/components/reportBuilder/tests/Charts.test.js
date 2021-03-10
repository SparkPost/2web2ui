import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApp } from 'src/__testHelpers__';
import { useSparkPostQuery } from 'src/hooks';
import { ChartGroups, Charts } from '../Charts';
import { useIndustryBenchmark } from 'src/hooks/reportBuilder';
jest.mock('src/hooks/api/useSparkPostQuery');
jest.mock('src/hooks/reportBuilder/useIndustryBenchmark');
jest.mock(() => {
  return {
    IndustryBenchmarkModal: () => <>Mock Industry Benchmark Modal</>,
  };
});

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

function mockUseIndustryBenchmark({ data = [] } = {}) {
  return useIndustryBenchmark.mockReturnValue({
    data,
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
      mockUseIndustryBenchmark();
      subject();

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders the loading state when a request is pending', () => {
      mockQuery({ status: 'loading' });
      mockUseIndustryBenchmark();
      subject();

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders the error state when the time series request fails, allowing the user to retry the request', () => {
      const mockRefetch = jest.fn();
      mockQuery({ status: 'error', refetch: mockRefetch });
      mockUseIndustryBenchmark();
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
      mockUseIndustryBenchmark();
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
      mockUseIndustryBenchmark();
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
            showIndustryBenchmarkButton={false}
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
      mockUseIndustryBenchmark();
      subject({
        reportOptions: {
          metrics: DEFAULT_METRICS,
          comparisons: [],
        },
      });

      expect(document.querySelector(CHART_SELECTOR)).toBeInTheDocument();
    });

    it('renders multiple charts when a rate metric and count metric are active simultaneously', () => {
      mockQuery({
        status: 'success',
        data: [
          [
            {
              count_accepted: 217640,
              count_sent: 241518,
              ts: '2021-03-03T05:00:00+00:00',
              accepted_rate: 90.11336629153934,
            },
            {
              count_accepted: 217568,
              count_sent: 242110,
              ts: '2021-03-04T00:00:00+00:00',
              accepted_rate: 89.8632852835488,
            },
            {
              count_accepted: 217124,
              count_sent: 241160,
              ts: '2021-03-05T00:00:00+00:00',
              accepted_rate: 90.0331729971803,
            },
            {
              count_accepted: 218497,
              count_sent: 242698,
              ts: '2021-03-06T00:00:00+00:00',
              accepted_rate: 90.02834798803451,
            },
            {
              count_accepted: 217952,
              count_sent: 242334,
              ts: '2021-03-07T00:00:00+00:00',
              accepted_rate: 89.93867967350846,
            },
            {
              count_accepted: 218082,
              count_sent: 242216,
              ts: '2021-03-08T00:00:00+00:00',
              accepted_rate: 90.03616606665126,
            },
            {
              count_accepted: 217889,
              count_sent: 242228,
              ts: '2021-03-09T00:00:00+00:00',
              accepted_rate: 89.95202866720611,
            },
            {
              count_accepted: 165882,
              count_sent: 184430,
              ts: '2021-03-10T00:00:00+00:00',
              accepted_rate: 89.94306783061324,
            },
          ],
        ],
      });
      mockUseIndustryBenchmark();
      subject({
        reportOptions: {
          metrics: ['count_accepted', 'accepted_rate'],
          comparisons: [],
        },
      });

      expect(screen.getAllByTestId('chart-box')).toHaveLength(2);

      // y-axis labels
      expect(screen.getByText('Count')).toBeInTheDocument();
      expect(screen.getByText('Percent')).toBeInTheDocument();
    });

    it('renders with the "Industry Benchmark" button when `showIndustryBenchmarkButton` is `true` and when selected metrics include a valid industry benchmark metric', () => {
      mockQuery({
        status: 'success',
        data: [
          {
            count_inbox_panel: 0,
            count_inbox_seed: 0,
            count_spam_panel: 0,
            count_spam_seed: 0,
            ts: '2021-03-03T05:00:00+00:00',
          },
          {
            count_inbox_panel: 0,
            count_inbox_seed: 0,
            count_spam_panel: 0,
            count_spam_seed: 0,
            ts: '2021-03-04T00:00:00+00:00',
          },
        ],
      });
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
        ],
        industryCategory: 'all',
      });
      subject({
        showIndustryBenchmarkButton: true,
        reportOptions: {
          filters: [],
          comparisons: [],
          metrics: ['inbox_folder_rate'],
        },
      });

      expect(screen.getByRole('button', { name: 'Industry Benchmark' })).toBeInTheDocument();
      expect(screen.getByText('Mock Industry Benchmark Modal')).toBeInTheDocument();
    });

    it('renders a chart for each active comparison', () => {
      subject();

      expect(screen.getByRole('heading', { name: 'gmail.com' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'yahoo.ca' })).toBeInTheDocument();
      expect(document.querySelectorAll(CHART_SELECTOR)).toHaveLength(2);
    });
  });
});
