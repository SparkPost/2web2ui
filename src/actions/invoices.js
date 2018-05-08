import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';

export function list () {
  return sparkpostApiRequest({
    type: 'LIST_INVOICES',
    meta: {
      method: 'GET',
      url: '/account/invoices'
    }
  });
}
