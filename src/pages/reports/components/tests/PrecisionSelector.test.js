import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import PrecisionSelector from '../PrecisionSelector';
import TestApp from 'src/__testHelpers__/TestApp';

describe('PrecisionSelector', () => {
  const mockChangeTime = jest.fn();
  const defaults = {
    from: '2019-02-16T12:00:00',
    to: '2019-02-17T12:00:00',
    changeTime: mockChangeTime,
    selectedPrecision: 'hour',
  };
  const subject = props => {
    return render(
      <TestApp>
        <PrecisionSelector {...defaults} {...props} />
      </TestApp>,
    );
  };

  it('renders selection options correctly', () => {
    const { queryByText } = subject();
    expect(queryByText('5 Min')).toBeInTheDocument();
    expect(queryByText('15 Min')).toBeInTheDocument();
    expect(queryByText('Hour')).toBeInTheDocument();
    expect(queryByText('Day')).toBeInTheDocument();
  });

  it('changing precision triggers the onChange', () => {
    const { queryByTestId } = subject();
    const target = queryByTestId('precision-selector');
    fireEvent.change(target, {
      target: { value: 'hour' },
    });
    expect(mockChangeTime).toHaveBeenCalledWith(expect.objectContaining({ precision: 'hour' }));
    expect(target).toHaveValue('hour');
  });
});
