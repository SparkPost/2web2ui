/* eslint-disable max-lines */
import moment from 'moment';
import config from 'src/config';
import _ from 'lodash';
import csvFileParseRequest, { hasData, hasField } from 'src/actions/helpers/csvFileParseRequest';
import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';
import { setSubaccountHeader } from 'src/helpers/subaccounts';

const { apiDateFormat } = config;

export function searchRecipient({ email, subaccountId } = {}) {
  return sparkpostApiRequest({
    type: 'SEARCH_SUPPRESSIONS_RECIPIENT',
    meta: {
      method: 'GET',
      url: `/v1/suppression-list/${encodeURIComponent(email)}`,
      headers: setSubaccountHeader(subaccountId),
    },
  });
}

export function searchSuppressions(options) {
  const { dateOptions, types = [], sources = [] } = options;
  const { from, to } = dateOptions;

  const params = {};

  if (from) {
    params.from = moment(from)
      .utc()
      .format(apiDateFormat);
  }

  if (to) {
    params.to = moment(to)
      .utc()
      .format(apiDateFormat);
  }

  if (!_.isEmpty(types)) {
    params.types = types.join(',');
  }

  if (!_.isEmpty(sources)) {
    params.sources = sources.join(',');
  }

  return sparkpostApiRequest({
    type: 'GET_SUPPRESSIONS',
    meta: {
      method: 'GET',
      url: '/v1/suppression-list',
      params,
    },
  });
}

export function deleteSuppression(suppression) {
  const { recipient, subaccount_id: subaccountId, type } = suppression;

  return sparkpostApiRequest({
    type: 'DELETE_SUPPRESSION',
    meta: {
      method: 'DELETE',
      url: `/v1/suppression-list/${encodeURIComponent(recipient)}`,
      headers: setSubaccountHeader(subaccountId),
      data: { type },
      suppression,
    },
  });
}

const LIKE_NON = new RegExp('non', 'i');
const LIKE_TRUE = new RegExp('true', 'i');

// SEE: https://developers.sparkpost.com/api/suppression-list.html#suppression-list-bulk-insert-update-put
export function createOrUpdateSuppressions(recipients, subaccount) {
  const sanitizedRecipients = recipients.map(
    ({ description, email, non_transactional, recipient, transactional, type }) => {
      // Convert deprecated type fields
      if (!type && LIKE_TRUE.test(transactional)) {
        type = 'transactional';
      }
      if (!type && LIKE_TRUE.test(non_transactional)) {
        type = 'non_transactional';
      }

      // Format type value to provide a better user experience
      if (type && LIKE_NON.test(type)) {
        type = 'non_transactional';
      }
      if (type && !LIKE_NON.test(type)) {
        type = 'transactional';
      }

      // Convert deprecated recipient fields
      if (email && !recipient) {
        recipient = email;
      }

      // Trim whitespace from recipient email (FAD-5095)
      return { description, recipient: _.trim(recipient), type };
    },
  );

  return sparkpostApiRequest({
    type: 'CREATE_OR_UPDATE_SUPPRESSIONS',
    meta: {
      method: 'PUT',
      url: '/v1/suppression-list',
      headers: setSubaccountHeader(subaccount),
      data: {
        recipients: sanitizedRecipients,
      },
      showErrorAlert: false,
    },
  });
}

export function parseSuppressionsFile(file) {
  return csvFileParseRequest({
    type: 'PARSE_SUPPRESSIONS_FILE',
    meta: {
      file,
      validate: [
        hasData,
        hasField('recipient', 'email'),
        hasField('type', 'non_transactional', 'transactional'),
      ],
    },
  });
}

export function uploadSuppressions(file, subaccount) {
  return async dispatch => {
    const recipients = await dispatch(parseSuppressionsFile(file));
    return dispatch(createOrUpdateSuppressions(recipients, subaccount));
  };
}

export function resetErrors() {
  return {
    type: 'RESET_SUPPRESSION_ERRORS',
  };
}

/**
 * Refreshes the date range for suppressions
 *
 * Calculates relative ranges if a non-custom relativeRange value is present,
 * which will override passed in from/to dates
 *
 * @param {Object} dateOptions
 * @param {Date} dateOptions.from
 * @param {Date} dateOptions.to
 * @param {String} dateOptions.relativeRange
 */
export function refreshSuppressionDateRange(dateOptions) {
  return {
    type: 'REFRESH_SUPPRESSION_SEARCH_DATE_OPTIONS',
    payload: dateOptions,
  };
}

export function updateSuppressionSearchOptions(options) {
  return {
    type: 'UPDATE_SUPPRESSION_SEARCH_OPTIONS',
    payload: options,
  };
}
