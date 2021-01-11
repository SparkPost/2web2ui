import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { openSupportTicketForm } from 'src/actions/support';
import { Button, UnstyledLink } from 'src/components/matchbox';

// todo, disconnect from redux and use context
export const SupportTicketLink = ({
  as: Component = UnstyledLink,
  children,
  component: _component, // ignore
  issueId, // see, src/config/supportIssues for a complete list
  onClick,
  message,
  openSupportTicketForm,
  to: _to, // ignore
  ...props
}) => {
  const componentSpecificProps = {
    [Button]: {},
    [UnstyledLink]: {
      href: 'javascript:void(0);',
      role: 'button',
    },
  };

  return (
    <Component
      {...props}
      {...componentSpecificProps[Component]}
      onClick={() => {
        openSupportTicketForm({ issueId, message });
        onClick && onClick();
      }}
    >
      {children}
    </Component>
  );
};

SupportTicketLink.propTypes = {
  as: PropTypes.oneOf([Button, UnstyledLink]),
  children: PropTypes.node.isRequired,
  issueId: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  message: PropTypes.string,
};

export default connect(undefined, { openSupportTicketForm })(SupportTicketLink);
