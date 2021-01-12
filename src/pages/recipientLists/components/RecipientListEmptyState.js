import React from 'react';
import { EmptyState } from 'src/components/matchbox';
import MailJpg from '@sparkpost/matchbox-media/images/Sending-Mail.jpg';
import MailWebp from '@sparkpost/matchbox-media/images/Sending-Mail.webp';
import { Page } from 'src/components/matchbox';
import { PageLink } from 'src/components/links';
import { LINKS } from 'src/constants';

export default function RecipientListEmptyState() {
  return (
    <Page>
      <EmptyState>
        <EmptyState.Header>Recipient Lists</EmptyState.Header>
        <EmptyState.Content>
          <p>
            A recipient list is a collection of recipients that can be used in a transmission. When
            sending email to multiple recipients, it’s best to put them in a recipient list. This is
            particularly true when sending multiple emails to the same recipients.
          </p>
        </EmptyState.Content>
        <EmptyState.Image src={MailJpg}>
          <source srcSet={MailWebp} type="image/webp"></source>
        </EmptyState.Image>
        <EmptyState.Action component={PageLink} to="/lists/recipient-lists/create">
          Create Recipient List
        </EmptyState.Action>
        <EmptyState.Action variant="outline" to={LINKS.RECIP_DOCS} external>
          Recipient Lists Documentation
        </EmptyState.Action>
      </EmptyState>
    </Page>
  );
}
