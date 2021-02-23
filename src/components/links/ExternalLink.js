import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { OpenInNew } from '@sparkpost/matchbox-icons';
import { Box, Button, UnstyledLink } from 'src/components/matchbox';

// The element can be overwritten via the `as` prop
const StyledLink = styled(UnstyledLink)`
  display: inline-flex;
  align-items: center;
`;

function ExternalLink({
  as: Component = UnstyledLink,
  children,
  showIcon = true,
  icon: Icon = OpenInNew,
  ...props
}) {
  const isButton = Component.name === 'Button';

  return (
    <StyledLink as={Component} {...props} external={true}>
      {children}

      {showIcon && <ExternalLinkIcon isButton={isButton} icon={Icon} />}
    </StyledLink>
  );
}

function ExternalLinkIcon({ isButton, icon: Icon }) {
  if (isButton) {
    return <Button.Icon as={Icon} />;
  }

  return (
    <Box as="span" marginTop="-0.1rem" marginLeft="3px">
      <Icon size="0.9rem" />
    </Box>
  );
}

ExternalLink.propTypes = {
  as: PropTypes.oneOf([Button, UnstyledLink]),
  children: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
  showIcon: PropTypes.bool,
};

export default ExternalLink;
