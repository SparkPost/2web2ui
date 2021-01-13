/* eslint-disable lodash/prefer-immutable-method */
import { createSelector } from 'reselect';
import _ from 'lodash';
import {
  isAws,
  isCustomBilling,
  isSelfServeBilling,
  onPlan,
  onZuoraPlan,
  hasProductOnSubscription,
} from 'src/helpers/conditions/account';
import { selectCondition } from './accessConditionState';
import { getCurrentAccountPlan } from 'src/selectors/accessConditionState';
import moment from 'moment';

const suspendedSelector = state => state.account.isSuspendedForBilling;
const pendingSubscriptionSelector = state =>
  state.account.pending_subscription ||
  _.get(state, 'billing.subscription.pending_downgrades', []).length > 0;
const plansSelector = state => state.billing.bundlePlans || [];
const bundleSelector = state => state.billing.bundles || [];
const bundlePlanSelector = state => state.billing.bundlePlans || [];
const accountBillingSelector = state => state.account.billing;
const accountBilling = state => state.billing;
const selectIsAws = selectCondition(isAws);
const selectIsCustomBilling = selectCondition(isCustomBilling);
export const selectIsSelfServeBilling = selectCondition(isSelfServeBilling);
const selectIsCcFree1 = selectCondition(onPlan('ccfree1'));
const selectIsFree1 = selectCondition(onPlan('free1'));
const selectOnZuoraPlan = selectCondition(onZuoraPlan);
const hasDedicatedIpsOnSubscription = selectCondition(hasProductOnSubscription('dedicated_ip'));
export const hasOnlineSupport = selectCondition(hasProductOnSubscription('online_support'));
export const hasPhoneSupport = selectCondition(hasProductOnSubscription('phone_support'));
const selectBillingSubscription = state => state.billing.subscription || {};
const currentFreePlans = ['free500-1018', 'free15K-1018', 'free500-0419', 'free500-SPCEU-0419'];
export const isManuallyBilled = state => _.get(state, 'billing.subscription.type') === 'manual';
const getRecipientValidationUsageFromAccountApi = state =>
  _.get(state, 'account.rvUsage.recipient_validation');
//usage is in weird place in app, we have messaging usage being returned from
//GET account/include=usage but not all roles and tenants have access to this and
//we also have usage from GET /usage and more tenants and user have access to this.
//for specific roles that have access, its best to consult access library.
//https://github.com/SparkPost/access/blob/master/lib/token-access.js
const getTransmissionsUsageFromAccountApi = state => _.get(state, 'account.usage');
const getTransmissionsUsageFromUsageApi = state => _.get(state, 'usage.messaging');
const getSubscription = state => _.get(state, 'account.subscription');
const getBillingPeriod = state => _.get(state, 'account.subscription.period');
export const currentSubscriptionSelector = state => state.account.subscription;
/**
 * Returns current subscription's code
 * @param state
 * @return plan code
 */
export const currentPlanCodeSelector = createSelector(
  [currentSubscriptionSelector],
  (subscription = {}) => subscription.code,
);

/**
 * Returns current subscription's name
 * @param state
 * @return plan name
 */
export const currentPlanNameSelector = createSelector(
  [currentSubscriptionSelector],
  (subscription = {}) => subscription.name,
);

/**
 * Returns true if user does not have pending plan change or is not suspended
 */
export const canChangePlanSelector = createSelector(
  [suspendedSelector, pendingSubscriptionSelector, selectIsCustomBilling],
  (suspended, pendingSubscription, customBilling) =>
    !suspended && !pendingSubscription && !customBilling,
);

/**
 * Returns true if user has billing account and they are on a paid plan
 */
export const canUpdateBillingInfoSelector = createSelector(
  [getCurrentAccountPlan, accountBillingSelector, selectIsCcFree1],
  (currentPlan, accountBilling, isOnLegacyCcFreePlan) => {
    return accountBilling && (isOnLegacyCcFreePlan || !currentPlan.isFree);
  },
);
/*
return the promoCode related information from billing
*/
export const getPromoCodeObject = createSelector([accountBilling], billing => ({
  promoError: billing.promoError,
  promoPending: billing.promoPending,
  selectedPromo: billing.selectedPromo,
}));

export const selectAvailablePlans = createSelector(
  [plansSelector, selectIsAws, selectIsSelfServeBilling],
  (plans, isAws, isSelfServeBilling) => {
    const availablePlans = plans
      // only select AWS plans for AWS users
      .filter(({ awsMarketplace = false }) => awsMarketplace === isAws);

    if (!isSelfServeBilling) {
      _.remove(availablePlans, ({ isFree = false }) => isFree);
    }

    return availablePlans;
  },
);

export const selectVisiblePlans = createSelector(
  [selectAvailablePlans, selectIsFree1, currentPlanCodeSelector],
  (plans, isOnLegacyFree1Plan) =>
    plans.filter(
      ({ isFree, status }) => status === 'public' && !(isOnLegacyFree1Plan && isFree), //hide new free plans if on legacy free1 plan
    ),
);

export const selectAvailableBundles = createSelector(
  [bundleSelector, bundlePlanSelector, selectIsSelfServeBilling],
  (bundles, plans, isSelfServeBilling) => {
    if (!plans.length) {
      return []; //Waits for data to be ready to join
    }
    const availableBundles = bundles;
    if (!isSelfServeBilling) {
      _.remove(availableBundles, ({ isFree = false }) => isFree);
    }

    const plansByKey = _.keyBy(plans, 'plan');
    const bundlesWithPlans = _.map(availableBundles, bundle => {
      const messaging = plansByKey[bundle.bundle];
      return { ...bundle, messaging };
    });
    return bundlesWithPlans;
  },
);

export const currentBundleSelector = createSelector(
  [currentPlanCodeSelector, selectAvailableBundles],
  (currentPlanCode, bundles) => _.find(bundles, { bundle: currentPlanCode }) || {},
);

/**
 * Return true if plan can purchase IP and has billing info (except for aws as it'll be billed outside)
 */
export const canPurchaseIps = createSelector(
  [accountBillingSelector, selectIsAws, hasDedicatedIpsOnSubscription],
  (accountBilling, isAWSAccount, hasDedicatedIpsOnSubscription) => {
    return hasDedicatedIpsOnSubscription && !!(accountBilling || isAWSAccount);
  },
);

export const selectVisibleBundles = createSelector(
  [selectAvailableBundles, selectIsFree1, currentPlanCodeSelector],
  (bundles, isOnLegacyFree1Plan) =>
    bundles.filter(
      ({ isFree, status }) => status === 'public' && !(isOnLegacyFree1Plan && isFree), //hide new free plans if on legacy free1 plan
    ),
);

export const selectTieredVisibleBundles = createSelector([selectVisibleBundles], bundles => {
  const normalizedPlans = bundles.map(bundle => ({
    ...bundle,
    tier: bundle.tier || (currentFreePlans.includes(bundle.code) ? 'test' : 'default'),
  }));

  return _.groupBy(normalizedPlans, 'tier');
});

export const selectPlansByKey = createSelector([bundlePlanSelector], plans =>
  _.keyBy(plans, 'plan'),
);

export const selectAccount = state => state.account;

export const selectAccountBilling = createSelector([selectAccount], account => ({
  account,
  error: account.error || account.billingError,
  loading: account.loading || account.billingLoading || account.usageLoading,
}));

export const selectBillingInfo = createSelector(
  [
    canUpdateBillingInfoSelector,
    canChangePlanSelector,
    canPurchaseIps,
    getCurrentAccountPlan,
    selectOnZuoraPlan,
    selectVisiblePlans,
    selectIsAws,
    selectBillingSubscription,
  ],
  (
    canUpdateBillingInfo,
    canChangePlan,
    canPurchaseIps,
    currentPlan,
    onZuoraPlan,
    plans,
    isAWSAccount,
    subscription,
  ) => {
    return {
      canUpdateBillingInfo,
      canChangePlan,
      canPurchaseIps,
      currentPlan,
      onZuoraPlan,
      plans,
      isAWSAccount,
      subscription,
    };
  },
);

export const selectMonthlyRecipientValidationUsage = createSelector(
  getRecipientValidationUsageFromAccountApi,
  usage => _.get(usage, 'month.used', 0),
);

export const selectMonthlyTransmissionsUsage = createSelector(
  getTransmissionsUsageFromAccountApi,
  usage => _.get(usage, 'month.used', 0),
);

export const selectStartOfBillingPeriod = createSelector(
  [getTransmissionsUsageFromAccountApi, getBillingPeriod],
  (usage, billingPeriod) => {
    // IMPORTANT CAVEAT: This will not accurately return the billing period for annual plans due to an API limitation
    return _.get(usage, `${billingPeriod}.start`)
      ? moment(_.get(usage, `${billingPeriod}.start`))
          .utc()
          .format('YYYY-MM-DD') + 'T08:00:00.000Z' //added the T08:00:00.000Z to convert it actual time of when the bill run happens
      : undefined;
  },
);

export const selectEndOfBillingPeriod = createSelector(
  [getTransmissionsUsageFromAccountApi, getBillingPeriod],
  (usage, billingPeriod) => {
    // IMPORTANT CAVEAT: This will not accurately return the billing period for annual plans due to an API limitation
    return _.get(usage, `${billingPeriod}.end`)
      ? moment(_.get(usage, `${billingPeriod}.end`))
          .utc()
          .format('YYYY-MM-DD') + 'T08:00:00.000Z' //added the T08:00:00.000Z to convert it actual time of when the bill run happens
      : undefined;
  },
);

export const selectStartOfMonthlyUsage = createSelector(
  [getTransmissionsUsageFromUsageApi, getBillingPeriod],
  usage => {
    return (
      moment(_.get(usage, 'month.start'))
        .utc()
        .format('YYYY-MM-DD') + 'T08:00:00.000Z'
    );
  },
);

export const selectEndOfMonthlyUsage = createSelector(
  [getTransmissionsUsageFromUsageApi, getBillingPeriod],
  usage => {
    return (
      moment(_.get(usage, 'month.end'))
        .utc()
        .format('YYYY-MM-DD') + 'T08:00:00.000Z'
    );
  },
);
export const selectTransmissionsInPlan = createSelector(getSubscription, subscription =>
  _.get(subscription, 'plan_volume_per_period'),
);
