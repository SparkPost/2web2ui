import React from 'react';
import moment from 'moment';
import { PageLink } from 'src/components/links';
import { Button, Grid, LabelValue, Panel, Tag } from 'src/components/matchbox';
import { formatDateTime } from 'src/helpers/date';
import { domainRegex } from 'src/helpers/regex';
import { StackedLineChart } from '@sparkpost/matchbox-icons';

export default ({
  resourceName,
  blocklistName,
  listedTimestamp,
  resolvedTimestamp,
  daysListed,
}) => {
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
    <Panel data-id="incident-details">
      <Panel.Section>
        <Grid>
          <Grid.Column sm={3}>
            <LabelValue>
              <LabelValue.Label>Resource</LabelValue.Label>
              <LabelValue.Value>{resourceName}</LabelValue.Value>
            </LabelValue>
          </Grid.Column>
          <Grid.Column sm={3}>
            <LabelValue>
              <LabelValue.Label>Blocklist</LabelValue.Label>
              <LabelValue.Value>{blocklistName}</LabelValue.Value>
            </LabelValue>
          </Grid.Column>
        </Grid>
      </Panel.Section>
      <Panel.Section>
        <Grid>
          <Grid.Column sm={4}>
            <LabelValue>
              <LabelValue.Label>Date Listed</LabelValue.Label>
              <LabelValue.Value>{formatDateTime(listedTimestamp)}</LabelValue.Value>
            </LabelValue>
          </Grid.Column>
          <Grid.Column sm={resolvedTimestamp ? 4 : 3}>
            <LabelValue>
              <LabelValue.Label>Date Resolved</LabelValue.Label>
              <LabelValue.Value>
                {resolvedTimestamp ? (
                  formatDateTime(resolvedTimestamp)
                ) : (
                  <Tag color="red">Active</Tag>
                )}
              </LabelValue.Value>
            </LabelValue>
          </Grid.Column>
          <Grid.Column sm={2}>
            <LabelValue>
              <LabelValue.Label>Days Listed</LabelValue.Label>
              <LabelValue.Value>{daysListed}</LabelValue.Value>
            </LabelValue>
          </Grid.Column>
        </Grid>
        <Panel.Action
          as={PageLink}
          to={`/reports/summary?from=${engagementSummaryFrom}&to=${engagementSummaryTo}&range=custom&filters=${engagementSummaryResource}:${resourceName}&report=engagement`}
        >
          View Engagement
          <Button.Icon as={StackedLineChart} marginLeft="200" />
        </Panel.Action>
      </Panel.Section>
    </Panel>
  );
};
