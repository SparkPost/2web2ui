import React, { Component } from 'react';
import { LabelledValue } from 'src/components';
import { PageLink } from 'src/components/links';
import { Panel, Modal, Text } from 'src/components/matchbox';
import { ButtonLink } from 'src/components/links';
import {
  PremiumBanner,
  EnterpriseBanner,
  PendingPlanBanner,
  FreePlanWarningBanner,
} from './Banners';
import UpdatePaymentForm from '../forms/UpdatePaymentForm';
import UpdateContactForm from '../forms/UpdateContactForm';
import AddIps from '../forms/AddIps';
import DedicatedIpSummarySection from './DedicatedIpSummarySection';
import InvoiceHistory from './InvoiceHistory';
import CardSummary from 'src/components/billing/CardSummary';
import PlanSummary from './PlanSummary';
import RecipientValidationCostModal from 'src/components/billing/RecipientValidationCostModal';
import { formatFullNumber } from 'src/helpers/units';
import totalRVCost from 'src/helpers/recipientValidation';
import _ from 'lodash';
import { formatDateTime } from 'src/helpers/date';

const PAYMENT_MODAL = 'Update Payment Information';
const CONTACT_MODAL = 'Update Billing Contact';
const IP_MODAL = 'Add Dedicated Ips';
const RV_MODAL = 'Recipient Validation Expense Calculation';

export default class BillingSummary extends Component {
  state = {
    show: false,
  };

  handleModal = (modal = false) => {
    this.setState({ show: this.state.show ? false : modal });
  };

  handlePaymentModal = () => this.handleModal(PAYMENT_MODAL);
  handleContactModal = () => this.handleModal(CONTACT_MODAL);
  handleIpModal = () => this.handleModal(IP_MODAL);
  handleRvModal = () => this.handleModal(RV_MODAL, true);

  renderSummary = () => {
    const { account } = this.props;
    const { billing } = account;
    return (
      <Panel.LEGACY title="Billing" data-id="billing-panel">
        <Panel.LEGACY.Section
          actions={[
            {
              content: 'Update Payment Information',
              onClick: this.handlePaymentModal,
              color: 'orange',
            },
          ]}
        >
          <CardSummary label="Credit Card" credit_card={billing.credit_card} />
        </Panel.LEGACY.Section>
        <Panel.LEGACY.Section
          actions={[
            {
              content: 'Update Billing Contact',
              onClick: this.handleContactModal,
              color: 'orange',
            },
          ]}
        >
          <LabelledValue label="Billing Contact">
            <h6>
              {billing.first_name} {billing.last_name}
            </h6>
            <p>{billing.email}</p>
          </LabelledValue>
        </Panel.LEGACY.Section>
      </Panel.LEGACY>
    );
  };

  renderRecipientValidationSection = ({ rvUsage }) => {
    const volumeUsed = _.get(rvUsage, 'recipient_validation.month.used', 0);
    const recipientValidationDate = _.get(rvUsage, 'recipient_validation.timestamp');
    return (
      <Panel.LEGACY.Section>
        <LabelledValue label="Recipient Validation">
          <h6>
            <Text fontSize="300" as="span">
              {formatFullNumber(volumeUsed)} emails validated for {totalRVCost(volumeUsed)}
              <Text fontWeight="200" as="span">
                {' '}
                as of {formatDateTime(recipientValidationDate)}
              </Text>
            </Text>
          </h6>
          <ButtonLink onClick={this.handleRvModal}>How was this calculated?</ButtonLink>
        </LabelledValue>
      </Panel.LEGACY.Section>
    );
  };

  render() {
    const {
      account,
      subscription: billingSubscription,
      currentPlan,
      canChangePlan,
      canUpdateBillingInfo,
      invoices,
      accountAgeInDays,
    } = this.props;
    const { rvUsage, pending_cancellation, subscription, billing = {} } = account;
    const { show } = this.state;
    const dedicatedIpProduct =
      billingSubscription.products.find(({ product }) => product === 'dedicated_ip') || {};
    // This is an extreme case to support manually billed accounts while transitioning to self serve
    const isTransitioningToSelfServe =
      billing !== null && !billing.credit_card && subscription.type === 'default';

    const volumeUsed = _.get(rvUsage, 'recipient_validation.month.used', 0);

    const changePlanActions = [];
    if (!pending_cancellation && canChangePlan && !isTransitioningToSelfServe) {
      const changePlanLabel = currentPlan.isFree ? 'Upgrade Now' : 'Change Plan';
      changePlanActions.push({
        content: changePlanLabel,
        to: '/account/billing/plan',
        Component: PageLink,
        color: 'orange',
      });
    }

    return (
      <div>
        <PendingPlanBanner account={account} subscription={billingSubscription} />
        <FreePlanWarningBanner account={account} accountAgeInDays={accountAgeInDays} />
        <Panel.LEGACY accent title="Plan Overview">
          <Panel.LEGACY.Section actions={changePlanActions}>
            <LabelledValue label="Your Plan">
              <PlanSummary plan={account.subscription} pendingCancellation={pending_cancellation} />
            </LabelledValue>
          </Panel.LEGACY.Section>
          <DedicatedIpSummarySection
            count={dedicatedIpProduct.quantity}
            plan={this.props.currentPlan}
            canPurchaseIps={this.props.canPurchaseIps}
            onClick={this.handleIpModal}
            isTransitioningToSelfServe={isTransitioningToSelfServe}
            limitOnDedicatedIps={dedicatedIpProduct.limit}
            priceOfEachDedicatedIp={dedicatedIpProduct.price}
            billingPeriodOfDedicatedIp={dedicatedIpProduct.billing_period}
          />
          {rvUsage && this.renderRecipientValidationSection({ rvUsage })}
        </Panel.LEGACY>

        {canUpdateBillingInfo && this.renderSummary()}

        {invoices.length > 0 && <InvoiceHistory invoices={this.props.invoices} />}

        <PremiumBanner />
        <EnterpriseBanner />

        <Modal.LEGACY
          open={show === PAYMENT_MODAL}
          onClose={this.handleModal}
          title={PAYMENT_MODAL}
        >
          <UpdatePaymentForm onCancel={this.handleModal} />
        </Modal.LEGACY>

        <Modal.LEGACY
          open={show === CONTACT_MODAL}
          onClose={this.handleModal}
          title={CONTACT_MODAL}
        >
          <UpdateContactForm onCancel={this.handleModal} />
        </Modal.LEGACY>
        <Modal.LEGACY open={show === IP_MODAL} onClose={this.handleModal} title={IP_MODAL}>
          <AddIps
            onClose={this.handleModal}
            quantityOfDedicatedIps={dedicatedIpProduct.quantity}
            limitOnDedicatedIps={dedicatedIpProduct.limit}
            priceOfEachDedicatedIp={dedicatedIpProduct.price}
            billingPeriodOfDedicatedIp={dedicatedIpProduct.billing_period}
          />
        </Modal.LEGACY>

        <RecipientValidationCostModal
          volumeUsed={volumeUsed}
          open={show === RV_MODAL}
          onClose={this.handleModal}
          start={rvUsage?.recipient_validation?.month?.start}
          end={rvUsage?.recipient_validation?.month?.end}
        />
      </div>
    );
  }
}
