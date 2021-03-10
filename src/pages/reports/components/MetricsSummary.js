import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import { Grid, Panel } from 'src/components/matchbox';
import { Heading } from 'src/components/text';
import { Percent } from 'src/components';
import { formatDateTime, relativeDateOptionsIndexed } from 'src/helpers/date';
import OGStyles from './MetricsSummary.module.scss';
import hibanaStyles from './MetricsSummaryHibana.module.scss';

export function MetricsSummary(props) {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);
  const { children, rateValue, rateTitle, secondaryMessage } = props;

  const renderDate = () => {
    const { to, from, relativeRange } = props;

    if (relativeRange === 'custom') {
      return (
        <span>
          {' '}
          from <strong>{formatDateTime(from)}</strong> to <strong>{formatDateTime(to)}</strong>
        </span>
      );
    }

    return (
      <span>
        {' '}
        in the <strong>{relativeDateOptionsIndexed[relativeRange].toLowerCase()}</strong>
      </span>
    );
  };

  return (
    <Panel.LEGACY className={styles.Panel}>
      <Panel.LEGACY.Section>
        <Grid>
          <Grid.Column xs={12} md={3} xl={2}>
            <div className={styles.panelvertical}>
              <Heading as="h3" className={styles.RateValue}>
                <Percent value={rateValue} />
              </Heading>

              <Heading as="h4" className={styles.RateTitle}>
                {rateTitle}
              </Heading>
            </div>
          </Grid.Column>
          <Grid.Column>
            <div className={styles.panelvertical}>
              <p className={styles.Description}>
                {children}
                {renderDate()}.
              </p>
              {secondaryMessage && <p className={styles.Secondary}>{secondaryMessage}</p>}
            </div>
          </Grid.Column>
        </Grid>
      </Panel.LEGACY.Section>
    </Panel.LEGACY>
  );
}

MetricsSummary.propTypes = {
  to: PropTypes.instanceOf(Date),
  from: PropTypes.instanceOf(Date),
  relativeRange: PropTypes.string,
  rateValue: PropTypes.number,
  rateTitle: PropTypes.string,
  secondaryMessage: PropTypes.node,
};

export default connect(state => ({ ...state.reportOptions }))(MetricsSummary);
