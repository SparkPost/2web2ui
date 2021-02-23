import React from 'react';
import { Box, EmptyState } from 'src/components/matchbox';
import ConfigurationWebp from '@sparkpost/matchbox-media/images/Configuration.webp';
import Configuration from '@sparkpost/matchbox-media/images/Configuration@medium.jpg';
import { Page } from 'src/components/matchbox';
import { PageLink } from 'src/components/links';
import { Bold, TranslatableText } from 'src/components/text';
import { CREATE_SUBACCOUNT, LINKS } from 'src/constants';

export default function SubaccountEmptyState() {
  return (
    <Page>
      <EmptyState>
        <EmptyState.Header>Subaccounts</EmptyState.Header>
        <EmptyState.Content>
          <p>
            <TranslatableText>
              Subaccounts can be used to provision and manage senders separately from each other,
              and to provide assets and reporting data for each of them. Subaccounts are great for
              service providers who send on behalf of others or for businesses that want to separate
              different streams of traffic.
            </TranslatableText>
          </p>
          <Box mt="400">
            <Bold>Common uses for Subaccounts</Bold>
          </Box>
          <EmptyState.List>
            <li>
              <TranslatableText>
                Sending as a service provider for multiple unique customers.
              </TranslatableText>
            </li>
            <li>
              <TranslatableText>
                Keeping unique internal business units independent from one another.
              </TranslatableText>
            </li>
            <li>
              <TranslatableText>
                Tracking mission critical campaign data separate from other mailstreams.
              </TranslatableText>
            </li>
          </EmptyState.List>
        </EmptyState.Content>
        <EmptyState.Image src={Configuration}>
          <source srcSet={ConfigurationWebp} type="image/webp"></source>
        </EmptyState.Image>
        <EmptyState.Action as={PageLink} to={CREATE_SUBACCOUNT}>
          Create Subaccount
        </EmptyState.Action>
        <EmptyState.Action variant="outline" to={LINKS.SUBACCOUNTS} external>
          Subaccounts Documentation
        </EmptyState.Action>
      </EmptyState>
    </Page>
  );
}
