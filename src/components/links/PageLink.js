import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, UnstyledLink } from 'src/components/matchbox';

// Link to a page in our application
const PageLink = ({ as: Component = UnstyledLink, children, ...props }) => {
  if (props.onClick) {
    /* eslint-disable-next-line */
    console.warn(
      'Invalid prop `onClick` - avoid attaching click handlers to links. Use the `ButtonLink` component instead.',
    );
  }

  return (
    <Component {...props} as={Link}>
      {children}
    </Component>
  );
};

PageLink.propTypes = {
  as: PropTypes.oneOf([Button, UnstyledLink]),
  children: PropTypes.node.isRequired,
  to: PropTypes.oneOfType([
    PropTypes.string,
    // see, https://reacttraining.com/react-router/web/api/Link/to-object
    PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
      hash: PropTypes.string,
      state: PropTypes.object,
    }),
  ]).isRequired,
};

export default PageLink;
