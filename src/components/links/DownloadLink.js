import React from 'react';
import PropTypes from 'prop-types';
import { Button, UnstyledLink } from 'src/components/matchbox';

// Link to download a static file
// SEE: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-download
const DownloadLink = ({
  as: Component = UnstyledLink,
  children,
  download = true,
  href,
  ...props
}) => (
  <Component {...props} download={download} referrerPolicy="origin" to={href}>
    {children}
  </Component>
);

DownloadLink.propTypes = {
  as: PropTypes.oneOf([Button, UnstyledLink]),
  children: PropTypes.node.isRequired,
  download: PropTypes.string,
  href: PropTypes.string.isRequired,
};

export default DownloadLink;
