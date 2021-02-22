/* eslint-disable react/forbid-elements */
import React from 'react';
import PropTypes from 'prop-types';

function Form(props) {
  return <form {...props}>{props.children}</form>;
}

export default Form;

Form.propTypes = {
  id: PropTypes.string.isRequired,
};
