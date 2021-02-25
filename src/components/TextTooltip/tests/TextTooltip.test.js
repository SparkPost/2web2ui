import React from 'react';
import { render, screen } from '@testing-library/react';
import TextTooltip from '../TextTooltip';
import TestApp from 'src/__testHelpers__/TestApp';

function subject(props) {
  const portalRoot = document.createElement('div');
  portalRoot.setAttribute('id', 'tooltip-portal');
  document.body.appendChild(portalRoot);

  return render(
    <TestApp>
      <TextTooltip {...props} />
    </TestApp>,
  );
}

describe('TextTooltip', () => {
  it('should require', () => {
    subject({ children: 'Some string' });
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent('Some string');
  });

  it('should disable the tooltip if the text ends up geting truncated', () => {
    const { queryAllByText } = subject({ children: 'Some string' });
    queryAllByText('Some string')[0].focus();
    expect(queryAllByText('Some string').length).toEqual(3);
  });
});
