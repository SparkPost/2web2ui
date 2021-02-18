import React from 'react';
import { connect } from 'react-redux';
import { getCaretProps } from 'src/helpers/signals';
import { selectCurrentHealthScoreDashboard } from 'src/selectors/signals';
import { Panel } from 'src/components/matchbox';
import { PanelLoading } from 'src/components';
import Callout from 'src/components/callout';
import { formatDate } from 'src/helpers/date';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import { FORMATS } from 'src/constants';
import Gauge from './Gauge';
import MetricDisplay from '../MetricDisplay/MetricDisplay';
import thresholds from '../../../constants/healthScoreThresholds';
import _ from 'lodash';
import OGStyles from './CurrentHealthGauge.module.scss';
import hibanaStyles from './CurrentHealthGaugeHibana.module.scss';

export function CurrentHealthGauge(props) {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);
  const noData = _.isNil(props.current_health_score);

  if (props.loading) {
    return <PanelLoading minHeight="407px" />;
  }

  if (props.error) {
    return (
      <Panel.LEGACY sectioned>
        <div className={styles.Content}>
          <div className={styles.ErrorMessage}>
            <Callout
              title="Unable to Load Data"
              height="auto"
              children={_.get(props, 'error.message')}
            />
          </div>
        </div>
      </Panel.LEGACY>
    );
  }

  let threshold = {};

  for (const key in thresholds) {
    if (thresholds[key].condition(props.current_health_score)) {
      threshold = thresholds[key];
    }
  }

  const DescriptionIcon = threshold.icon;

  function getMetricProps(key) {
    const value = props[key];
    return { value: _.isNil(value) ? 'n/a' : `${value}%`, ...getCaretProps(value) };
  }

  const title =
    _.get(props, 'filters.relativeRange') === 'custom'
      ? `Health Score for ${formatDate(props.filters.to, FORMATS.DATE_FNS.DATE)}`
      : 'Current Health Score';

  return (
    <Panel.LEGACY sectioned title={title}>
      <div className={styles.Content}>
        {noData && <Callout height="100%">Current Health Score Not Available</Callout>}

        {!noData && (
          <>
            <Gauge score={props.current_health_score} threshold={threshold} />
            <div className={styles.Description}>
              {/* eslint-disable react/forbid-component-props */}
              <DescriptionIcon
                className={styles.DescriptionIcon}
                size={25}
                style={{ fill: threshold.color }}
              />
              {/* eslint-enable react/forbid-component-props */}

              <p className={styles.DescriptionContent}>{threshold.description}</p>
            </div>
          </>
        )}
        <div className={styles.Metrics}>
          <MetricDisplay
            data-id="health-score-wow-change"
            label="WoW Change"
            {...getMetricProps('WoW')}
          />
          <MetricDisplay
            data-id="health-score-dod-change"
            label="DoD Change"
            {...getMetricProps('current_DoD')}
          />
        </div>
      </div>
    </Panel.LEGACY>
  );
}

const mapStateToProps = state => ({
  ...selectCurrentHealthScoreDashboard(state),
  filters: state.signalOptions,
});

export default connect(mapStateToProps, {})(CurrentHealthGauge);
