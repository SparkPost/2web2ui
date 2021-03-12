import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';
import { setSubaccountHeader } from 'src/helpers/subaccounts';

export function submitRTBFRequest({ subaccountId, ...values }, meta = {}) {
  return sparkpostApiRequest({
    type: 'POST_RTBF_REQUEST',
    meta: {
      method: 'POST',
      headers: setSubaccountHeader(subaccountId),
      url: '/v1/data-privacy/rtbf-request',
      data: values,
      include_subaccounts: subaccountId ? true : false,
      ...meta,
    },
  });
}

export function submitOptOutRequest({ subaccountId, ...values }, meta = {}) {
  return sparkpostApiRequest({
    type: 'POST_OPTOUT_REQUEST',
    meta: {
      method: 'POST',
      headers: setSubaccountHeader(subaccountId),
      url: '/v1/data-privacy/opt-out-request',
      data: values,
      include_subaccounts: subaccountId ? true : false,
      ...meta,
    },
  });
}

export function resetDataPrivacy() {
  return {
    type: 'DATA_PRIVACY_RESET',
  };
}
