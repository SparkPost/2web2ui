import React from 'react';
import { connect } from 'react-redux';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import { Grid, Box, Panel } from 'src/components/matchbox';
import { PanelLoading } from 'src/components';
import { Heading } from 'src/components/text';
import { Percent } from 'src/components/formatters';
import { formatDateTime, relativeDateOptionsIndexed } from 'src/helpers/date';
import { formatFullNumber } from 'src/helpers/units';
import { safeRate } from 'src/helpers/math';
import OGStyles from './EngagementSummary.module.scss';
import hibanaStyles from './EngagementSummaryHibana.module.scss';

export function EngagementSummary({
  accepted = 0,
  clicks = 0,
  filters,
  loading,
  opens = 0,
  sent = 0,
}) {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  // hack, on initial load it takes at least one render before filters are loaded
  if (loading || !filters.relativeRange) {
    return <PanelLoading minHeight="115px" />;
  }

  // sent should always be the largest number, so if it is zero all others should be zero
  if (sent === 0) {
    return null;
  }

  const timeRange =
    filters.relativeRange === 'custom' ? (
      <span>
        from <strong>{formatDateTime(filters.from)}</strong> to{' '}
        <strong>{formatDateTime(filters.to)}</strong>
      </span>
    ) : (
      <span>
        in the <strong>{relativeDateOptionsIndexed[filters.relativeRange].toLowerCase()}</strong>
      </span>
    );

  return (
    <Panel.LEGACY className={styles.EngagementSummary} data-id="summary-panel">
      <Box padding="400">
        <Grid>
          <Grid.Column xs={12} md={3} xl={2}>
            <Heading as="h3" data-id="unique-open-rate">
              <Percent value={safeRate(opens, accepted)} />
            </Heading>
            <Heading as="h6">Unique Open Rate</Heading>
          </Grid.Column>
          <Grid.Column xs={12} md={3} xl={2}>
            <Heading as="h3" data-id="unique-click-rate">
              <Percent value={safeRate(clicks, accepted)} />
            </Heading>
            <Heading as="h6">Unique Click Rate</Heading>
          </Grid.Column>
          <Grid.Column xs={12} md={6} xl={8}>
            <p>
              Of <strong data-id="count-sent">{formatFullNumber(sent)}</strong> sent recipients,{' '}
              <strong data-id="count-accepted">{formatFullNumber(accepted)}</strong> messages were
              accepted, <strong data-id="count-opened">{formatFullNumber(opens)}</strong> were
              opened and <strong data-id="count-unique-clicks">{formatFullNumber(clicks)}</strong>{' '}
              were clicked {timeRange}.
            </p>
          </Grid.Column>
        </Grid>
      </Box>
    </Panel.LEGACY>
  );
}

const mapStateToProps = ({ reportOptions: filters }) => ({ filters });
export default connect(mapStateToProps)(EngagementSummary);
