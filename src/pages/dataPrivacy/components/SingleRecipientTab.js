import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { ButtonWrapper, RadioGroup, TextFieldWrapper } from 'src/components';
import { Form } from 'src/components/tracking/form';
import SubaccountSection from 'src/components/subaccountSection';
import { required, email, maxLength } from 'src/helpers/validation';
import { Button, Panel, Stack } from 'src/components/matchbox';
import { submitRTBFRequest, submitOptOutRequest } from 'src/actions/dataPrivacy';
import { showAlert } from 'src/actions/globalAlert';
import { hasSubaccounts } from 'src/selectors/subaccounts';
import { REQUEST_TYPES, SUBACCOUNT_ITEMS, SUBACCOUNT_OPTIONS } from '../constants';

export function SingleRecipientTab(props) {
  const onSubmit = values => {
    const subaccountId = !Boolean(values.assignTo)
      ? null
      : values.assignTo === 'subaccount'
      ? values.subaccount.id
      : SUBACCOUNT_ITEMS[values.assignTo];
    const include_subaccounts = values.assignTo === 'shared';
    const submitRequest =
      values.requestType === 'rtbf' ? props.submitRTBFRequest : props.submitOptOutRequest;

    return submitRequest({
      recipients: [values.email],
      subaccountId: subaccountId,
      include_subaccounts: include_subaccounts,
    }).then(() => {
      props.showAlert({ type: 'success', message: `Request Saved` });
      props.reset();
    });
  };

  return (
    <Form onSubmit={props.handleSubmit(onSubmit)} id="dataprivacy-single-recipient-form">
      <Panel.LEGACY.Section>
        <Stack>
          <Field
            component={RadioGroup}
            name="requestType"
            label="Select Compliance Type"
            options={REQUEST_TYPES}
            disabled={props.dataPrivacyRequestPending}
            validate={[required]}
          />
          <Field
            name="email"
            component={TextFieldWrapper}
            placeholder="email@example.com"
            label="Recipient Email Address"
            disabled={props.dataPrivacyRequestPending}
            validate={[required, email, maxLength(254)]}
            normalize={(value = '') => value.trim()}
          />
          {props.hasSubaccounts && (
            <SubaccountSection
              newTemplate={true}
              disabled={props.dataPrivacyRequestPending}
              validate={[required]}
              createOptions={SUBACCOUNT_OPTIONS}
            />
          )}
        </Stack>
      </Panel.LEGACY.Section>

      <Panel.LEGACY.Section>
        <ButtonWrapper>
          <Button variant="primary" type="submit" disabled={props.dataPrivacyRequestPending}>
            Submit Request
          </Button>
          <Button
            variant="secondary"
            onClick={props.reset}
            disabled={props.pristine || props.submitting}
          >
            Clear
          </Button>
        </ButtonWrapper>
      </Panel.LEGACY.Section>
    </Form>
  );
}

const formOptions = {
  form: 'DATA_PRIVACY_SINGLE_RECIPIENT',
  enableReinitialize: true,
};

const mapStateToProps = state => {
  return {
    dataPrivacyRequestPending: state.dataPrivacy.dataPrivacyRequestPending,
    hasSubaccounts: hasSubaccounts(state),
    initialValues: {
      assignTo: 'master',
    },
  };
};

export default connect(mapStateToProps, { submitRTBFRequest, submitOptOutRequest, showAlert })(
  reduxForm(formOptions)(SingleRecipientTab),
);
