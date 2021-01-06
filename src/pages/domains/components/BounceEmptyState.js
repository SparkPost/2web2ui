import React from 'react';
import { EmptyState } from 'src/components/matchbox';
import ConfigurationWebp from '@sparkpost/matchbox-media/images/Configuration.webp';
import { Page } from 'src/components/matchbox';
import { TranslatableText } from 'src/components/text';
// import { ExternalLink, PageLink } from 'src/components/links';
// import { useHistory } from 'react-router-dom';
import { LINKS } from 'src/constants';

export default function AbTestEmptyState() {
  // const history = useHistory();
  return (
    <Page>
      <EmptyState>
        <EmptyState.Header>Bounce Domains</EmptyState.Header>
        <EmptyState.Content>
          <p>
            Custom bounce domains override the default Return-Path value, also known as the envelope
            FROM value, which denotes the destination for out-of-band bounces.
          </p>
          <p>
            Bounce domains can be set up using an existing Sending Domain or by adding a new domain
            specifically for bounce.
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
        {/* TODO: fix history.push('/ab-testing/create')} */}
        <EmptyState.Action onClick={() => undefined}>Add Bounce Domain</EmptyState.Action>
        {/* TODO: Fix link */}
        <EmptyState.Action variant="outline" to={LINKS.AB_TESTING_DOCS} external>
          Bounce Domains Documentation
        </EmptyState.Action>
      </EmptyState>
    </Page>
  );
}
