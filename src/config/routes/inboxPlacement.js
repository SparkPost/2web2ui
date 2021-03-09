import { inboxPlacement } from 'src/pages';
import App from 'src/components/layout/App';
import { hasGrants } from 'src/helpers/conditions';

export default [
  {
    path: '/inbox-placement/seedlist',
    component: inboxPlacement.SeedListPage,
    layout: App,
    condition: hasGrants('inbox-placement/manage'),
    title: 'Seedlist',
    supportDocSearch: 'seedlis4t',
    category: 'Seedlist',
  },
];
