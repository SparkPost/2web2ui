import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';

export function list() {
  return sparkpostApiRequest({
    type: 'LIST_SUBACCOUNTS',
    meta: {
      method: 'GET',
      url: '/subaccounts'
    }
  });
}
