import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { invalidateAuthToken } from 'src/actions/auth';
import { resetPassword } from 'src/actions/passwordReset';
import { showAlert } from 'src/actions/globalAlert';
import { required, minLength, endsWithWhitespace } from 'src/helpers/validation';
import { reduxForm, Field } from 'redux-form';
import { CenteredLogo, TextFieldWrapper } from 'src/components';
import { Form } from 'src/components/tracking/form';
import { PageLink } from 'src/components/links';
import { Box, Button, Panel, Stack } from 'src/components/matchbox';
import _ from 'lodash';
import { AUTH_ROUTE } from 'src/constants';

export class ResetPasswordPage extends Component {
  handleResetPassword = ({ newPassword: password }) => {
    const { resetPassword, token, invalidateAuthToken } = this.props;
    return resetPassword({ password, token }).then(() => invalidateAuthToken(token));
  };

  componentDidUpdate(prevProps) {
    const { resetSuccess, resetError, history, showAlert } = this.props;

    if (!prevProps.resetSuccess && resetSuccess) {
      showAlert({ type: 'success', message: 'Your password has been updated.' });
      history.push(AUTH_ROUTE);
    }

    if (!prevProps.resetError && resetError) {
      if (_.get(resetError, 'response.status') === 401) {
        showAlert({
          type: 'error',
          message: 'Your password reset request has expired. Please resubmit your request.',
        });
        history.push('/forgot-password');
      } else {
        showAlert({
          type: 'error',
          message: 'Unable to update your password.',
          details: resetError.message,
        });
      }
    }
  }

  comparePasswords = (value, { newPassword, confirmNewPassword }) =>
    newPassword === confirmNewPassword ? undefined : 'Must be the same password';

  render() {
    const { handleSubmit, invalid, submitting } = this.props;

    const buttonText = submitting ? 'Creating Password..' : 'Create New Password';

    return (
      <Fragment>
        <CenteredLogo />
        <Panel.LEGACY sectioned title="Create a New Password">
          <Form onSubmit={handleSubmit(this.handleResetPassword)} id="reset-password-form">
            <Stack>
              <Field
                name="newPassword"
                type="password"
                autoComplete="new-password"
                label="New Password"
                validate={[required, minLength(12), endsWithWhitespace]}
                component={TextFieldWrapper}
              />
              <Field
                name="confirmNewPassword"
                type="password"
                label="Confirm New Password"
                validate={[required, minLength(12), endsWithWhitespace, this.comparePasswords]}
                component={TextFieldWrapper}
              />
              <Box>
                <Button variant="primary" submit disabled={invalid || submitting}>
                  {buttonText}
                </Button>
              </Box>
            </Stack>
          </Form>
        </Panel.LEGACY>
        <Panel.LEGACY.Footer
          left={
            <small>
              Remember your password? <PageLink to="/auth">Log in</PageLink>.
            </small>
          }
        />
      </Fragment>
    );
  }
}

const formOptions = { form: 'resetPassword' };
const mapStateToProps = (state, props) => ({
  ...state.passwordReset,
  token: props.match.params.token,
});
export default connect(mapStateToProps, { resetPassword, showAlert, invalidateAuthToken })(
  reduxForm(formOptions)(ResetPasswordPage),
);
