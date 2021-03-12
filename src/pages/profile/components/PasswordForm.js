import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { Button, Panel, Stack } from 'src/components/matchbox';
import { Form } from 'src/components/tracking/form';
import { required, minLength } from 'src/helpers/validation';
import { TextFieldWrapper } from 'src/components';

export class PasswordForm extends Component {
  validatePasswords = value => {
    const { currentPassword } = this.props;
    return value === currentPassword ? 'New Password is same as Current Password' : undefined;
  };

  render() {
    const { pristine, submitting, handleSubmit, currentPassword, newPassword } = this.props;

    return (
      <Form onSubmit={handleSubmit} id="update-password-form">
        <Panel.LEGACY.Section>
          <Stack>
            <Field
              type="password"
              autoComplete="current-password"
              name="currentPassword"
              component={TextFieldWrapper}
              id="currentPassword"
              label="Current Password"
              validate={required}
            />

            <Field
              type="password"
              autoComplete="new-password"
              name="newPassword"
              id="newPassword"
              label="New Password"
              component={TextFieldWrapper}
              validate={[required, minLength(12), this.validatePasswords]}
            />
          </Stack>
        </Panel.LEGACY.Section>

        <Panel.LEGACY.Section>
          <Button
            variant="primary"
            submit
            disabled={
              submitting ||
              pristine ||
              !currentPassword ||
              !newPassword ||
              currentPassword === newPassword
            }
          >
            {submitting ? 'Updating Password' : 'Update Password'}
          </Button>
        </Panel.LEGACY.Section>
      </Form>
    );
  }
}

const selector = formValueSelector('passwordForm');

const mapStateToProps = state => ({
  currentPassword: selector(state, 'currentPassword'),
  newPassword: selector(state, 'newPassword'),
});

const formOptions = {
  form: 'passwordForm',
  enableReinitialize: true, // required to update initial values from redux state
};

// breaks if you do reduxForm first
export default connect(mapStateToProps)(reduxForm(formOptions)(PasswordForm));
