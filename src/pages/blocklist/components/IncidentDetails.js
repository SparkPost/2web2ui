import React from 'react';
import moment from 'moment';
import { PageLink } from 'src/components/links';
import { Box, Button, Grid, LabelValue, Panel, Tag } from 'src/components/matchbox';
import { formatDateTime } from 'src/helpers/date';
import { domainRegex } from 'src/helpers/regex';
import { ShowChart } from '@sparkpost/matchbox-icons';
import { Definition as DefinitionOG } from 'src/components/text';
import { useHibana } from 'src/context/HibanaContext';

export default ({
  resourceName,
  blocklistName,
  listedTimestamp,
  resolvedTimestamp,
  daysListed,
}) => {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;
  const Definition = isHibanaEnabled ? LabelValue : DefinitionOG;

  const engagementSummaryFrom = moment
    .utc(listedTimestamp)
    .subtract('7', 'days')
    .format();

  const now = moment.utc();
  let engagementSummaryTo = now.format();

  if (resolvedTimestamp) {
    const timestamp = moment.utc(resolvedTimestamp);
    const weekLater = timestamp.add('7', 'days');
    if (weekLater.isBefore(now)) {
      engagementSummaryTo = weekLater.format();
    }
  }

  const engagementSummaryResource = resourceName.match(domainRegex)
    ? 'Sending Domain'
    : 'Sending IP';

  return (
    <>
      <Panel.LEGACY.Section>
        <Grid>
          <Grid.Column sm={3}>
            <Definition>
              <Definition.Label>Resource</Definition.Label>
              <Definition.Value>{resourceName}</Definition.Value>
            </Definition>
          </Grid.Column>
          <Grid.Column sm={3}>
            <Definition>
              <Definition.Label>Blocklist</Definition.Label>
              <Definition.Value>{blocklistName}</Definition.Value>
            </Definition>
          </Grid.Column>
        </Grid>
      </Panel.LEGACY.Section>
      <Panel.LEGACY.Section>
        <Grid>
          <Grid.Column sm={3}>
            <Definition>
              <Definition.Label>Date Listed</Definition.Label>
              <Definition.Value>{formatDateTime(listedTimestamp)}</Definition.Value>
            </Definition>
          </Grid.Column>
          <Grid.Column sm={resolvedTimestamp ? 3 : 2}>
            <Definition>
              <Definition.Label>Date Resolved</Definition.Label>
              <Definition.Value>
                {resolvedTimestamp ? (
                  formatDateTime(resolvedTimestamp)
                ) : (
                  <Tag color="red">Active</Tag>
                )}
              </Definition.Value>
            </Definition>
          </Grid.Column>
          <Grid.Column sm={2}>
            <Definition>
              <Definition.Label>Days Listed</Definition.Label>
              <Definition.Value>{daysListed}</Definition.Value>
            </Definition>
          </Grid.Column>
          <Grid.Column sm={2}>
            <PageLink
              as={Button}
              size="small"
              flat
              to={`/reports/summary?from=${engagementSummaryFrom}&to=${engagementSummaryTo}&range=custom&filters=${engagementSummaryResource}:${resourceName}&report=engagement`}
            >
              View Engagement
              <Box as="span" position="relative" left="200" bottom="1px">
                <ShowChart />
              </Box>
            </PageLink>
          </Grid.Column>
        </Grid>
      </Panel.LEGACY.Section>
    </>
  );
};
