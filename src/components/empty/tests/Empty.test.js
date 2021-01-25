import React from 'react';
import { render } from '@testing-library/react';
import TestApp from 'src/__testHelpers__/TestApp';
import { Empty } from 'src/components';

describe('Empty: ', () => {
  it('renders a message and a description', () => {
    const { getByText } = render(
      <TestApp isHibanaEnabled={true}>
        <Empty message="nothing here to see" description="so go away" />
      </TestApp>,
    );

    expect(getByText('nothing here to see')).toBeInTheDocument();
    expect(getByText('so go away')).toBeInTheDocument();
  });
});
