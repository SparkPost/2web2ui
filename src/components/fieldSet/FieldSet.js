import React from 'react';
import PropTypes from 'prop-types';
import { ScreenReaderOnly } from 'src/components/matchbox';
import styles from './FieldSet.module.scss';

const FieldSet = ({ children, legend, legendHidden = false }) => (
  <fieldset className={styles.FieldSet}>
    {legendHidden ? (
      <ScreenReaderOnly as="legend">{legend}</ScreenReaderOnly>
    ) : (
      <legend className={styles.Legend}>{legend}</legend>
    )}
    {children}
  </fieldset>
);

FieldSet.propTypes = {
  children: PropTypes.node.isRequired,
  legend: PropTypes.string.isRequired,
  legendHidden: PropTypes.bool,
};

export default FieldSet;
