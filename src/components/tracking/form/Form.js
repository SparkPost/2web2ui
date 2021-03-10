/* eslint-disable react/forbid-elements */
import React from 'react';
import PropTypes from 'prop-types';

const { log } = console;

function handleSubmit(event) {
  if (process.env.NODE_ENV !== 'production') {
    log(event.target);
  }
}

document.addEventListener('submit', handleSubmit, false);

function Form({ children, ...props }) {
  return <form {...props}>{children}</form>;
}

export default Form;

Form.propTypes = {
  id: PropTypes.string.isRequired,
};
