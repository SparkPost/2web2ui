import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from 'src/components/matchbox';
import { TestApp } from 'src/__testHelpers__';
import ExternalLink from '../ExternalLink';

describe('ExternalLink', () => {
  const subject = props =>
    render(
      <TestApp>
        <ExternalLink to="http://example.com" {...props}>
          See ya!
        </ExternalLink>
      </TestApp>,
    );

  it('renders an external link', () => {
    subject();
    expect(screen.getByRole('link')).toHaveTextContent('See ya!');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'http://example.com');
    expect(screen.getByRole('link')).toHaveAttribute('title', 'Opens in a new tab');
  });

  it('still renders the link when `as` is a `Button` component', () => {
    subject({ as: Button });
    expect(screen.getByRole('link')).toHaveTextContent('See ya!');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'http://example.com');
    expect(screen.getByRole('link')).toHaveAttribute('title', 'Opens in a new tab');
  });
});
