import React from 'react';
import PropTypes from 'prop-types';

const { log } = console;
const DEBUG = false;

function handleSubmit(event) {
  if (process.env.NODE_ENV !== 'production' && DEBUG) {
    log(event.target.elements);
    const formElements = event.target.elements;

    // https://codesandbox.io/s/custom-components-and-helpers-for-analytics-tracking-forked-y2vqd
    for (const el of formElements) {
      log(el);
      // const name = getElName(el);
      // const value = getFieldValue(el);

      // if (name || value) {
      //   formData.push({ name, value });
      // }
    }
  }
}

document.addEventListener('submit', handleSubmit, false);

function Form({ children, ...props }) {
  /* eslint-disable-next-line react/forbid-elements */
  return <form {...props}>{children}</form>;
}

export default Form;

Form.propTypes = {
  id: PropTypes.string.isRequired,
};
