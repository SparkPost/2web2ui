import React from 'react';
import { PageLink } from 'src/components/links';
import { EmptyState, Stack } from 'src/components/matchbox';
import AnalyticsJpg from '@sparkpost/matchbox-media/images/Analytics.jpg';
import AnalyticsWebp from '@sparkpost/matchbox-media/images/Analytics.webp';
import { useHistory } from 'react-router-dom';
import { LINKS } from 'src/constants';
import { Bold } from 'src/components/text';

export default function ReportBuilderEmptyState() {
  const history = useHistory();

  return (
    <EmptyState mb="750">
      <EmptyState.Header>Analytics Report</EmptyState.Header>
      <EmptyState.Content>
        <Stack>
          <p>
            Build and save custom reports with SparkPost's easy to use dashboard. Apply unlimited
            metrics across delivery and deliverability data. To learn how to unlock the full
            potential of SparkPost's Analytics Report, visit the documentation link below.
          </p>
          <Bold>A verified sending domain is required to start generating analytics.</Bold>
        </Stack>
      </EmptyState.Content>
      <EmptyState.Image src={AnalyticsJpg}>
        <source srcSet={AnalyticsWebp} type="image/webp"></source>
      </EmptyState.Image>
      <EmptyState.Action component={PageLink} onClick={() => history.push('/domains/create')}>
        Add Sending Domain
      </EmptyState.Action>
      <EmptyState.Action variant="outline" to={LINKS.ANALYTICS_DOCS} external>
        Analytics Documentation
      </EmptyState.Action>
    </EmptyState>
  );
}
