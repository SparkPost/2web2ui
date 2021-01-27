import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { Button, Panel, Stack } from 'src/components/matchbox';
import { TextFieldWrapper } from 'src/components';
import { required } from 'src/helpers/validation';
import { SubaccountTypeaheadWrapper } from 'src/components/reduxFormWrappers';

export class CreateForm extends Component {
  render() {
    const { submitting, handleSubmit } = this.props;

    return (
      <Panel.LEGACY>
        <form onSubmit={handleSubmit}>
          <Panel.LEGACY.Section>
            <Stack>
              <Field
                component={TextFieldWrapper}
                label="Domain Name"
                name="domain"
                // Do not try to validate tracking domains, let our API make that decision
                validate={[required]}
                disabled={submitting}
              />
              <Field
                component={SubaccountTypeaheadWrapper}
                name="subaccount"
                helpText="Leaving this field blank will permanently assign the tracking domain to the primary account."
                disabled={submitting}
              />
            </Stack>
          </Panel.LEGACY.Section>

          <Panel.LEGACY.Section>
            <Button submit variant="primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Add Tracking Domain'}
            </Button>
          </Panel.LEGACY.Section>
        </form>
      </Panel.LEGACY>
    );
  }
}

const formOptions = {
  form: 'createTrackingDomain',
};

export default reduxForm(formOptions)(CreateForm);
