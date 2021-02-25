/* eslint-disable react/forbid-elements */
import React from 'react';
import PropTypes from 'prop-types';

function handleSubmit() {}

document.addEventListener('submit', handleSubmit, false);

function Form({ children, ...props }) {
  return <form {...props}>{children}</form>;
}

export default Form;

Form.propTypes = {
  id: PropTypes.string.isRequired,
};
