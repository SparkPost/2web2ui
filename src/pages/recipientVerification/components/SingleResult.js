import React, { Fragment } from 'react';
import { CheckCircleOutline, Warning } from '@sparkpost/matchbox-icons';
import styles from './SingleAddressForm.module.scss';

const validText = ' is a valid email address.';
const invalidText = ' is NOT a valid email address.';

const SingleResult = ({ singleResults }) => {
  const { valid, reason, email } = singleResults;
  const text = valid ? validText : `${invalidText} ${reason}`;
  const icon = valid
    ? <CheckCircleOutline className={styles.validIcon} size={33}/>
    : <Warning className={styles.invalidIcon} size={33} />;

  return (
    <Fragment>
      <br/>
      <p>
        <span className={styles.IconWrapper}>
          {icon}
        </span>
        <strong className={styles.email}> {email}</strong>
        <span className={styles.Paragraph}>{text}.</span>
      </p>
    </Fragment>
  );
};

export default SingleResult;
