export function getSubaccounts(params) {
  return {
    method: 'GET',
    url: '/v1/subaccounts',
    params: { ...params },
  };
}
