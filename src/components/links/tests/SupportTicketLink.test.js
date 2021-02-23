import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'src/components/matchbox';
import { SupportTicketLink } from '../SupportTicketLink';

describe('SupportTicketLink', () => {
  const subject = props =>
    shallow(
      <SupportTicketLink issueId="general_issue" {...props}>
        Help!
      </SupportTicketLink>,
    );

  it('renders an a11y link', () => {
    const wrapper = subject();

    expect(wrapper).toHaveDisplayName('ButtonLink');
    expect(wrapper).toHaveTextContent('Help!');
  });

  it('ignores "to" prop', () => {
    const wrapper = subject({ to: '/paradise' });
    expect(wrapper).not.toHaveProp('to');
  });

  it('opens support ticket form', () => {
    const openSupportTicketForm = jest.fn();
    const wrapper = subject({ issueId: 'my_issue', message: 'Help me!', openSupportTicketForm });

    wrapper.simulate('click');

    expect(openSupportTicketForm).toHaveBeenCalledWith({
      issueId: 'my_issue',
      message: 'Help me!',
    });
  });

  it('also calls passed in onClick function if available.', () => {
    const openSupportTicketForm = jest.fn();
    const mockOnClick = jest.fn();
    const wrapper = subject({
      issueId: 'my_issue',
      message: 'Help me!',
      onClick: mockOnClick,
      openSupportTicketForm,
    });

    wrapper.simulate('click');

    expect(openSupportTicketForm).toHaveBeenCalledWith({
      issueId: 'my_issue',
      message: 'Help me!',
    });
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('renders as a button', () => {
    const wrapper = subject({ as: Button });
    expect(wrapper).toHaveDisplayName('Button');
  });
});
