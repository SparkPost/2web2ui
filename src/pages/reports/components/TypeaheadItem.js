import React from 'react';

import styles from './Typeahead.module.scss';

const TypeaheadItem = ({ value, helpText = null }) => (
  <div className={styles.Item}>
    <span className={styles.Value}>{ value }</span>
    { helpText && <span className={styles.HelpText}>{ helpText }</span> }
  </div>
);

export default TypeaheadItem;
