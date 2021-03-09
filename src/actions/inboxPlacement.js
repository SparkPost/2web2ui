import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';

export function getSeedList() {
  return sparkpostApiRequest({
    type: 'GET_SEEDS',
    meta: {
      method: 'GET',
      url: '/v1/inbox-placement/seeds',
    },
  });
}
