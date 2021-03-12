import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';
import { setSubaccountHeader } from 'src/helpers/subaccounts';

export const clearSnippet = () => ({ type: 'CLEAR_SNIPPET' });

export const createSnippet = ({
  html,
  id,
  name,
  sharedWithSubaccounts = false,
  subaccountId,
  text,
  amp_html,
}) =>
  sparkpostApiRequest({
    type: 'CREATE_SNIPPET',
    meta: {
      method: 'POST',
      headers: setSubaccountHeader(subaccountId),
      url: '/labs/snippets',
      data: {
        // undefined content parts will not be sent with request
        content: {
          html,
          text,
          amp_html,
        },
        id,
        name,
        shared_with_subaccounts: subaccountId ? false : sharedWithSubaccounts,
      },
    },
  });

export const getSnippet = ({ id, subaccountId }) =>
  sparkpostApiRequest({
    type: 'GET_SNIPPET',
    meta: {
      method: 'GET',
      headers: setSubaccountHeader(subaccountId),
      url: `/labs/snippets/${id}`,
      context: { id, subaccountId },
    },
  });

export const getSnippets = () =>
  sparkpostApiRequest({
    type: 'GET_SNIPPETS',
    meta: {
      method: 'GET',
      url: '/labs/snippets',
    },
  });

export const deleteSnippet = ({ id, subaccountId }) =>
  sparkpostApiRequest({
    type: 'DELETE_SNIPPET',
    meta: {
      method: 'DELETE',
      url: `/labs/snippets/${id}`,
      headers: setSubaccountHeader(subaccountId),
      context: { id, subaccountId },
    },
  });

export const updateSnippet = ({
  html,
  id,
  name,
  sharedWithSubaccounts = false,
  subaccountId,
  text,
  amp_html,
}) =>
  sparkpostApiRequest({
    type: 'UPDATE_SNIPPET',
    meta: {
      method: 'PUT',
      headers: setSubaccountHeader(subaccountId),
      url: `/labs/snippets/${id}`,
      data: {
        // undefined content parts will not be sent with request
        content: {
          html,
          text,
          amp_html,
        },
        name,
        shared_with_subaccounts: subaccountId ? false : sharedWithSubaccounts,
      },
    },
  });
