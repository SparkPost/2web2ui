import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';
import setSubaccountHeader from './helpers/setSubaccountHeader';
import { showAlert } from './globalAlert';

export function listTrackingDomains() {
  return sparkpostApiRequest({
    type: 'LIST_TRACKING_DOMAINS',
    meta: {
      method: 'GET',
      url: '/v1/tracking-domains',
      showErrorAlert: false,
    },
  });
}

export function createTrackingDomain({ subaccount, ...data }) {
  return dispatch =>
    dispatch(
      sparkpostApiRequest({
        type: 'CREATE_TRACKING_DOMAIN',
        meta: {
          method: 'POST',
          url: '/v1/tracking-domains',
          headers: setSubaccountHeader(subaccount),
          data,
        },
      }),
    ).then(() =>
      dispatch(showAlert({ type: 'success', message: `Successfully added ${data.domain}` })),
    );
}

export function updateTrackingDomain({ domain, subaccount = null, ...data }) {
  return dispatch =>
    dispatch(
      sparkpostApiRequest({
        type: 'UPDATE_TRACKING_DOMAIN',
        meta: {
          method: 'PUT',
          url: `/v1/tracking-domains/${domain}`,
          headers: setSubaccountHeader(subaccount),
          data,
          domain,
        },
      }),
    ).then(() =>
      dispatch(showAlert({ type: 'success', message: `Successfully updated ${domain}` })),
    );
}

export function deleteTrackingDomain({ domain, subaccountId }) {
  return dispatch =>
    dispatch(
      sparkpostApiRequest({
        type: 'DELETE_TRACKING_DOMAIN',
        meta: {
          method: 'DELETE',
          url: `/v1/tracking-domains/${domain}`,
          headers: setSubaccountHeader(subaccountId),
          domain,
        },
      }),
    ).then(() =>
      dispatch(showAlert({ type: 'success', message: `Successfully deleted ${domain}` })),
    );
}

export function verifyTrackingDomain({ domain, subaccountId }) {
  return dispatch =>
    dispatch(
      sparkpostApiRequest({
        type: 'VERIFY_TRACKING_DOMAIN',
        meta: {
          method: 'POST',
          url: `/v1/tracking-domains/${domain}/verify`,
          headers: setSubaccountHeader(subaccountId),
          domain,
        },
      }),
    ).then(() =>
      dispatch(
        showAlert({ type: 'success', message: `Successfully verified CNAME for ${domain}` }),
      ),
    );
}
