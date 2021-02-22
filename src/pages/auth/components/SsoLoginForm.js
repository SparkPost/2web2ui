import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { TextFieldWrapper } from 'src/components';
import { Form } from 'src/components/form';
import { FORMS } from 'src/constants';
import { required } from 'src/helpers/validation';
import { trimWhitespaces } from 'src/helpers/string';
import { Box, Button, Error, Stack } from 'src/components/matchbox';

export class SsoLoginForm extends React.Component {
  render() {
    const { loginPending, loginError, pristine, handleSubmit } = this.props;

    return (
      <React.Fragment>
        {loginError && (
          <Error
            error={`${loginError}. Please contact login.issues@sparkpost.com for assistance.`}
          />
        )}
        <Form onSubmit={handleSubmit}>
          <Stack>
            <Field
              autoFocus
              name="username"
              id="username"
              label="Email or Username"
              normalize={trimWhitespaces}
              component={TextFieldWrapper}
              validate={required}
            />
            <Box>
              <Button variant="primary" submit disabled={loginPending || pristine}>
                {loginPending ? 'Logging In' : 'Log In'}
              </Button>
            </Box>
          </Stack>
        </Form>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ auth }) => ({
  initialValues: {
    username: auth.username,
  },
});

export default connect(mapStateToProps)(reduxForm({ form: FORMS.SSO })(SsoLoginForm));
