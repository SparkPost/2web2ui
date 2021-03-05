import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

import { LINKS } from 'src/constants';
import { TextFieldWrapper } from 'src/components/reduxFormWrappers';
import { ExternalLink } from 'src/components/links';
import { Box, Button, Stack } from 'src/components/matchbox';
import { Form } from 'src/components/form';
import { required, minLength } from 'src/helpers/validation';

export class RegisterUserForm extends Component {
  render() {
    const { handleSubmit, submitting } = this.props;

    return (
      <Form onSubmit={handleSubmit} id="register-user-form">
        <Stack>
          <Field
            name="username"
            component={TextFieldWrapper}
            label="Username"
            validate={required}
            disabled={true}
          />
          <Field
            name="password"
            component={TextFieldWrapper}
            label="Password"
            helpText="Passwords must be at least 12 characters long."
            validate={[required, minLength(12)]}
            disabled={submitting}
            type="password"
            autoFocus={true}
            autoComplete="new-password"
            data-lpignore={true} // removes inaccurate LastPass password management behavior
          />
          <p>
            <small>
              By joining, you agree to SparkPost's{' '}
              <ExternalLink to={LINKS.TOU}>Terms of Use</ExternalLink>
            </small>
          </p>
          <Box>
            <Button variant="primary" submit disabled={submitting}>
              {submitting ? 'Loading' : 'Confirm'}
            </Button>
          </Box>
        </Stack>
      </Form>
    );
  }
}

const mapStateToProps = (state, { email }) => ({
  initialValues: { username: email },
});

const RegisterUserReduxForm = reduxForm({ form: 'RegisterUser' })(RegisterUserForm);
export default connect(mapStateToProps, {})(RegisterUserReduxForm);
