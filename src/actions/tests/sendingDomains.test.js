import { snapshotActionCases } from 'src/__testHelpers__/snapshotActionHelpers';
const sendingDomains = require('../sendingDomains');

jest.mock('../helpers/sparkpostApiRequest');

snapshotActionCases('Action Creator: Sending Domains', {
  'Create domain should be assigned to primary': {
    actionCreator: () => sendingDomains.create({ domain: 'domain.com' }),
  },
  'Create domain should be assigned a subaccount': {
    actionCreator: () => sendingDomains.create({ domain: 'domain.com', subaccount: { id: 101 } }),
  },
  'Create domain should be shared with all subaccount': {
    actionCreator: () => sendingDomains.create({ domain: 'domain.com', assignTo: 'shared' }),
  },
  'Verify should dispatch verify cname action': {
    actionCreator: () => sendingDomains.verify({ id: 'domain.com', type: 'cname' }),
  },
  'Verify should dispatch verify mx action': {
    actionCreator: () => sendingDomains.verify({ id: 'domain.com', type: 'mx' }),
  },
  'Verify should dispatch verify dkim action': {
    actionCreator: () => sendingDomains.verifyDkim({ id: 'sub.com', subaccount: 101 }),
  },
  'Verify should dispatch verify abuse action': {
    actionCreator: () => sendingDomains.verifyAbuse({ id: 'sub.com', subaccount: 101 }),
  },
  'Verify should dispatch verify mailbox action': {
    actionCreator: () =>
      sendingDomains.verifyMailbox({ id: 'sub.com', mailbox: 'example', subaccount: 101 }),
  },
  'Verify should verify as postmaster when using the mailbox action': {
    actionCreator: () =>
      sendingDomains.verifyMailbox({ id: 'sub.com', mailbox: 'postmaster', subaccount: 101 }),
  },
  'Verify should verify as abuse when using the mailbox action': {
    actionCreator: () =>
      sendingDomains.verifyMailbox({ id: 'sub.com', mailbox: 'abuse', subaccount: 101 }),
  },
  'Verify should dispatch verify postmaster action': {
    actionCreator: () => sendingDomains.verifyPostmaster({ id: 'sub.com', subaccount: 101 }),
  },
  'Verify Token should dispatch verify abuse token action': {
    actionCreator: () =>
      sendingDomains.verifyAbuseToken({ id: 'sub.com', subaccount: 101, token: '12345' }),
  },
  'Verify Token should dispatch verify mailbox token action': {
    actionCreator: () =>
      sendingDomains.verifyMailboxToken({
        id: 'sub.com',
        mailbox: 'example@test.com',
        subaccount: 101,
        token: '12345',
      }),
  },
  'Verify Token should dispatch verify postmaster token action': {
    actionCreator: () =>
      sendingDomains.verifyPostmasterToken({ id: 'sub.com', subaccount: 101, token: '12345' }),
  },
  'Remove should remove calls API': {
    actionCreator: () => sendingDomains.remove({ id: 'example.com' }),
  },
  'Remove should remove includes subaccount header with required': {
    actionCreator: () => sendingDomains.remove({ id: 'example.com', subaccount: 101 }),
  },
  'should request a list': {
    actionCreator: sendingDomains.list,
  },
  'should request a sending domain': {
    actionCreator: () => sendingDomains.get(123),
  },
  'should clear current sending domain': {
    actionCreator: sendingDomains.clearSendingDomain,
  },
  'Update should request with correct post data': {
    actionCreator: () =>
      sendingDomains.update({ id: 'domain.com', is_default_bounce_domain: true }),
  },
  'Update should update domain owned by subaccount': {
    actionCreator: () =>
      sendingDomains.update({
        id: 'domain.com',
        subaccount: 101,
        is_default_bounce_domain: true,
      }),
  },
});
