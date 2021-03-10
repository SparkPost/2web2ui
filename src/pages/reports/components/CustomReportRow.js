import React from 'react';
import { Button } from 'src/components/matchbox';
import styles from './CustomReportRow.module.scss';

function ReportRow(props) {
  return (
    <div onClick={props.onLoad} className={styles.Row}>
      <div className={styles.Name}>{props.name}</div>
      <div className={styles.Delete}>
        <Button
          className={styles.DeleteButton}
          disabled={props.deleting}
          flat
          size="small"
          onClick={e => {
            e.stopPropagation();
            props.onDelete(props.name);
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export default ReportRow;
