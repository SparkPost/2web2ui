import React from 'react';
import { connect } from 'react-redux';
import getConfig from 'src/helpers/getConfig';
import styles from './Legend.module.scss';

function renderMetric(metric, uniqueLabel) {
  return (
    <div className={styles.Metric} key={metric.name}>
      {/* This whole directory is getting deleted shortly so no need to fix this */}
      {/* eslint-disable-next-line */}
      <span className={styles.Color} style={{ backgroundColor: metric.stroke }} />
      {metric.isUniquePerTimePeriod && uniqueLabel
        ? `${metric.label} ${uniqueLabel}`
        : metric.label}
    </div>
  );
}

export const Legend = props => {
  const { metrics, reportOptions } = props;
  const { precision } = reportOptions;

  const metricsRollupPrecisionMap = getConfig('metricsRollupPrecisionMap');
  const precisionObj = metricsRollupPrecisionMap.find(p => p.value === precision);
  return (
    <div className={styles.Legend}>
      {metrics &&
        metrics.map(metric => renderMetric(metric, (precisionObj && precisionObj.uniqueLabel: '')))}
    </div>
  );
};

const mapStateToProps = state => ({
  reportOptions: state.reportOptions,
});

export default connect(mapStateToProps)(Legend);
