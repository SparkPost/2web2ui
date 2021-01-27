export const REQUEST_TYPES = [
  {
    value: 'rtbf',
    label: 'Right to be forgotten',
  },
  {
    value: 'opt-out',
    label: 'Opt-out of third-party use',
  },
];

export const SUBACCOUNT_ITEMS = {
  shared: null,
  subaccount: -2,
  master: 0,
};

export const SUBACCOUNT_OPTIONS = [
  { label: 'Primary Account', value: 'master' },
  { label: 'Primary and All Subaccounts', value: 'shared' },
  { label: 'Select a Subaccount', value: 'subaccount' },
];
