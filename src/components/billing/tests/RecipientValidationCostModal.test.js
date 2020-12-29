import React from 'react';
import { render } from '@testing-library/react';
import TestApp from 'src/__testHelpers__/TestApp';
import RecipientValidationCostModal from '../RecipientValidationCostModal';

describe('RecipientValidationCostModal', () => {
  const defaultProps = {
    open: true,
    volumeUsed: 1000,
    end: '2020-11-20T08:00:00.000Z',
    start: '2020-11-01T08:00:00.000Z',
  };

  it('should render correctly', () => {
    const instance = render(
      <TestApp isHibanaEnabled={true}>
        <RecipientValidationCostModal {...defaultProps} />
      </TestApp>,
    );

    expect(instance.queryByText('1,000')).toBeInTheDocument();
    expect(instance.queryByText('Nov 1 2020 - Nov 20 2020')).toBeInTheDocument();
    expect(instance.queryAllByText('$10.00')).toHaveLength(2); // First row and totals row
  });
});
