/* eslint-disable max-lines */
import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';
import { getTestDataKey, shapeContent } from './helpers/templates';
import { setSubaccountHeader } from 'src/helpers/subaccounts';

export function listTemplates() {
  return sparkpostApiRequest({
    type: 'LIST_TEMPLATES',
    meta: {
      method: 'GET',
      url: '/v1/templates',
      showErrorAlert: false,
    },
  });
}

export function getDraft(id, subaccountId) {
  return sparkpostApiRequest({
    type: 'GET_DRAFT_TEMPLATE',
    meta: {
      method: 'GET',
      url: `/v1/templates/${id}`,
      headers: setSubaccountHeader(subaccountId),
    },
  });
}

// @todo Switch to the newer preview endpoint
// @see https://github.com/SparkPost/sparkpost-admin-api-documentation/blob/master/services/content_previewer_api.md#preview-inline-content-post
// @see https://github.com/SparkPost/sparkpost-api-documentation/blob/master/services/templates.md#preview-templatesidpreviewdraft
export function getPreview({ content, id, mode, subaccountId, substitution_data = {} }) {
  return sparkpostApiRequest({
    type: 'GET_TEMPLATE_PREVIEW',
    meta: {
      context: { id, mode },
      method: 'POST',
      url: '/v1/utils/content-previewer',
      data: { content, substitution_data },
      headers: setSubaccountHeader(subaccountId),
      showErrorAlert: false,
    },
  });
}

export function getPublished(id, subaccountId) {
  return sparkpostApiRequest({
    type: 'GET_PUBLISHED_TEMPLATE',
    meta: {
      method: 'GET',
      url: `/v1/templates/${id}`,
      params: { draft: false },
      headers: setSubaccountHeader(subaccountId),
      showErrorAlert: false,
    },
  });
}

export function create(data) {
  const { id, sharedWithSubaccounts, subaccount, content, parsedTestData, ...formData } = data;

  return dispatch => {
    dispatch(
      setTestData({
        id,
        mode: 'draft',
        data: parsedTestData,
      }),
    );

    return dispatch(
      sparkpostApiRequest({
        type: 'CREATE_TEMPLATE',
        meta: {
          method: 'POST',
          url: '/v1/templates',
          headers: setSubaccountHeader(subaccount),
          data: {
            ...formData,
            id,
            content: shapeContent(content),
            shared_with_subaccounts: sharedWithSubaccounts,
          },
        },
      }),
    );
  };
}

export function update(data, subaccountId, params = {}) {
  const { id, parsedTestData, content, ...formData } = data;

  return dispatch => {
    dispatch(
      setTestData({
        id,
        mode: 'draft',
        data: parsedTestData,
      }),
    );

    return dispatch(
      sparkpostApiRequest({
        type: 'UPDATE_TEMPLATE',
        meta: {
          method: 'PUT',
          url: `/v1/templates/${id}`,
          data: {
            ...formData,
            content: shapeContent(content),
          },
          params,
          headers: setSubaccountHeader(subaccountId),
          context: {
            id,
          },
        },
      }),
    );
  };
}

export function publish(data, subaccountId) {
  return async dispatch => {
    const { id, parsedTestData } = data;

    dispatch({ type: 'PUBLISH_ACTION_PENDING' });

    try {
      await dispatch(update(data, subaccountId));
      dispatch(setTestData({ id, mode: 'published', data: parsedTestData }));

      await dispatch(
        sparkpostApiRequest({
          type: 'PUBLISH_TEMPLATE',
          meta: {
            method: 'PUT',
            url: `/v1/templates/${id}`,
            data: { published: true },
            headers: setSubaccountHeader(subaccountId),
          },
        }),
      );

      dispatch({ type: 'PUBLISH_ACTION_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'PUBLISH_ACTION_FAIL' });
    }
  };
}

export function deleteTemplate({ id, subaccountId }) {
  return dispatch => {
    dispatch(deleteTestData({ id }));

    return dispatch(
      sparkpostApiRequest({
        type: 'DELETE_TEMPLATE',
        meta: {
          method: 'DELETE',
          url: `/v1/templates/${id}`,
          headers: setSubaccountHeader(subaccountId),
        },
      }),
    );
  };
}

export function setTestData({ data, id, mode }) {
  return (dispatch, getState) => {
    const username = getState().currentUser.username;
    const testData = typeof data === 'object' ? JSON.stringify(data) : data;

    return window.localStorage.setItem(getTestDataKey({ id, username, mode }), testData);
  };
}

export function deleteTestData({ id }) {
  return (dispatch, getState) => {
    const username = getState().currentUser.username;
    const deleteItems = () => {
      window.localStorage.removeItem(getTestDataKey({ id, username, mode: 'draft' }));
      window.localStorage.removeItem(getTestDataKey({ id, username, mode: 'published' }));
    };

    return deleteItems();
  };
}

export function getTestData({ id, mode }) {
  return (dispatch, getState) => {
    const username = getState().currentUser.username;
    const rawData = window.localStorage.getItem(getTestDataKey({ id, username, mode }));

    try {
      return JSON.parse(rawData) || {};
    } catch {
      return {};
    }
  };
}

export function sendPreview({ id, mode, emails, from, subaccountId }) {
  const recipients = emails.map(email => ({
    address: { email },
  }));

  return async dispatch => {
    const testData = await dispatch(getTestData({ id, mode }));

    return dispatch(
      sparkpostApiRequest({
        type: 'SEND_PREVIEW_TRANSMISSION',
        meta: {
          method: 'POST',
          url: '/v1/transmissions',
          headers: setSubaccountHeader(subaccountId),
          data: {
            ...testData,
            content: {
              template_id: id,
              use_draft_template: mode === 'draft',
            },
            options: {
              ...testData.options,
              sandbox: /sparkpostbox.com$/i.test(from),
            },
            recipients,
          },
        },
      }),
    );
  };
}
