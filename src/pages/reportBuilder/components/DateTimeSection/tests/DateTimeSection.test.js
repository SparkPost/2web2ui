import React from 'react';
import { render } from '@testing-library/react';
import { TestApp } from 'src/__testHelpers__';
import { DateTimeSection } from '../DateTimeSection';

describe('DateTimeSection', () => {
  const defaultProps = {
    reportOptions: {},
    refreshReportOptions: jest.fn(),
  };
  const subject = props => {
    return render(
      <TestApp>
        <DateTimeSection {...defaultProps} {...props} />
      </TestApp>,
    );
  };

  it('should not disable fields', () => {
    const { getByLabelText } = subject();

    expect(getByLabelText('Precision')).not.toHaveAttribute('disabled');
    expect(getByLabelText('Time Zone')).not.toHaveAttribute('disabled');
  });
});
