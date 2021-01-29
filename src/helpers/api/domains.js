export function getSendingDomains(params) {
  return {
    method: 'GET',
    url: '/v1/sending-domains',
    params,
  };
}
