import React from 'react';
import { render, screen } from '@testing-library/react';
import ActiveMetrics from '../ActiveMetrics';
import getConfig from 'src/helpers/getConfig';
import { useReportBuilderContext } from 'src/pages/reportBuilder/context/ReportBuilderContext';
import TestApp from 'src/__testHelpers__/TestApp';

jest.mock('src/helpers/getConfig');
jest.mock('src/pages/reportBuilder/context/ReportBuilderContext', () => ({
  useReportBuilderContext: jest.fn(() => ({ state: { precision: '1min' } })),
}));

describe('Component: Report Builder ActiveMetrics', () => {
  beforeEach(() => {
    getConfig.mockReturnValue([
      {
        recommended: 60 * 4,
        min: 0,
        max: 60 * 12,
        value: '1min',
        format: 'ha',
        uniqueLabel: 'per minute',
      },
      {
        recommended: 60 * 24 * 10,
        min: 60 * 2,
        max: 60 * 24 * 30,
        value: 'hour',
        format: 'ha',
        uniqueLabel: 'per hour',
      },
      {
        recommended: Infinity,
        min: 60 * 24 * 30,
        max: Infinity,
        value: 'month',
        format: 'MMM YY',
        uniqueLabel: 'per day',
      },
    ]);
  });

  const subject = (props = {}, store = {}) => {
    const defaultProps = {
      metrics: [
        { name: 'count_a', label: 'A', stroke: '#aaa' },
        { name: 'count_b', label: 'B', stroke: '#bbb' },
        { name: 'count_c', label: 'C', stroke: '#ccc', isUniquePerTimePeriod: true },
      ],
    };

    return render(
      <TestApp store={store}>
        <ActiveMetrics {...defaultProps} {...props} />
      </TestApp>,
    );
  };

  it('should render using "per minute" labels for unique metrics for 1min precision', () => {
    subject({});
    expect(screen.queryByText('B per minute')).not.toBeInTheDocument();
    expect(screen.getByText('C per minute')).toBeInTheDocument();
  });

  it('should render using "per hour" labels for unique metrics for hour precision', () => {
    useReportBuilderContext.mockImplementationOnce(() => {
      return {
        state: {
          precision: 'hour',
        },
      };
    });
    subject();

    expect(screen.getByText('C per hour')).toBeInTheDocument();
  });

  it('should render using "per day" labels for unique metrics for month precision', () => {
    useReportBuilderContext.mockImplementationOnce(() => {
      return {
        state: {
          precision: 'month',
        },
      };
    });
    subject();

    expect(screen.getByText('C per day')).toBeInTheDocument();
  });
});
