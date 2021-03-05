import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { getBillingCountries } from 'src/actions/billing';
import billingUpdate from 'src/actions/billingUpdate';
import { showAlert } from 'src/actions/globalAlert';
import { updatePaymentInitialValues } from 'src/selectors/accountBillingForms';
import { prepareCardInfo } from 'src/helpers/billing';
import { Button, Panel } from 'src/components/matchbox';
import { ButtonWrapper } from 'src/components';
import { Form } from 'src/components/form';
import PaymentForm from 'src/components/billing/PaymentForm';
import BillingAddressForm from 'src/components/billing/BillingAddressForm';

const FORMNAME = 'updatePayment';

export class UpdatePaymentForm extends Component {
  componentDidMount() {
    this.props.getBillingCountries();
  }

  onSubmit = values => {
    const { billingUpdate, showAlert } = this.props;

    const newValues = values.card ? { ...values, card: prepareCardInfo(values.card) } : values;

    return billingUpdate(newValues).then(() => {
      showAlert({ type: 'success', message: 'Payment Information Updated' });
    });
  };

  render() {
    const { onCancel, handleSubmit, submitting } = this.props;

    return (
      <Form onSubmit={handleSubmit(this.onSubmit)} id="billing-update-payment-form">
        <Panel.LEGACY title="Update Payment Information">
          <Panel.LEGACY.Section>
            <PaymentForm formName={FORMNAME} disabled={submitting} />
          </Panel.LEGACY.Section>
          <Panel.LEGACY.Section>
            <BillingAddressForm
              formName={FORMNAME}
              disabled={submitting}
              countries={this.props.billing.countries}
            />
          </Panel.LEGACY.Section>
          <Panel.LEGACY.Section>
            <ButtonWrapper>
              <Button type="submit" variant="primary" disabled={submitting}>
                Update Payment Information
              </Button>
              {onCancel && (
                <Button onClick={onCancel} variant="secondary">
                  Cancel
                </Button>
              )}
            </ButtonWrapper>
          </Panel.LEGACY.Section>
        </Panel.LEGACY>
      </Form>
    );
  }
}

const mapStateToProps = state => ({
  billing: state.billing,
  initialValues: updatePaymentInitialValues(state),
});

const mapDispatchtoProps = { getBillingCountries, billingUpdate, showAlert };
const formOptions = { form: FORMNAME, enableReinitialize: true };
export default connect(
  mapStateToProps,
  mapDispatchtoProps,
)(reduxForm(formOptions)(UpdatePaymentForm));
