import sparkpostApiRequest from './helpers/sparkpostApiRequest';
import { setSubaccountHeader } from 'src/helpers/subaccounts';

export function createApiKey({ grants, label, subaccount, validIps: valid_ips = [] }) {
  return sparkpostApiRequest({
    type: 'CREATE_API_KEY',
    meta: {
      method: 'POST',
      url: '/v1/api-keys',
      headers: setSubaccountHeader(subaccount),
      data: {
        grants,
        label,
        valid_ips,
      },
    },
  });
}

export function getApiKey({ id, subaccount = null }) {
  const headers = setSubaccountHeader(subaccount);

  return sparkpostApiRequest({
    type: 'GET_API_KEY',
    meta: {
      method: 'GET',
      url: `/v1/api-keys/${id}`,
      headers,
    },
  });
}

export function deleteApiKey({ id, subaccount = null }) {
  const headers = setSubaccountHeader(subaccount);

  return sparkpostApiRequest({
    type: 'DELETE_API_KEY',
    meta: {
      method: 'DELETE',
      url: `/v1/api-keys/${id}`,
      headers,
    },
  });
}

export function updateApiKey({ grants, id, label, subaccount, validIps: valid_ips = [] }) {
  return sparkpostApiRequest({
    type: 'UPDATE_API_KEY',
    meta: {
      method: 'PUT',
      url: `/v1/api-keys/${id}`,
      headers: setSubaccountHeader(subaccount),
      data: {
        grants,
        label,
        valid_ips,
      },
    },
  });
}

export function hideNewApiKey() {
  return {
    type: 'HIDE_NEW_API_KEY',
  };
}

export function listApiKeys(subaccount) {
  const headers = setSubaccountHeader(subaccount);

  return sparkpostApiRequest({
    type: 'LIST_API_KEYS',
    meta: {
      method: 'GET',
      url: '/v1/api-keys',
      headers,
      showErrorAlert: false,
    },
  });
}

export function listGrants() {
  return sparkpostApiRequest({
    type: 'LIST_GRANTS',
    meta: {
      method: 'GET',
      url: '/v1/authenticate/grants',
    },
  });
}

export function listSubaccountGrants() {
  return sparkpostApiRequest({
    type: 'LIST_SUBACCOUNT_GRANTS',
    meta: {
      method: 'GET',
      url: '/v1/authenticate/grants',
      params: {
        role: 'subaccount',
      },
    },
  });
}
