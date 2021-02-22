import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { sendPasswordResetEmail } from 'src/actions/passwordReset';
import { showAlert } from 'src/actions/globalAlert';
import { required } from 'src/helpers/validation';
import { reduxForm, Field } from 'redux-form';
import { CenteredLogo, TextFieldWrapper } from 'src/components';
import { Form } from 'src/components/form';
import { PageLink } from 'src/components/links';
import { Box, Button, Panel, Stack } from 'src/components/matchbox';
import { AUTH_ROUTE } from 'src/constants';
import { trimWhitespaces } from 'src/helpers/string';

const successAlert = {
  type: 'success',
  message:
    'If you have an account with us, please check your email for your password reset instructions.',
};

const errorAlert = {
  type: 'error',
  message: 'Unable to send your password reset email.',
};

export class ForgotPasswordPage extends Component {
  componentDidUpdate(prevProps) {
    const { emailSuccess, emailError, history, showAlert } = this.props;

    if (!prevProps.emailSuccess && emailSuccess) {
      history.push(AUTH_ROUTE);
      showAlert(successAlert);
    }

    if (!prevProps.emailError && emailError) {
      showAlert({ ...errorAlert, details: emailError.message });
    }
  }

  render() {
    const { handleSubmit, invalid, submitting, sendPasswordResetEmail } = this.props;

    const buttonText = submitting ? 'Sending Email..' : 'Reset Password';

    return (
      <Fragment>
        <CenteredLogo />
        <Panel.LEGACY sectioned title="Reset Your Password">
          <Form onSubmit={handleSubmit(sendPasswordResetEmail)}>
            <Stack>
              <p>Provide your username or email and we'll send an email to reset your password.</p>
              <Field
                name="user"
                label="Username or email address"
                validate={required}
                normalize={trimWhitespaces}
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

const formOptions = { form: 'forgotPassword' };
const mapStateToProps = ({ passwordReset }) => passwordReset;
export default connect(mapStateToProps, { sendPasswordResetEmail, showAlert })(
  reduxForm(formOptions)(ForgotPasswordPage),
);
