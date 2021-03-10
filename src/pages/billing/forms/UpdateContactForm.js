import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { updateBillingContact, getBillingCountries } from 'src/actions/billing';
import { showAlert } from 'src/actions/globalAlert';
import { updateContactInitialValues } from 'src/selectors/accountBillingForms';

import { Button, Panel } from 'src/components/matchbox';
import { ButtonWrapper } from 'src/components';
import { Form } from 'src/components/tracking/form';
import BillingContactForm from './fields/BillingContactForm';

const FORMNAME = 'updateContact';

export class UpdateContactForm extends Component {
  componentDidMount() {
    this.props.getBillingCountries();
  }

  onSubmit = values => {
    const { updateBillingContact, showAlert } = this.props;
    return updateBillingContact(values).then(() => {
      showAlert({ type: 'success', message: 'Billing Contact Updated' });
    });
  };

  render() {
    const { onCancel, handleSubmit, submitting } = this.props;

    return (
      <Form onSubmit={handleSubmit(this.onSubmit)} id="billing-update-contact">
        <Panel.LEGACY title="Update Billing Contact">
          <Panel.LEGACY.Section>
            <BillingContactForm
              formName={FORMNAME}
              disabled={submitting}
              countries={this.props.billing.countries}
            />
          </Panel.LEGACY.Section>
          <Panel.LEGACY.Section>
            <ButtonWrapper>
              <Button type="submit" variant="primary" disabled={submitting}>
                Update Billing Contact
              </Button>
              <Button onClick={onCancel} variant="secondary">
                Cancel
              </Button>
            </ButtonWrapper>
          </Panel.LEGACY.Section>
        </Panel.LEGACY>
      </Form>
    );
  }
}

const mapStateToProps = state => ({
  billing: state.billing,
  initialValues: updateContactInitialValues(state),
});

const mapDispatchtoProps = { getBillingCountries, updateBillingContact, showAlert };
const formOptions = { form: FORMNAME, enableReinitialize: true };
export default connect(
  mapStateToProps,
  mapDispatchtoProps,
)(reduxForm(formOptions)(UpdateContactForm));
