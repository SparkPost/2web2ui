import React from 'react';
import { connect } from 'react-redux';
import { ROLES } from 'src/constants';
import hasGrants from 'src/helpers/conditions/hasGrants';
import { hasRole, isAdmin } from 'src/helpers/conditions/user';
import { hasAccountOptionEnabled } from 'src/helpers/conditions/account';
import { isManuallyBilled } from 'src/selectors/accountBillingInfo';
import { fetch as getAccount, getUsage } from 'src/actions/account';
import { listAlerts } from 'src/actions/alerts';
import { selectRecentlyTriggeredAlerts } from 'src/selectors/alerts';
import {
  currentPlanNameSelector,
  selectTransmissionsInPlan,
  selectMonthlyRecipientValidationUsage,
  selectMonthlyTransmissionsUsage,
  selectEndOfBillingPeriod,
} from 'src/selectors/accountBillingInfo';
import { DashboardContextProvider } from './context/DashboardContext';
import DashboardPageV2 from './DashboardPageV2';
import { selectApiKeysForSending } from 'src/selectors/api-keys';
import { listApiKeys } from 'src/actions/api-keys';
import { selectVerifiedDomains } from 'src/selectors/sendingDomains';
import { list as listSendingDomains } from 'src/actions/sendingDomains';
import { getReports } from 'src/actions/reports';
import OGDashbaordPage from 'src/pages/dashboard';
import useHibanaToggle from 'src/hooks/useHibanaToggle';

function mapStateToProps(state) {
  const isAnAdmin = isAdmin(state);
  const isDev = hasRole(ROLES.DEVELOPER)(state);
  const isTemplatesUser = hasRole(ROLES.TEMPLATES)(state);
  const isReportingUser = hasRole(ROLES.REPORTING)(state);
  let verifySendingLink = '/domains/list/sending';
  // TODO: https://sparkpost.atlassian.net/browse/FE-1249 - rvUsage rename
  let lastUsageDate = state?.account?.rvUsage?.messaging?.last_usage_date;

  const sendingDomains = state.sendingDomains.list;
  const verifiedDomains = selectVerifiedDomains(state);
  const apiKeysForSending = selectApiKeysForSending(state);
  const canViewUsage = hasGrants('usage/view')(state);
  const canManageApiKeys = hasGrants('api_keys/manage')(state);
  const canManageSendingDomains = hasGrants('sending_domains/manage')(state);
  const isOnPrem = hasAccountOptionEnabled('allow_events_ingest');

  let onboarding = 'done';
  if (!isOnPrem && lastUsageDate === null && (isAnAdmin || isDev)) {
    let addSendingDomainNeeded;
    let verifySendingNeeded;
    let createApiKeyNeeded;

    if (canManageSendingDomains) {
      addSendingDomainNeeded = sendingDomains.length === 0;
      if (addSendingDomainNeeded) onboarding = 'addSending';

      verifySendingNeeded = !addSendingDomainNeeded && verifiedDomains.length === 0;
      if (verifySendingNeeded) onboarding = 'verifySending';
    }

    // TODO: Has d12y + free sending, "no";
    // TODO: Has d12y + free sending, "yes";
    if (!addSendingDomainNeeded && !verifySendingNeeded && canManageApiKeys) {
      createApiKeyNeeded = !verifySendingNeeded && apiKeysForSending.length === 0;
      if (createApiKeyNeeded) onboarding = 'createApiKey';
    }

    if (!addSendingDomainNeeded && !verifySendingNeeded && !createApiKeyNeeded)
      onboarding = 'startSending';
  } else if (!isOnPrem && lastUsageDate === null && (isTemplatesUser || isReportingUser)) {
    onboarding = 'analyticsReportPromo';
  }

  if (onboarding && onboarding === 'verifySending' && sendingDomains.length === 1) {
    verifySendingLink = `/domains/details/sending-bounce/${sendingDomains[0].domain}`;
  }

  const isPending =
    state.account.loading ||
    state.apiKeys.keysLoading ||
    state.sendingDomains.listLoading ||
    state.account.usageLoading ||
    state.alerts.listPending;

  return {
    verifySendingLink,
    onboarding,
    canViewUsage,
    canManageSendingDomains,
    canManageApiKeys,
    isAnAdmin,
    isDev,
    currentUser: state.currentUser,
    currentPlanName: currentPlanNameSelector(state),
    recentAlerts: selectRecentlyTriggeredAlerts(state),
    transmissionsThisMonth: selectMonthlyTransmissionsUsage(state),
    transmissionsInPlan: selectTransmissionsInPlan(state),
    validationsThisMonth: selectMonthlyRecipientValidationUsage(state),
    endOfBillingPeriod: selectEndOfBillingPeriod(state),
    pending: isPending,
    hasUpgradeLink: hasGrants('account/manage')(state) && !isManuallyBilled(state),
    hasUsageSection: isAdmin(state),
    reports: state.reports.list,
  };
}

const mapDispatchToProps = {
  getAccount,
  getReports,
  listAlerts,
  getUsage,
  listSendingDomains,
  listApiKeys,
};

export const DashboardPageContainerV2 = connect(
  mapStateToProps,
  mapDispatchToProps,
)(props => {
  return (
    <DashboardContextProvider value={props}>
      <DashboardPageV2 />
    </DashboardContextProvider>
  );
});

export default function DashboardV2(props) {
  return useHibanaToggle(OGDashbaordPage, DashboardPageContainerV2)(props);
}
