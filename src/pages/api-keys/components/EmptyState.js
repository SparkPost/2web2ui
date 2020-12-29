import React from 'react';
import { EmptyState } from 'src/components/matchbox';
import MailJpg from '@sparkpost/matchbox-media/images/Sending-Mail.jpg';
import MailWebp from '@sparkpost/matchbox-media/images/Sending-Mail.webp';
import { Page } from 'src/components/matchbox';
import { PageLink } from 'src/components/links';
import { TranslatableText } from 'src/components/text';
import { LINKS } from 'src/constants';

export default function ApiKeysEmptyState() {
  return (
    <Page>
      <EmptyState>
        <EmptyState.Header>API Keys</EmptyState.Header>
        <EmptyState.Content>
          <p>
            <TranslatableText>
              A SparkPost API key is required to enable API and SMTP injection. API key permissions
              can be configured to allow access to only required features.
            </TranslatableText>
          </p>
        </EmptyState.Content>
        <EmptyState.Image src={MailJpg}>
          <source srcset={MailWebp} type="image/webp"></source>
        </EmptyState.Image>
        <EmptyState.Action component={PageLink} to="/account/api-keys/create">
          Create API Key
        </EmptyState.Action>
        <EmptyState.Action variant="outline" to={LINKS.API_KEYS_GUIDE} external>
          API Keys Documentation
        </EmptyState.Action>
      </EmptyState>
    </Page>
  );
}
