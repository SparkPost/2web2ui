import React from 'react';
import { usePageFilters } from 'src/hooks';
import { Page } from 'src/components/matchbox';
import { PageLink } from 'src/components/links';
import { BASE_URL } from './constants';
import Domains from './components';

const initFilters = {
  type: { defaultValue: 'sending' },
};

export default function CreatePage() {
  const { filters } = usePageFilters(initFilters);
  const { type } = filters;

  function getDomainCreateType() {
    switch (type) {
      case 'sending':
      case 'bounce':
      case 'tracking':
        return type;
      default:
        return;
    }
  }
  // console.log(type);

  return (
    <Domains.Container>
      <Page
        breadcrumbAction={{
          content: 'All Domains',
          component: PageLink,
          to: BASE_URL,
        }}
        title="Add a Domain"
      >
        <Domains.CreateForm defaultType={getDomainCreateType()} />
      </Page>
    </Domains.Container>
  );
}
