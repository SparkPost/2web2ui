import React from 'react';
import { EmptyState } from 'src/components/matchbox';
import ConfigurationWebp from '@sparkpost/matchbox-media/images/Configuration.webp';
import { Page } from 'src/components/matchbox';
import { TranslatableText } from 'src/components/text';
import { ExternalLink, PageLink } from 'src/components/links';
import { useHistory } from 'react-router-dom';
import { LINKS } from 'src/constants';

export default function AbTestEmptyState() {
  const history = useHistory();
  return (
    <Page>
      <EmptyState>
        <EmptyState.Header>A/B Testing</EmptyState.Header>
        <EmptyState.Content>
          <p>
            A/B testing uses Templates and Transmissions to create tests that reveal how variations
            in content impact recipient engagement. These tests can help identify the most effective
            content, subject lines, images, and more.
          </p>
          <EmptyState.List>
            <li>
              <TranslatableText>Create two </TranslatableText>
              <PageLink to="/templates">templates</PageLink>{' '}
              <TranslatableText>you would like to test.</TranslatableText>
            </li>
            <li>Create and schedule an A/B test.</li>
            <li>
              <TranslatableText>Provide the ab_test_id when sending with the </TranslatableText>
              <ExternalLink to={LINKS.TRANSMISSIONS_API} showIcon={false}>
                Transmission API.
              </ExternalLink>
            </li>
          </EmptyState.List>
        </EmptyState.Content>
        <EmptyState.Image src={ConfigurationWebp} />
        <EmptyState.Action onClick={() => history.push('/ab-testing/create')}>
          Create A/B Test
        </EmptyState.Action>
        <EmptyState.Action variant="outline" to={LINKS.AB_TESTING_DOCS} external>
          A/B Testing Documentation
        </EmptyState.Action>
      </EmptyState>
    </Page>
  );
}
