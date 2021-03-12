import _ from 'lodash';
import { setSubaccountHeader } from 'src/helpers/subaccounts';

const LIKE_NON = new RegExp('non', 'i');
const LIKE_TRUE = new RegExp('true', 'i');

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

  return {
    method: 'PUT',
    url: '/v1/suppression-list',
    headers: setSubaccountHeader(subaccount),
    data: {
      recipients: sanitizedRecipients,
    },
  };
}
