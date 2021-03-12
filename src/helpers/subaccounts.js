import _ from 'lodash';

export function setSubaccountQuery(id) {
  return _.isNil(id) ? '' : `?subaccount=${id}`;
}

export function setSubaccountHeader(subaccount = null) {
  const headers = {};

  if (subaccount !== null) {
    headers['x-msys-subaccount'] = _.get(subaccount, 'id', subaccount);
  }

  return headers;
}
