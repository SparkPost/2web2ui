import _ from 'lodash';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Checkbox, Panel, Stack, TextField } from 'src/components/matchbox';
import { SubaccountTypeahead } from 'src/components/typeahead';
import { Form } from 'src/components/tracking/form';
import { useAlert, useSparkPostMutation } from 'src/hooks';
import { createOrUpdateSuppressions } from 'src/helpers/api/suppressions';
import { email } from 'src/helpers/validation';

export default function AddForm() {
  const { showAlert } = useAlert();
  const form = useForm();
  const mutation = useSparkPostMutation(
    (args = {}) => {
      const { recipients, subaccount } = args;

      return createOrUpdateSuppressions(recipients, subaccount);
    },
    {
      onSuccess: () => {
        showAlert({ type: 'success', message: 'Successfully updated your suppression list' });
        form.reset();
      },
    },
  );

  const submitHandler = data => {
    const { subaccount } = data;
    const recipients = mapDataToRecipients(data);

    return mutation.mutate({ recipients, subaccount });
  };

  return (
    <Form onSubmit={form.handleSubmit(submitHandler)} id="suppressions-add-form">
      <Panel.Section>
        <Stack>
          <TextField
            label="Email Address"
            name="recipient"
            id="email-address-textfield"
            disabled={mutation.status === 'loading'}
            ref={form.register({ required: true, validate: email })}
            error={form.errors.recipient ? 'A valid email address is required.' : null}
            defaultValue=""
          />

          <Controller
            as={SubaccountTypeahead}
            control={form.control}
            name="subaccount"
            id="subaccount-typeahead"
            disabled={mutation.status === 'loading'}
            helpText="Leaving this field blank will add the suppressions to the primary account."
            defaultValue=""
          />

          <Checkbox.Group label="Type">
            <Checkbox
              label="Transactional"
              name="type.transactional"
              id="transactional-checkbox"
              disabled={mutation.status === 'loading'}
              ref={form.register({
                validate: () => {
                  const { type } = form.getValues();

                  return type.non_transactional || type.transactional;
                },
              })}
              error={form.errors.type ? '"Type" is required.' : null}
            />

            <Checkbox
              label="Non-Transactional"
              name="type.non_transactional"
              id="non-transactional-checkbox"
              disabled={mutation.status === 'loading'}
              ref={form.register}
            />
          </Checkbox.Group>

          <TextField
            label="Description"
            name="description"
            id="description-textfield"
            ref={form.register}
            defaultValue=""
          />
        </Stack>
      </Panel.Section>

      <Panel.Section>
        <Button variant="primary" loading={mutation.status === 'loading'} type="submit">
          Add / Update
        </Button>
      </Panel.Section>
    </Form>
  );
}

function mapDataToRecipients(data) {
  const { recipient, description, type } = data;

  return _.reduce(
    type,
    (result, checked, type) => {
      if (!checked) {
        return result;
      }

      return [...result, { recipient, description, type }];
    },
    [],
  );
}
