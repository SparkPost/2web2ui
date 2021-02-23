import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';
import { Button } from 'src/components/matchbox';
import PageLink from '../PageLink';

describe('PageLink', () => {
  const subject = props =>
    shallow(
      <PageLink to="/dashboard" {...props}>
        Dashboard
      </PageLink>,
    );

  it('renders a link wired to react router', () => {
    const wrapper = subject();
    expect(wrapper).toHaveDisplayName('UnstyledLink');
    expect(wrapper).toHaveProp('as', Link);
    expect(wrapper).toHaveTextContent('Dashboard');
  });

  it('accepts a route object', () => {
    const routeObject = { pathname: '/dashboard', search: '?sort=name' };
    const wrapper = subject({ to: routeObject });
    expect(wrapper).toHaveProp('to', routeObject);
  });

  it('renders a button', () => {
    const wrapper = subject({ as: Button });
    expect(wrapper).toHaveDisplayName('Button');
  });

  it('warns the developer if a click handler is supplied', () => {
    const consoleWarningSpy = jest.spyOn(console, 'warn');
    subject({ onClick: jest.fn() });

    expect(consoleWarningSpy).toHaveBeenCalled();
  });
});
