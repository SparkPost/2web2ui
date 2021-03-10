import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { reduxForm } from 'redux-form';
import qs from 'query-string';
import _ from 'lodash';
import {
  verifyPromoCode,
  clearPromoCode,
  updateSubscription,
  getSubscription,
} from 'src/actions/billing';
import billingCreate from 'src/actions/billingCreate';
import billingUpdate from 'src/actions/billingUpdate';
import { showAlert } from 'src/actions/globalAlert';
import { Form } from 'src/components/tracking/form';
import ApiErrorBanner from 'src/components/apiErrorBanner';
import Loading from 'src/components/loading';
import { prepareCardInfo } from 'src/helpers/billing';
import { usePageFilters } from 'src/hooks';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import { canUpdateBillingInfoSelector, getPromoCodeObject } from 'src/selectors/accountBillingInfo';
import { getCurrentAccountPlan } from 'src/selectors/accessConditionState';
import { changePlanInitialValues } from 'src/selectors/accountBillingForms';
import CardSection from '../components/CardSection';
import CurrentPlanSection from '../components/CurrentPlanSection';
import FeatureChangeSection from '../components/FeatureChangeSection';
import PlanSelectSection, { SelectedPlan } from '../components/PlanSelect';
import SubmitSection from '../components/SubmitSection';
import { useChangePlanContext } from '../context/ChangePlanContext';
import { FeatureChangeContextProvider } from '../context/FeatureChangeContext';
import OGStyles from './ChangePlanForm.module.scss';
import HibanaStyles from './ChangePlanFormHibana.module.scss';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';

const initFilters = {
  promo: { defaultValue: undefined },
  code: { defaultValue: undefined },
};

export const ChangePlanForm = ({
  location,
  //redux form
  handleSubmit,
  submitting,
  //Redux Props
  currentPlan,
  canUpdateBillingInfo,
  history,
  //Redux Actions
  verifyPromoCode,
  promoCodeObj,
  clearPromoCode,
  getSubscription,
  updateSubscription,
  billingUpdate,
  billingCreate,
  showAlert,
}) => {
  const styles = useHibanaOverride(OGStyles, HibanaStyles);
  const { billingCountries, account, bundles, loading, error } = useChangePlanContext();
  const { filters: { code, promo } = {}, resetFilters } = usePageFilters(initFilters);
  const [selectedBundleCode, selectBundle] = useState(code);
  const bundlesByCode = useMemo(() => _.keyBy(bundles, 'bundle'), [bundles]);
  const selectedBundle = bundlesByCode[selectedBundleCode];
  const isDowngradeToFree = _.get(selectedBundle, 'messaging.price') <= 0;
  const [useSavedCC, setUseSavedCC] = useState(null);
  const handleCardToggle = () => setUseSavedCC(!useSavedCC);
  const onSelect = bundle => {
    if (!bundle) {
      clearPromoCode();
      resetFilters();
    }
    selectBundle(bundle);
  };

  useEffect(() => {
    if (canUpdateBillingInfo && useSavedCC === null) {
      setUseSavedCC(true);
    }
  }, [canUpdateBillingInfo, useSavedCC]);

  const isPlanSelected = Boolean(selectedBundle && currentPlan.plan !== selectedBundle.bundle);
  const applyPromoCode = useCallback(
    promoCode => {
      const billingId = _.get(selectedBundle, 'messaging.billing_id');
      if (billingId) {
        verifyPromoCode({ promoCode, billingId, meta: { promoCode, showErrorAlert: false } });
      }
    },
    [selectedBundle, verifyPromoCode],
  );

  //Applies promo code if in query param
  useEffect(() => {
    if (promo && selectedBundle) {
      applyPromoCode(promo);
    }
  }, [applyPromoCode, promo, selectedBundle, verifyPromoCode]);

  const onSubmit = values => {
    const newCode = selectedBundleCode;
    const { selectedPromo } = promoCodeObj;
    const billingId = _.get(selectedBundle, 'messaging.billing_id');
    const isADowngrade = _.get(currentPlan, 'price') > _.get(selectedBundle, 'messaging.price');
    const cardValues =
      values.card && !isDowngradeToFree
        ? { ...values, card: prepareCardInfo(values.card) }
        : values;

    const newValues = {
      ...cardValues,
      bundle: newCode,
      billingId,
    };
    let action = Promise.resolve({});

    if (isDowngradeToFree) {
      return updateSubscription({ bundle: selectedBundleCode }).then(() => {
        history.push('/account/billing');
        showAlert({ type: 'success', message: 'Subscription Updated' });
      });
    }

    if (!_.isEmpty(selectedPromo) && !isDowngradeToFree) {
      newValues.promoCode = selectedPromo.promoCode;
      action = verifyPromoCode({
        promoCode: selectedPromo.promoCode,
        billingId,
        meta: { promoCode: selectedPromo.promoCode },
      });
    }
    return action
      .then(({ discount_id }) => {
        newValues.discountId = discount_id;
        // decides which action to be taken based on
        if (account.billing) {
          return useSavedCC || isDowngradeToFree
            ? updateSubscription({ bundle: newCode, promoCode: selectedPromo.promoCode })
            : billingUpdate(newValues);
        } else {
          return billingCreate(newValues); // creates Zuora account
        }
      })
      .then(() => clearPromoCode()) //TODO: Consolidate state of promocode between redux form and hook on PromoCodeNew
      .then(() => history.push('/account/billing'))
      .then(() => {
        getSubscription().then(result => {
          let eventType = SEGMENT_EVENTS.ACCOUNT_UPGRADED;
          if (isADowngrade) eventType = SEGMENT_EVENTS.ACCOUNT_DOWNGRADED;
          segmentTrack(eventType, {
            subscription: result,
          });
        });
      })
      .then(() => showAlert({ type: 'success', message: 'Subscription Updated' }));
  };

  if (error) {
    return (
      <ApiErrorBanner
        status="danger"
        message="We couldn't render the page. Reload to try again."
        reload={() => location.reload()}
        errorDetails={error.message}
      />
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} id="change-plan-form">
      <div className={styles.ChangePlanForm}>
        <div className={styles.CurrentPlanSection}>
          <CurrentPlanSection currentPlan={currentPlan} isPlanSelected={Boolean(selectedBundle)} />
        </div>
        <div className={styles.MainContent}>
          {isPlanSelected ? (
            <>
              <SelectedPlan
                bundle={selectedBundle}
                onChange={onSelect}
                promoCodeObj={promoCodeObj}
                handlePromoCode={{
                  applyPromoCode: applyPromoCode,
                  clearPromoCode: clearPromoCode,
                }}
              />
              <FeatureChangeContextProvider selectedBundle={selectedBundle}>
                <FeatureChangeSection />
                {!isDowngradeToFree && (
                  <CardSection
                    account={account}
                    countries={billingCountries}
                    selectedPlan={selectedBundle}
                    canUpdateBillingInfo={canUpdateBillingInfo}
                    submitting={submitting}
                    defaultToggleState={!useSavedCC}
                    handleCardToggle={handleCardToggle}
                  />
                )}

                <SubmitSection loading={submitting} />
              </FeatureChangeContextProvider>
            </>
          ) : (
            <PlanSelectSection onSelect={onSelect} bundles={bundles} currentPlan={currentPlan} />
          )}
        </div>
      </div>
    </Form>
  );
};

const mapStateToProps = (state, props) => {
  const { code: planCode, promo: promoCode } = qs.parse(props.location.search);

  return {
    initialValues: changePlanInitialValues(state, { planCode, promoCode }),
    canUpdateBillingInfo: canUpdateBillingInfoSelector(state),
    currentPlan: getCurrentAccountPlan(state),
    promoCodeObj: getPromoCodeObject(state),
  };
};

export default withRouter(
  connect(mapStateToProps, {
    verifyPromoCode,
    clearPromoCode,
    getSubscription,
    updateSubscription,
    billingUpdate,
    billingCreate,
    showAlert,
  })(
    reduxForm({
      form: 'changePlan',
      enableReinitialize: true,
    })(ChangePlanForm),
  ),
);
