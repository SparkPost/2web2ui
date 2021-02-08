import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';
import setSubaccountHeader from 'src/actions/helpers/setSubaccountHeader';
import { SENDING_DOMAIN_TOKEN_TYPE } from 'src/constants';

export function list() {
  return sparkpostApiRequest({
    type: 'LIST_SENDING_DOMAINS',
    meta: {
      method: 'GET',
      url: '/v1/sending-domains',
    },
  });
}

export function get(id) {
  return sparkpostApiRequest({
    type: 'GET_SENDING_DOMAIN',
    meta: {
      method: 'GET',
      url: `/v1/sending-domains/${id}`,
      id,
      showErrorAlert: false,
    },
  });
}

export function create(data) {
  const { assignTo, subaccount, ...formData } = data;

  return sparkpostApiRequest({
    type: 'CREATE_SENDING_DOMAIN',
    meta: {
      method: 'POST',
      url: '/v1/sending-domains',
      headers: setSubaccountHeader(subaccount),
      data: { ...formData, shared_with_subaccounts: assignTo === 'shared' },
    },
  });
}

export function update({ id, subaccount, ...data }) {
  const headers = setSubaccountHeader(subaccount);

  return sparkpostApiRequest({
    type: 'UPDATE_SENDING_DOMAIN',
    meta: {
      method: 'PUT',
      url: `/v1/sending-domains/${id}`,
      data,
      headers,
    },
  });
}

export function remove({ id, subaccount }) {
  return sparkpostApiRequest({
    type: 'DELETE_SENDING_DOMAIN',
    meta: {
      method: 'DELETE',
      url: `/v1/sending-domains/${id}`,
      headers: setSubaccountHeader(subaccount),
    },
  });
}

export function verify({ id, subaccount, type, ...rest }) {
  return sparkpostApiRequest({
    type: `VERIFY_SENDING_DOMAIN_${type.toUpperCase()}`,
    meta: {
      method: 'POST',
      url: `/v1/sending-domains/${id}/verify`,
      headers: setSubaccountHeader(subaccount),
      data: {
        ...rest,
        [`${type}_verify`]: true,
      },
    },
  });
}

export function verifyDkim({ id, subaccount }) {
  return verify({ id, subaccount, type: 'dkim' });
}

export function verifyMailbox({ id, mailbox, subaccount }) {
  if (mailbox === 'abuse') {
    return verifyAbuse({ id, subaccount });
  }
  if (mailbox === 'postmaster') {
    return verifyPostmaster({ id, subaccount });
  }
  return verify({ id, subaccount, type: 'verification_mailbox', verification_mailbox: mailbox });
}

export function verifyAbuse({ id, subaccount }) {
  return verify({ id, subaccount, type: 'abuse_at' });
}

export function verifyPostmaster({ id, subaccount }) {
  return verify({ id, subaccount, type: 'postmaster_at' });
}

function verifyToken({ id, subaccount, type, token }) {
  return sparkpostApiRequest({
    type: 'VERIFY_TOKEN',
    meta: {
      method: 'POST',
      url: `/v1/sending-domains/${id}/verify`,
      headers: setSubaccountHeader(subaccount),
      data: { [`${type}_token`]: token },
      type,
      domain: id,
    },
  });
}

export function verifyMailboxToken({ id, token, subaccount }) {
  return verifyToken({ id, subaccount, type: SENDING_DOMAIN_TOKEN_TYPE['MAILBOX'], token });
}

export function verifyPostmasterToken({ id, token, subaccount }) {
  return verifyToken({ id, subaccount, type: SENDING_DOMAIN_TOKEN_TYPE['POSTMASTER'], token });
}

export function verifyAbuseToken({ id, token, subaccount }) {
  return verifyToken({ id, subaccount, type: SENDING_DOMAIN_TOKEN_TYPE['ABUSE'], token });
}

export const clearSendingDomain = () => ({ type: 'CLEAR_SENDING_DOMAIN' });
