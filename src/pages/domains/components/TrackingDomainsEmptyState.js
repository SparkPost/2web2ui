import React from 'react';
import { PageLink } from 'src/components/links';
import { EmptyState } from 'src/components/matchbox';
import { LINKS } from 'src/constants';
import MailJpg from '@sparkpost/matchbox-media/images/Sending-Mail.jpg';
import MailWebp from '@sparkpost/matchbox-media/images/Sending-Mail.webp';

function TrackingDomainsEmptyState() {
  return (
    <EmptyState>
      {/* TODO: Need to add `as="h2"` here with a matchbox update (UX-412) */}
      <EmptyState.Header>Tracking Domains</EmptyState.Header>
      <EmptyState.Content>
        <p>
          Tracking domains are used in engagement tracking to report email opens and link clicks.
          Custom tracking domains will replace the domain portion of the URL.
        </p>
        <EmptyState.List>
          <li>Add a new tracking domain.</li>
          <li>Configure the CNAME record with your domain provider.</li>
          <li>Confirm that the tracking domain was successfully verified.</li>
        </EmptyState.List>
      </EmptyState.Content>
      <EmptyState.Action
        component={PageLink}
        to={{ pathname: '/domains/create?type=tracking', state: { defaultDomainType: 'tracking' } }}
      >
        Add Tracking Domain
      </EmptyState.Action>
      <EmptyState.Action variant="outline" external to={LINKS.TRACKING_DOMAIN_DOCS}>
        Tracking Domains Documentation
      </EmptyState.Action>
      <EmptyState.Image src={MailJpg}>
        <source srcset={MailWebp} type="image/webp"></source>
      </EmptyState.Image>
    </EmptyState>
  );
}

export default TrackingDomainsEmptyState;
