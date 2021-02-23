import React, { useState, useEffect } from 'react';
import { Page, Panel } from 'src/components/matchbox';
import { connect } from 'react-redux';
import { formatDate, formatTime } from 'src/helpers/date';
import { getJobStatus, triggerJob } from 'src/actions/recipientValidation';
import { getBillingInfo } from 'src/actions/account';
import Loading from 'src/components/loading';
import { PageLink } from 'src/components/links';
import { RedirectAndAlert } from 'src/components/globalAlert';
import {
  selectRecipientValidationJobById,
  rvAddPaymentFormInitialValues,
} from 'src/selectors/recipientValidation';
import { isManuallyBilled } from 'src/selectors/accountBillingInfo';
import ListError from './components/ListError';
import ListProgress from './components/ListProgress';
import UploadedListForm from './components/UploadedListForm';
import ValidateSection from './components/ValidateSection';
import { FORMS } from 'src/constants';
import { reduxForm } from 'redux-form';
import { isProductOnSubscription, prepareCardInfo } from 'src/helpers/billing';
import addRVtoSubscription from 'src/actions/addRVtoSubscription';
import { getSubscription as getBillingSubscription } from 'src/actions/billing';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { isHeroku, isAzure } from 'src/helpers/conditions/user';
import { isAws } from 'src/helpers/conditions/account';
import { OGOnlyWrapper } from 'src/components/hibana';

import OGStyles from './UploadedListPage.module.scss';
import hibanaStyles from './UploadedListPageHibana.module.scss';
import useHibanaOverride from 'src/hooks/useHibanaOverride';

const FORMNAME = FORMS.RV_ADDPAYMENTFORM_UPLOADLISTPAGE;

export function UploadedListPage(props) {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  const {
    getJobStatus,
    listId,
    getBillingInfo,
    getBillingSubscription,
    billing,
    job,
    jobLoadingStatus,
    billing: { credit_card },
    billingLoading,
    valid,
    submitting,
    isRVonSubscription,
    addRVtoSubscriptionloading,
    addRVtoSubscriptionerror,
    triggerJob,
    isHeroku,
    isAzure,
    isAws,
  } = props;

  const [useSavedCC, setUseSavedCC] = useState(Boolean(billing.credit_card));

  useEffect(() => {
    getJobStatus(listId);
  }, [getJobStatus, listId]);
  useEffect(() => {
    if (!isHeroku && !isAzure && !isAws) {
      getBillingSubscription();
    }
  }, [getBillingSubscription, isAws, isAzure, isHeroku]);
  useEffect(() => {
    getBillingInfo();
  }, [getBillingInfo]);
  useEffect(() => {
    setUseSavedCC(Boolean(billing.credit_card));
  }, [billing]);

  const handleToggleCC = val => setUseSavedCC(!val);

  const handleSubmit = () => {
    triggerJob(listId);
  };

  const onSubmit = formValues => {
    const { addRVtoSubscription, isRVonSubscription, isManuallyBilled } = props;

    if (isRVonSubscription && (useSavedCC || isManuallyBilled)) {
      handleSubmit();
      return;
    }

    const values = formValues.card
      ? { ...formValues, card: prepareCardInfo(formValues.card) }
      : formValues;

    return addRVtoSubscription({
      values,
      updateCreditCard: !useSavedCC,
      isRVonSubscription: isRVonSubscription,
    }).then(() => handleSubmit());
  };

  if (!job && jobLoadingStatus === 'fail') {
    return (
      <RedirectAndAlert
        alert={{
          message: `Unable to find list ${listId}`,
          type: 'error',
        }}
        to="/recipient-validation"
      />
    );
  }

  if (jobLoadingStatus === 'pending') {
    return <Loading />;
  }

  if (addRVtoSubscriptionloading && !addRVtoSubscriptionerror) return <Loading />;

  return (
    <form onSubmit={props.handleSubmit(onSubmit)}>
      {' '}
      <Page
        title="Recipient Validation"
        breadcrumbAction={{ content: 'Back', as: PageLink, to: '/recipient-validation' }}
      >
        <Panel.LEGACY>
          <OGOnlyWrapper as={Panel.LEGACY.Section}>
            <div className={styles.dateHeader}>
              <strong>{formatDate(job.updatedAt)}</strong>
              <span> at </span>
              <strong>{formatTime(job.updatedAt)}</strong>
            </div>
          </OGOnlyWrapper>
          <OGOnlyWrapper as={Panel.LEGACY.Section}>
            {job.status === 'queued_for_batch' && (
              <UploadedListForm job={job} onSubmit={handleSubmit} />
            )}

            {job.status === 'error' && <ListError />}

            {job.status !== 'queued_for_batch' && job.status !== 'error' && (
              <ListProgress job={job} />
            )}
          </OGOnlyWrapper>
        </Panel.LEGACY>
        {job.status === 'queued_for_batch' && !billingLoading && (
          <ValidateSection
            credit_card={credit_card}
            formname={FORMNAME}
            submitDisabled={!valid || submitting}
            handleCardToggle={handleToggleCC}
            defaultToggleState={!useSavedCC}
            isProductOnSubscription={isRVonSubscription}
          />
        )}
      </Page>
    </form>
  );
}

const mapStateToProps = (state, props) => {
  const { listId } = props.match.params;

  return {
    listId,
    job: selectRecipientValidationJobById(state, listId),
    jobLoadingStatus: state.recipientValidation.jobLoadingStatus[listId] || 'pending',
    billing: state.account.billing || {},
    billingLoading: state.account.billingLoading,
    isRVonSubscription: isProductOnSubscription('recipient_validation')(state),
    initialValues: rvAddPaymentFormInitialValues(state),
    isManuallyBilled: isManuallyBilled(state),
    addRVtoSubscriptionloading: state.addRVtoSubscription.addRVtoSubscriptionloading,
    addRVtoSubscriptionerror: state.addRVtoSubscription.addRVtoSubscriptionerror,
    isHeroku: isHeroku(state),
    isAzure: isAzure(state),
    isAws: isAws(state),
  };
};

const formOptions = { form: FORMNAME, enableReinitialize: true };
export default withRouter(
  connect(mapStateToProps, {
    getJobStatus,
    triggerJob,
    getBillingInfo,
    addRVtoSubscription,
    getBillingSubscription,
  })(reduxForm(formOptions)(UploadedListPage)),
);
