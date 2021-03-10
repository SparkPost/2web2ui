import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import { Grid, Button, Panel } from 'src/components/matchbox';
import { getBillingCountries, updateBillingSubscription } from 'src/actions/billing';
import billingUpdate from 'src/actions/billingUpdate';
import { showAlert } from 'src/actions/globalAlert';
import { Form } from 'src/components/tracking/form';
import { Loading } from 'src/components/loading/Loading';
import { prepareCardInfo } from 'src/helpers/billing';
import { getFirstCountry, getFirstStateForCountry } from 'src/selectors/accountBillingForms';
import PlanSummary from '../components/PlanSummary';
import BillingAddressForm from 'src/components/billing/BillingAddressForm';
import PaymentForm from 'src/components/billing/PaymentForm';

const FORMNAME = 'enableAutomaticBilling';

export class EnableAutomaticBillingForm extends React.Component {
  componentDidMount() {
    this.props.getBillingCountries();
  }

  onSubmit = values => {
    const { billingUpdate, history, showAlert, updateBillingSubscription } = this.props;

    return billingUpdate({ ...values, card: prepareCardInfo(values.card) })
      .then(() =>
        updateBillingSubscription({
          type: 'active',
        }),
      )
      .then(() => {
        history.push('/account/billing');
        showAlert({ type: 'success', message: 'Automatic Billing Enabled' });
      });
  };

  render() {
    const { billingCountries, currentSubscription, handleSubmit, loading, submitting } = this.props;

    if (loading) {
      return <Loading />;
    }

    return (
      <Form onSubmit={handleSubmit(this.onSubmit)} id="enable-automaticbilling-form">
        <Grid>
          <Grid.Column>
            <Panel.LEGACY title="Add a Credit Card">
              <Panel.LEGACY.Section>
                <PaymentForm formName={FORMNAME} disabled={submitting} />
              </Panel.LEGACY.Section>
              <Panel.LEGACY.Section>
                <BillingAddressForm
                  formName={FORMNAME}
                  disabled={submitting}
                  countries={billingCountries}
                />
              </Panel.LEGACY.Section>
            </Panel.LEGACY>
          </Grid.Column>
          <Grid.Column xs={12} md={6}>
            <Panel.LEGACY title="Your Plan">
              <Panel.LEGACY.Section>
                <PlanSummary plan={currentSubscription} />
              </Panel.LEGACY.Section>
              <Panel.LEGACY.Section>
                <Button disabled={submitting} variant="primary" type="submit">
                  {submitting ? 'Loading...' : 'Enable Automatic Billing'}
                </Button>
              </Panel.LEGACY.Section>
            </Panel.LEGACY>
          </Grid.Column>
        </Grid>
      </Form>
    );
  }
}

const mapStateToProps = state => {
  const country = getFirstCountry(state);

  return {
    billingCountries: state.billing.countries,
    currentSubscription: state.account.subscription,
    initialValues: {
      email: state.currentUser.email,
      billingAddress: {
        firstName: state.currentUser.first_name, // for billingCreate
        lastName: state.currentUser.last_name, // for billingCreate
        state: getFirstStateForCountry(state, country),
        country,
      },
    },
    loading: state.billing.countriesLoading,
  };
};

const mapDispatchtoProps = {
  billingUpdate,
  getBillingCountries,
  showAlert,
  updateBillingSubscription,
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchtoProps,
  )(
    reduxForm({ form: FORMNAME, enableReinitialize: true, destroyOnUnmount: false })(
      EnableAutomaticBillingForm,
    ),
  ),
);
