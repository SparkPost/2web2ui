import React from 'react';
import { EmptyState } from 'src/components/matchbox';
import SendingMailWebp from '@sparkpost/matchbox-media/images/Sending-Mail.webp';
import SendingMail from '@sparkpost/matchbox-media/images/Sending-Mail@medium.jpg';
import { Bold } from 'src/components/text';
import { Box } from 'src/components/matchbox';
import { TranslatableText } from 'src/components/text';
import { LINKS } from 'src/constants';

export default function BounceDomainsEmptyState() {
  return (
    <EmptyState>
      <EmptyState.Header>Bounce Domains</EmptyState.Header>
      <EmptyState.Content>
        <Box mb="400">
          <p>
            Custom bounce domains override the default Return-Path value, also known as the envelope
            FROM value, which denotes the destination for out-of-band bounces.
          </p>
        </Box>
        <p>
          <TranslatableText>Bounce domains can be set up using an&nbsp;</TranslatableText>
          <Bold>existing sending domain&nbsp;</Bold>
          <TranslatableText>
            or by adding a new domain specifically for bounces.&nbsp;
          </TranslatableText>
          <Bold>Only verified domains&nbsp;</Bold>
          <TranslatableText>
            can be used for bounce domains. Unverified bounce domains will appear under Sending
            Domains.
          </TranslatableText>
        </p>
        <EmptyState.List>
          <li>
            <TranslatableText>Add a new bounce domain.</TranslatableText>
          </li>
          <li>
            <TranslatableText>
              Configure the CNAME record with the domain provider.
            </TranslatableText>
          </li>
          <li>
            <TranslatableText>
              Confirm that the bounce domain was successfully verified.
            </TranslatableText>
          </li>
        </EmptyState.List>
      </EmptyState.Content>
      <EmptyState.Image src={SendingMail} seeThrough>
        <source srcset={SendingMailWebp} type="image/webp" />
      </EmptyState.Image>
      <EmptyState.Action to="/domains/create?type=bounce">Add Bounce Domain</EmptyState.Action>
      <EmptyState.Action variant="outline" to={LINKS.BOUNCE_DOMAIN_DOCS} external>
        Bounce Domains Documentation
      </EmptyState.Action>
    </EmptyState>
  );
}
