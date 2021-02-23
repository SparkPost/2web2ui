import React from 'react';
import { PageLink } from 'src/components/links';
import { EmptyState } from 'src/components/matchbox';
import SendingMailWebp from '@sparkpost/matchbox-media/images/Sending-Mail.webp';
import SendingMail from '@sparkpost/matchbox-media/images/Sending-Mail@medium.jpg';
import { Box } from 'src/components/matchbox';
import { Bold } from 'src/components/text';
import { TranslatableText } from 'src/components/text';
import { LINKS } from 'src/constants';

export default function SendingDomainsEmptyState() {
  return (
    <EmptyState>
      <EmptyState.Header>Sending Domains</EmptyState.Header>
      <EmptyState.Content>
        <Box mb="400">
          <p>
            Sending domains are used to indicate who an email is from via the "From" header. DNS
            records can be configured for a sending domain, which allows recipient mail servers to
            authenticate messages sent from SparkPost.
          </p>
        </Box>
        <p>
          <Bold>
            At least one verified sending domain is required in order to start sending or enable
            analytics.
          </Bold>
        </p>
        <EmptyState.List>
          <li>
            <TranslatableText>Add a new sending domain.</TranslatableText>
          </li>
          <li>
            <TranslatableText>
              Configure the domain provider to send with SparkPost.
            </TranslatableText>
          </li>
          <li>
            <TranslatableText>
              Confirm that the sending domain was successfully verified.
            </TranslatableText>
          </li>
        </EmptyState.List>
      </EmptyState.Content>
      <EmptyState.Image src={SendingMail} seeThrough>
        <source srcSet={SendingMailWebp} type="image/webp" />
      </EmptyState.Image>
      <EmptyState.Action as={PageLink} to="/domains/create?type=sending">
        Add Sending Domain
      </EmptyState.Action>
      <EmptyState.Action variant="outline" to={LINKS.SENDING_DOMAIN_DOCS} external>
        Sending Domains Documentation
      </EmptyState.Action>
    </EmptyState>
  );
}
