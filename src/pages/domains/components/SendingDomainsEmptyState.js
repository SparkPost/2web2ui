import React from 'react';
import { EmptyState } from 'src/components/matchbox';
import ConfigurationWebp from '@sparkpost/matchbox-media/images/Configuration.webp';
import { TranslatableText } from 'src/components/text';
// import { ExternalLink, PageLink } from 'src/components/links';
// import { useHistory } from 'react-router-dom';
import { LINKS } from 'src/constants';

export default function SendingDomainsEmptyState() {
  // const history = useHistory();
  return (
    <EmptyState>
      <EmptyState.Header>Sending Domains</EmptyState.Header>
      <EmptyState.Content>
        <p>
          Sending domains are used to indicate who an email is from via the "Form" records can be
          configured for a sending domain, which allows recipient mail servers to authenticate
          messages sent from SparkPost.
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
      <EmptyState.Image src={ConfigurationWebp} />
      <EmptyState.Action to="/domains/create">Add Sending Domain</EmptyState.Action>

      {/* TODO: FIX TO LINK */}
      <EmptyState.Action variant="outline" to={LINKS.AB_TESTING_DOCS} external>
        Sending Domains Documentation
      </EmptyState.Action>
    </EmptyState>
  );
}
