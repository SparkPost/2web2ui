import sparkpostApiRequest from 'src/actions/helpers/sparkpostLabsRequest';

export function createRecipientVerificationList(data) {
  return sparkpostApiRequest({
    type: 'CREATE_RECIPIENT_VERIFICATION_LIST',
    meta: {
      method: 'POST',
      url: '/list-hygiene-api',
      data
    }
  });
}
