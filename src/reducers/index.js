import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';

import acceptedReport from './acceptedReport';
import accessControlReady from './accessControlReady';
import account from './account';
import accountSingleSignOn from './accountSingleSignOn';
import abTesting from './abTesting';
import addRVtoSubscription from './addRVtoSubscription';
import alerts from './alerts';
import apiKeys from './api-keys';
import auth from './auth';
import billing from './billing';
import billingCreate from './billingCreate';
import bounceReport from './bounceReport';
import blocklist from './blocklist';
import cookieConsent from './cookieConsent';
import delayReport from './delayReport';
import dataPrivacy from './dataPrivacy';
import engagementReport from './engagementReport';
import rejectionReport from './rejectionReport';
import currentUser from './currentUser';
import globalAlert from './globalAlert';
import invoices from './invoices';
import ipPools from './ipPools';
import messageEvents from './messageEvents';
import metrics from './metrics';
import passwordReset from './passwordReset';
import recipientLists from './recipientLists';
import recipientValidation from './recipientValidation';
import reportOptions from './reportOptions';
import reports from './reports';
import scimToken from './scimToken';
import sendingDomains from './sendingDomains';
import sendingIps from './sendingIps';
import signalOptions from './signalOptions';
import signals from './signals';
import snippets from './snippets';
import subaccounts from './subaccounts';
import summaryChart from './summaryChart';
import summaryTables from './summaryTables';
import support from './support';
import suppressions from './suppressions';
import templates from './templates';
import users from './users';
import tfa from './tfa';
import tfaBackupCodes from './tfaBackupCodes';
import trackingDomains from './trackingDomains';
import typeahead from './typeahead';
import webhooks from './webhooks';
import websiteAuth from './websiteAuth';
import inboxPlacement from './inboxPlacement';
import ingestBatchEvents from './ingestBatchEvents';

const appReducer = combineReducers({
  abTesting,
  acceptedReport,
  accessControlReady,
  account,
  accountSingleSignOn,
  addRVtoSubscription,
  alerts,
  apiKeys,
  auth,
  billing,
  billingCreate,
  blocklist,
  bounceReport,
  cookieConsent,
  currentUser,
  dataPrivacy,
  delayReport,
  engagementReport,
  scimToken,
  globalAlert,
  form,
  inboxPlacement,
  invoices,
  ingestBatchEvents,
  ipPools,
  metrics,
  messageEvents,
  passwordReset,
  reportOptions,
  reports,
  recipientLists,
  recipientValidation,
  rejectionReport,
  sendingDomains,
  sendingIps,
  signalOptions,
  signals,
  snippets,
  subaccounts,
  support,
  summaryChart,
  summaryTables,
  suppressions,
  templates,
  tfa,
  tfaBackupCodes,
  trackingDomains,
  typeahead,
  users,
  webhooks,
  websiteAuth,
});

/**
 * Resets state to initial values on log out
 */
export default (state, action) => {
  if (action.type === 'LOGOUT') {
    state = undefined;
  }

  return appReducer(state, action);
};
