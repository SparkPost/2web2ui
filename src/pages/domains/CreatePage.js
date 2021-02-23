import React from 'react';
import { Page } from 'src/components/matchbox';
import { PageLink } from 'src/components/links';
import { BASE_URL } from './constants';
import Domains from './components';

export default function CreatePage() {
  return (
    <Domains.Container>
      <Page
        breadcrumbAction={{
          content: 'All Domains',
          as: PageLink,
          to: BASE_URL,
        }}
        title="Add a Domain"
      >
        <Domains.CreateForm />
      </Page>
    </Domains.Container>
  );
}
