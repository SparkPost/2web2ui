import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { TextFieldWrapper, CheckboxWrapper } from 'src/components';
import { Form } from 'src/components/form';
import { BottomPad } from 'src/components/hibana';
import { PageLink } from 'src/components/links';
import { Box, Button, Error, Stack } from 'src/components/matchbox';
import { FORMS } from 'src/constants';
import { required } from 'src/helpers/validation';
import { trimWhitespaces } from 'src/helpers/string';

export const LoginForm = ({ loginPending, loginError, handleSubmit }) => (
  <Form onSubmit={handleSubmit}>
    <Stack>
      {loginError && (
        <BottomPad>
          <Error error={loginError} />
        </BottomPad>
      )}
      <Field
        name="username"
        id="username"
        label="Email or Username"
        normalize={trimWhitespaces}
        component={TextFieldWrapper}
        validate={required}
      />
      <Field
        type="password"
        name="password"
        id="password"
        label="Password"
        component={TextFieldWrapper}
        helpText={<PageLink to="/forgot-password">Forgot your password?</PageLink>}
      />
      <Field
        name="rememberMe"
        id="rememberMe"
        label="Keep me logged in"
        component={CheckboxWrapper}
      />
      <Box>
        <Button variant="primary" submit disabled={loginPending} data-id="button-log-in">
          {loginPending ? 'Logging In' : 'Log In'}
        </Button>
      </Box>
    </Stack>
  </Form>
);

function mapStateToProps({ auth }) {
  return {
    loginPending: auth.loginPending,
    loginError: auth.errorDescription,
    initialValues: {
      username: auth.username,
      password: auth.password,
      rememberMe: Boolean(auth.rememberMe),
    },
  };
}

export default connect(mapStateToProps)(reduxForm({ form: FORMS.LOGIN })(LoginForm));
