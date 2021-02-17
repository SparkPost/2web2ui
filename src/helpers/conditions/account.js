import { any, all } from './compose';
import _ from 'lodash';

export const onPlan = planCode => ({ accountPlan }) => accountPlan.code === planCode;
export const onZuoraPlan = ({ accountPlan }) => Boolean(accountPlan.billingId);
export const onPlanWithStatus = status => ({ accountPlan }) => {
  return accountPlan.status === status;
};
export const onServiceLevel = level => ({ account }) => account.service_level === level;
export const isEnterprise = any(onPlan('ent1'), onServiceLevel('enterprise'));
export const hasStatus = status => ({ account }) => account.status === status;
export const hasStatusReasonCategory = category => ({ account }) =>
  account.status_reason_category === category;
export const isSuspendedForBilling = all(hasStatus('suspended'), hasStatusReasonCategory('100.01'));
export const subscriptionSelfServeIsTrue = ({ account }) =>
  _.get(account, 'subscription.self_serve', false);
const SELF_SERVE_ACCOUNT_TYPES = ['active', 'inactive', 'none'];

// Does not get the subscription by default as part of access control. Only admins have access to billing.subscription
export const isBillingSubscriptionSelfServe = ({ subscription }) =>
  _.includes(SELF_SERVE_ACCOUNT_TYPES, _.get(subscription, 'type'));

export const isAws = ({ account }) => _.get(account, 'subscription.type') === 'aws';
export const isManuallyBilled = ({ account }) => _.get(account, 'subscription.type') === 'manual';
export const isCustomBilling = ({ account }) => _.get(account, 'subscription.custom', false);
export const isSelfServeBilling = any(subscriptionSelfServeIsTrue, isAws);

export const isAccountUiOptionSet = (option, defaultValue) => ({ account }) => {
  return Boolean(_.get(account.options, `ui.${option}`, defaultValue));
};
export const isSubscriptionPending = ({ account }) => Boolean(account.pending_subscription);
export const hasAccountOptionEnabled = option => ({ account }) =>
  Boolean(_.get(account.options, option, false));
export const getAccountUiOptionValue = option => ({ account }) =>
  _.get(account.options, `ui.${option}`);

export const hasProductOnBillingSubscription = product => ({ billing }) => {
  return !_.isEmpty(_.find(billing?.subscription?.products, { product: product }));
};
export const hasProductOnSubscription = product => ({ accountPlan }) => {
  return !_.isEmpty(_.find(accountPlan.products, { product: product }));
};
