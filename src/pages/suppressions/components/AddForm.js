import _ from 'lodash';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Checkbox, Panel, Stack, TextField } from 'src/components/matchbox';
import { Form } from 'src/components/tracking/form';
import { SubaccountTypeaheadController } from 'src/components/reactHookFormControllers';
import { useAlert, useSparkPostMutation } from 'src/hooks';
import { createOrUpdateSuppressions } from 'src/helpers/api/suppressions';
import { email } from 'src/helpers/validation';

export default function AddForm() {
  const { showAlert } = useAlert();
  const form = useForm({ mode: 'onBlur' });
  const mutation = useSparkPostMutation(
    ({ recipients, subaccount } = {}) => createOrUpdateSuppressions({ recipients, subaccount }),
    { onSuccess: handleSuccess },
  );

  /**
   * @description handles successful form submission/API request
   */
  function handleSuccess() {
    showAlert({ type: 'success', message: 'Successfully updated your suppression list' });
    form.reset();
  }

  /**
   * @description handles form submission after `react-hook-form` handles validation
   * @returns {function} the returned mutation function derived from `useSparkPostMutation`
   */
  function submitHandler(data) {
    const { subaccount } = data;
    const recipients = mapDataToRecipients(data);

    return mutation.mutate({ recipients, subaccount });
  }

  /**
   * @description validates whether either "type" field is checked
   * @returns {boolean}
   */
  function hasTypeSelected() {
    const { type } = form.getValues();

    return type.non_transactional || type.transactional;
  }

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

          <SubaccountTypeaheadController
            control={form.control}
            name="subaccount"
            id="subaccount-typeahead"
            disabled={mutation.status === 'loading'}
            helpText="Leaving this field blank will add the suppressions to the primary account."
          />

          <Checkbox.Group label="Type">
            <Checkbox
              label="Transactional"
              name="type.transactional"
              id="transactional-checkbox"
              disabled={mutation.status === 'loading'}
              ref={form.register({ validate: hasTypeSelected })}
              error={form.errors.type ? 'You must select at least one Type' : null}
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
        <Button
          variant="primary"
          disabled={!form.formState.isDirty}
          loading={mutation.status === 'loading'}
          type="submit"
        >
          Add / Update
        </Button>
      </Panel.Section>
    </Form>
  );
}

/**
 * @description Remaps UI form data to array of recipients as expected by the Suppressions API
 * @param {object} data form data
 * @returns array of recipients as required when making a PUT to /api/v1/suppression-list - see the [API docs](https://developers.sparkpost.com/api/suppression-list/#suppression-list-put-bulk-create-or-update-suppressions) for more
 */
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
