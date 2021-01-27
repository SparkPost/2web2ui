import { createSelector } from 'reselect';
import _ from 'lodash';
import { getSubaccountsIndexedById, getSubaccountName } from './subaccounts';

const getTrackingDomains = state => state.trackingDomains.list;
const selectSubaccountFromProps = (state, props) => _.get(props, 'domain.subaccount_id', null);

export const selectDomains = createSelector(
  [getTrackingDomains, getSubaccountsIndexedById],
  (domains = [], subaccounts) =>
    domains.map(domain => ({
      ...domain,
      subaccount_name: getSubaccountName(subaccounts, domain['subaccount_id']),
    })),
);

export const convertStatus = ({ verified, compliance_status }) => {
  if (compliance_status !== 'valid') {
    return compliance_status;
  }
  if (!verified) {
    return 'unverified';
  }
  return 'verified';
};

export const selectTrackingDomainsAreLoaded = createSelector(
  [getTrackingDomains],
  trackingDomains => !!trackingDomains,
);

export const selectTrackingDomainsList = createSelector(
  [getTrackingDomains],
  (trackingDomains = []) =>
    trackingDomains.map(item => ({
      ...item,
      verified: item.status.verified,
      status: convertStatus(item.status),
    })),
);

export const selectTrackingDomainsListHibana = createSelector(
  [getTrackingDomains],
  trackingDomains => {
    if (!trackingDomains) return undefined;

    return trackingDomains.map(item => {
      const resolvedStatus = convertStatus(item.status);

      return {
        ...item,
        verified: item.status.verified,
        status: convertStatus(item.status),
        blocked: resolvedStatus === 'blocked',
        unverified: resolvedStatus === 'unverified',
        defaultTrackingDomain: item.default,
      };
    });
  },
);

export const selectUnverifiedTrackingDomains = createSelector(
  [selectTrackingDomainsList],
  trackingDomains => trackingDomains.filter(item => !item.verified),
);

// currently used to just get domains owned by a subaccount/primary account
export const selectVerifiedTrackingDomains = createSelector(
  [selectTrackingDomainsList, selectSubaccountFromProps],
  (trackingDomains, subaccount) =>
    trackingDomains.filter(domain => {
      if (!domain.verified) {
        return false;
      }

      return subaccount ? domain.subaccount_id === Number(subaccount) : !domain.subaccount_id;
    }),
);

export const selectVerifiedTrackingDomainsOptions = createSelector(
  [selectVerifiedTrackingDomains],
  trackingDomains => trackingDomains.map(item => ({ label: item.domain, value: item.domain })),
);

export const selectDefaultTrackingDomainOption = createSelector(
  [selectVerifiedTrackingDomains],
  trackingDomains => {
    const defaultDomain = _.find(trackingDomains, { default: true });
    const defaultOption = defaultDomain ? defaultDomain.domain : 'System Default';
    // setting to empty string resets the tracking domain
    return [{ label: `Always Use Default (Currently ${defaultOption})`, value: '' }];
  },
);

export const selectTrackingDomainsOptions = createSelector(
  [selectVerifiedTrackingDomainsOptions, selectDefaultTrackingDomainOption],
  (verified, defaultDomain) => defaultDomain.concat(verified),
);

export const selectTrackingDomainsRows = createSelector([selectDomains], (domains = []) => {
  return domains.map(trackingDomain => {
    const {
      domain,
      status,
      shared_with_subaccounts,
      subaccount_name,
      subaccount_id,
      default: defaultTrackingDomain,
    } = trackingDomain;
    const resolvedStatus = convertStatus(status);

    return {
      domainName: domain,
      sharedWithSubaccounts: shared_with_subaccounts,
      subaccountName: subaccount_name,
      subaccountId: subaccount_id,
      blocked: resolvedStatus === 'blocked',
      unverified: resolvedStatus === 'unverified',
      verified: resolvedStatus === 'verified',
      defaultTrackingDomain,
    };
  });
});
