import React from 'react';
import { render } from '@testing-library/react';
import { RejectionReasonsTab } from '../RejectionReasonsTab';
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

describe('RejectionReasonsTab', () => {
  const mockGetData = jest.fn();
  const defaultProps = {
    loading: false,
    refreshRejectionReport: mockGetData,
    reasons: [
      {
        count_rejected: 65,
        rejection_category_name: 'Policy Rejection',
        rejection_category_id: 1,
        reason: '551 - Cannot Relay 105',
        domain: 'gmail.com',
      },
    ],
  };
  const subject = props =>
    render(
      <TestApp>
        <RejectionReasonsTab {...defaultProps} {...props} />
      </TestApp>,
    );
  it('renders with the correct row information', () => {
    const { queryByText } = subject();

    expect(mockGetData).toHaveBeenCalled();
    expect(queryByText('65')).toBeInTheDocument();
    expect(queryByText('Policy Rejection')).toBeInTheDocument();
    expect(queryByText('551 - Cannot Relay 105')).toBeInTheDocument();
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

    expect(queryByText('No rejection reasons to report')).toBeInTheDocument();
  });
});
