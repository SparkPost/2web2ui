import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Button, Panel, Stack } from 'src/components/matchbox';
import { Form } from 'src/components/form';
import { required } from 'src/helpers/validation';
import { TextFieldWrapper } from 'src/components';

export class NameForm extends Component {
  render() {
    const { pristine, submitting, handleSubmit } = this.props;

    return (
      <Form onSubmit={handleSubmit} id="profile-update-form">
        <Panel.LEGACY.Section>
          <Stack>
            <Field
              // for redux-form
              name="firstName"
              component={TextFieldWrapper}
              // for the matchbox component
              id="firstName"
              label="First Name"
              validate={required}
              autoComplete="given-name"
            />

            <Field
              name="lastName"
              id="lastName"
              label="Last Name"
              component={TextFieldWrapper}
              validate={required}
              autoComplete="family-name"
            />
          </Stack>
        </Panel.LEGACY.Section>

        <Panel.LEGACY.Section>
          <Button variant="primary" submit disabled={submitting || pristine}>
            {submitting ? 'Updating Profile' : 'Update Profile'}
          </Button>
        </Panel.LEGACY.Section>
      </Form>
    );
  }
}

const mapStateToProps = ({ currentUser }) => ({
  initialValues: {
    firstName: currentUser.first_name,
    lastName: currentUser.last_name,
  },
});

const formOptions = {
  form: 'profileName',
  enableReinitialize: true, // required to update initial values from redux state
};

// breaks if you do reduxForm first
export default connect(mapStateToProps)(reduxForm(formOptions)(NameForm));
