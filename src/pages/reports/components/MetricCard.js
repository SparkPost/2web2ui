import React from 'react';
import PropTypes from 'prop-types';
import { InfoOutline } from '@sparkpost/matchbox-icons';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import useUniqueId from 'src/hooks/useUniqueId';
import { Panel, Tooltip } from 'src/components/matchbox';
import { Heading } from 'src/components/text';
import OGStyles from './MetricCard.module.scss';
import hibanaStyles from './MetricCardHibana.module.scss';

const MetricCard = ({ label, value, tooltipContent, ...rest }) => {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);
  const tooltipId = useUniqueId('metric-card');
  const tooltip = tooltipContent ? (
    <Tooltip id={tooltipId} dark content={tooltipContent} horizontalOffset="-1.1rem">
      <InfoOutline className={styles.TooltipIcon} />
    </Tooltip>
  ) : null;

  return (
    <div className={styles.MetricCard}>
      <Panel.LEGACY className={styles.Panel} {...rest}>
        <Panel.LEGACY.Section className={styles.PanelSection}>
          <Heading as="h3" className={styles.Value}>
            {value}
          </Heading>
          <Heading as="h4" className={styles.Label}>
            {label} {tooltip}
          </Heading>
        </Panel.LEGACY.Section>
      </Panel.LEGACY>
    </div>
  );
};

MetricCard.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
  tooltipContent: PropTypes.string,
  label: PropTypes.string,
};

export default MetricCard;
