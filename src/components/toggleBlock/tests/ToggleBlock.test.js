import React from 'react';
import { render } from '@testing-library/react';
import ToggleBlock from '../ToggleBlock';
import TestApp from 'src/__testHelpers__/TestApp';

describe('ToggleBlock', () => {
  const subject = props => {
    const defaultProps = {
      input: {
        name: 'my-test-toggle-block',
      },
      helpText: 'Default help text',
    };

    return render(
      <TestApp>
        <ToggleBlock {...defaultProps} {...props} />
      </TestApp>,
    );
  };

  it('renders the passed in label for the toggle input', () => {
    const { queryAllByText } = subject({ label: 'My Label' });

    expect(queryAllByText('My Label')[1]).toBeInTheDocument();
  });

  it('renders passed in help text', () => {
    const { queryByText } = subject({ helpText: 'This is some help text' });

    expect(queryByText('This is some help text')).toBeInTheDocument();
  });

  it('should not render help text if it is not provided', () => {
    const { queryByText } = subject({ helpText: null });

    expect(queryByText('Default help text')).not.toBeInTheDocument();
  });
});
