import { Settings } from '@sparkpost/matchbox-icons/matchbox-icons';

export default {
  label: 'Settings',
  to: '/account',
  icon: Settings,
  children: [
    {
      label: 'API Keys',
      to: '/account/api-keys',
    },
    {
      label: 'Subaccounts',
      to: '/account/subaccounts',
    },
    {
      label: 'SMTP Settings',
      to: '/account/smtp',
    },
    {
      label: 'Sending Domains',
      to: '/account/sending-domains',
    },
    {
      label: 'IP Pools',
      to: '/account/ip-pools',
    },
  ],
};
