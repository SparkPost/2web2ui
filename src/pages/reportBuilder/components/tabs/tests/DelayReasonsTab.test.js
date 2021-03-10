import React from 'react';
import { render } from '@testing-library/react';
import { DelayReasonsTab } from '../DelayReasonsTab';
import TestApp from 'src/__testHelpers__/TestApp';
import { useReportBuilderContext } from 'src/pages/reportBuilder/context/ReportBuilderContext';
jest.mock('src/pages/reportBuilder/context/ReportBuilderContext');
useReportBuilderContext.mockImplementation(() => ({
  state: {
    relativeRange: 'hour',
    from: 'randomDate',
    to: 'randomDate',
  },
}));

describe('DelayReasonsTab', () => {
  const mockGetData = jest.fn();
  const defaultProps = {
    loading: false,
    reasons: [
      {
        count_delayed: 100,
        count_delayed_first: 10,
        reason: 'my reason',
        domain: 'gmail.com',
      },
    ],
    totalAccepted: 1000,
    refreshDelayReport: mockGetData,
  };
  const subject = props =>
    render(
      <TestApp>
        <DelayReasonsTab {...defaultProps} {...props} />
      </TestApp>,
    );
  it('renders with the correct row information', () => {
    const { queryByText } = subject();
    expect(mockGetData).toHaveBeenCalled();
    expect(queryByText('100')).toBeInTheDocument();
    expect(queryByText('10 (1%)')).toBeInTheDocument();
    expect(queryByText('my reason')).toBeInTheDocument();
    expect(queryByText('gmail.com')).toBeInTheDocument();
  });

  it('does not make api request when report options is not valid', () => {
    useReportBuilderContext.mockImplementationOnce(() => ({
      state: {
        relativeRange: 'hour',
      },
    }));
    subject();
    expect(mockGetData).not.toHaveBeenCalled();
  });

  it('shows empty message when there is no data', () => {
    const { queryByText } = subject({ reasons: [] });

    expect(queryByText('No delay reasons to report')).toBeInTheDocument();
  });
});
