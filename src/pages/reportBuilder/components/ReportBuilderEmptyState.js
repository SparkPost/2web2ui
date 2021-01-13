import React from 'react';
import { EmptyState, Stack } from 'src/components/matchbox';
import AnalyticsJpg from '@sparkpost/matchbox-media/images/Analytics.jpg';
import AnalyticsWebp from '@sparkpost/matchbox-media/images/Analytics.webp';
import { useHistory } from 'react-router-dom';
import { LINKS } from 'src/constants';
import { Bold } from 'src/components/text';
import styled from 'styled-components';

const TempImageContainerForMaxSize = styled.div`
  figure {
    padding-left: 5rem;

    img {
      max-width: 300px;
    }
  }
`;

export default function ReportBuilderEmptyState() {
  const history = useHistory();

  return (
    <TempImageContainerForMaxSize>
      <EmptyState>
        {/* QUESTION: Use <Page /> Header prop instead? */}
        <EmptyState.Header>Analytics Report</EmptyState.Header>
        <EmptyState.Content>
          <Stack>
            <p>
              Build and save custom reports with SparkPost's easy to use dashboard. Apply unlimited
              metrics across delivery and deliverability data. To learn how to unlock the full
              potential of SparkPost's Analytics Report, visit the documentation link below.
            </p>
            <Bold>A sending domain is required to start generating analytics.</Bold>
          </Stack>
        </EmptyState.Content>
        <EmptyState.Image src={AnalyticsJpg}>
          <source srcSet={AnalyticsWebp} type="image/webp"></source>
        </EmptyState.Image>
        {/* Comment: component={PageLink here} */}
        {/* Question: Do we need to pass in ?type at all here? */}
        <EmptyState.Action onClick={() => history.push('/domains/create')}>
          Add Sending Domain
        </EmptyState.Action>
        <EmptyState.Action variant="outline" to={LINKS.ANALYTICS_DOCS} external>
          Analytics Documentation
        </EmptyState.Action>
      </EmptyState>
    </TempImageContainerForMaxSize>
  );
}
