import React from 'react';
import { EmptyState } from 'src/components/matchbox';
import EmailTemplateWebp from '@sparkpost/matchbox-media/images/Email-Template.webp';
import { Page } from 'src/components/matchbox';
import { useHistory } from 'react-router-dom';
import { LINKS } from 'src/constants';

export default function SnippetsEmptyState() {
  const history = useHistory();
  return (
    <Page>
      <EmptyState>
        <EmptyState.Header>Snippets</EmptyState.Header>
        <EmptyState.Content>
          <p>
            Snippets are modular, reusable content that can be imported into the HTML, Text, or AMP
            part of any email template. Snippets make it easy to create and maintain consistent
            content like footers and social share buttons across all emails.
          </p>
        </EmptyState.Content>
        <EmptyState.Image src={EmailTemplateWebp} />
        <EmptyState.Action onClick={() => history.push('/snippets/create')}>
          Create Snippet
        </EmptyState.Action>
        <EmptyState.Action variant="outline" to={LINKS.SNIPPETS_DOCS} external>
          Snippets Documentation
        </EmptyState.Action>
      </EmptyState>
    </Page>
  );
}
