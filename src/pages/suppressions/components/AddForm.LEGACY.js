/* eslint-disable */

export class AddFormClassComponent extends React.Component {
  atLeastOne = (_value, { types }) =>
    !_.some(_.values(types)) ? 'You must select at least one Type' : undefined;

  onSubmit = ({ description, recipient, subaccount, types }) => {
    const { reset, showAlert } = this.props;
    const recipients = _.reduce(
      types,
      (result, checked, type) => {
        if (!checked) {
          return result;
        }

        return [...result, { recipient, description, type }];
      },
      [],
    );

    return this.props.createOrUpdateSuppressions(recipients, subaccount).then(() => {
      showAlert({ message: 'Successfully updated your suppression list', type: 'success' });
      reset(FORM_NAME);
    });
  };

  render() {
    const { handleSubmit, pristine, submitting } = this.props;

    return (
      <>
        <Form onSubmit={handleSubmit(this.onSubmit)} id="suppressions-add-form">
          <Panel.LEGACY.Section>
            <Stack>
              <Field
                name="recipient"
                component={TextFieldWrapper}
                validate={[required, email]}
                required
                label="Email Address"
              />
              <Field
                component={SubaccountTypeaheadWrapper}
                disabled={submitting}
                helpText="Leaving this field blank will add the suppressions to the primary account."
                name="subaccount"
              />
              <Checkbox.Group label="Type" required>
                <Field
                  component={CheckboxWrapper}
                  name="types.transactional"
                  label="Transactional"
                  type="checkbox"
                />
                <Field
                  component={CheckboxWrapper}
                  name="types.non_transactional"
                  label="Non-Transactional"
                  type="checkbox"
                  validate={this.atLeastOne}
                />
              </Checkbox.Group>
              <Field name="description" component={TextFieldWrapper} label="Description" />
            </Stack>
          </Panel.LEGACY.Section>

          <Panel.LEGACY.Section>
            <Button variant="primary" disabled={pristine || submitting} type="submit">
              Add / Update
            </Button>
          </Panel.LEGACY.Section>
        </Form>
      </>
    );
  }
}

const mapStateToProps = () => ({
  initialValues: {
    types: {
      non_transactional: false,
      transactional: false,
    },
  },
});

export default withRouter(
  connect(mapStateToProps, { showAlert, createOrUpdateSuppressions, reset })(
    reduxForm({ form: FORM_NAME })(AddForm),
  ),
);
