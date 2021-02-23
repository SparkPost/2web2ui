import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { openSupportTicketForm } from 'src/actions/support';
import { Button } from 'src/components/matchbox';
import { ButtonLink } from 'src/components/links';

// todo, disconnect from redux and use context
export const SupportTicketLink = ({
  as: Component = ButtonLink,
  children,
  issueId, // see, src/config/supportIssues for a complete list
  onClick,
  message,
  openSupportTicketForm,
  to: _to, // ignore
  ...props
}) => {
  return (
    <Component
      {...props}
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
  as: PropTypes.oneOf([Button, ButtonLink]),
  children: PropTypes.node.isRequired,
  issueId: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  message: PropTypes.string,
};

export default connect(undefined, { openSupportTicketForm })(SupportTicketLink);
