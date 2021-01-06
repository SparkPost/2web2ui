import React from 'react';
import { EmptyState } from 'src/components/matchbox';
import ConfigurationWebp from '@sparkpost/matchbox-media/images/Configuration.webp';
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
          <Bold>existing Sending Domain&nbsp;</Bold>
          <TranslatableText>or by adding a new domain specifically for bounce.</TranslatableText>
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
      <EmptyState.Image src={ConfigurationWebp} />
      {/* TODO: Adjust picture markup to have source element and img with src attribute */}
      {/* <Dashboard.OnboardingPicture>
        <source srcset={SendingMailWebp} type="image/webp" />
        <OnboardingImg alt="" src={SendingMail} seeThrough />
      </Dashboard.OnboardingPicture> */}
      <EmptyState.Action to="/domains/create?type=bounce">Add Bounce Domain</EmptyState.Action>
      <EmptyState.Action variant="outline" to={LINKS.BOUNCE_DOMAIN_DOCS} external>
        Bounce Domains Documentation
      </EmptyState.Action>
    </EmptyState>
  );
}
