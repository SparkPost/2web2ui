import React from 'react';
import { EmptyState, Tabs } from 'src/components/matchbox';
import { Rocket } from '@sparkpost/matchbox-icons';
import AnalyticsWebp from '@sparkpost/matchbox-media/images/Analytics.webp';
import { Page } from 'src/components/matchbox';
import { useHistory } from 'react-router-dom';
import { LINKS } from 'src/constants';
import { Heading } from 'src/components/text';

export default function ReportBuilderEmptyState() {
  const history = useHistory();
  return (
    <Page>
      <EmptyState>
        <EmptyState.Header>Analytics Report</EmptyState.Header>
        <EmptyState.Content>
          <p>
            Build and save custom reports with SparkPost's easy to use dashboard. Apply unlimited
            metrics across delivery and deliverability data. To learn how to unlock the full
            potential of SparkPost's Analytics Report, visit the documentation link below.
          </p>
        </EmptyState.Content>
        <EmptyState.Image src={AnalyticsWebp} />
        <EmptyState.Action onClick={() => history.push('/domains/create')}>
          Add Sending Domain
        </EmptyState.Action>
        <EmptyState.Action variant="outline" to={LINKS.ANALYTICS_DOCS} external>
          Analytics Documentation
        </EmptyState.Action>
      </EmptyState>
      <Heading as="h2">Example Analytics</Heading>
      <Tabs
        keyboardActivation="auto"
        mb="800"
        onSelect={function noRefCheck() {}}
        selected={0}
        tabs={[
          {
            content: 'Tracking Engagement',
            onClick: function noRefCheck() {},
          },
          {
            content: 'Investigating Problems',
            onClick: function noRefCheck() {},
          },
          {
            content: (
              <>
                Deliverability Metrics <Rocket color="#fa6423" size="25" />
              </>
            ),
            onClick: function noRefCheck() {},
          },
        ]}
      />
    </Page>
  );
}
