import React from 'react';
import { Field } from 'redux-form';
import { TextFieldWrapper, SelectWrapper, RadioGroup, CheckboxWrapper } from 'src/components';
import { FieldSet } from 'src/components/fieldSet';
import { ExternalLink } from 'src/components/links';
import { Stack } from 'src/components/matchbox';
import { required, maxLength, url } from 'src/helpers/validation';

const BasicAuthFields = ({ disabled }) => (
  <FieldSet legend="Basic Auth" legendHidden>
    <Stack>
      <Field
        name="basicUser"
        label="Username"
        component={TextFieldWrapper}
        validate={required}
        disabled={disabled}
      />
      <Field
        name="basicPass"
        label="Password"
        component={TextFieldWrapper}
        validate={required}
        type="password"
        disabled={disabled}
      />
    </Stack>
  </FieldSet>
);

const OAuth2Fields = ({ disabled }) => (
  <FieldSet legend="OAuth 2.0" legendHidden>
    <Stack>
      <Field
        name="clientId"
        label="Client ID"
        component={TextFieldWrapper}
        validate={required}
        disabled={disabled}
      />
      <Field
        name="clientSecret"
        label="Client Secret"
        component={TextFieldWrapper}
        validate={required}
        disabled={disabled}
      />
      <Field
        name="tokenURL"
        label="Token URL"
        component={TextFieldWrapper}
        validate={required}
        disabled={disabled}
      />
    </Stack>
  </FieldSet>
);

const NameField = ({ disabled }) => (
  <Field
    name="name"
    component={TextFieldWrapper}
    validate={[required, maxLength(24)]}
    label="Webhook Name"
    helpText="A friendly label for your webhook, only used for display"
    disabled={disabled}
  />
);

const TargetField = ({ disabled }) => (
  <Field
    name="target"
    component={TextFieldWrapper}
    validate={[required, url]}
    normalize={(value = '') => value.trim()}
    label="Target URL"
    disabled={disabled}
  />
);

const EventsRadioGroup = ({ disabled }) => (
  <Field
    name="eventsRadio"
    component={RadioGroup}
    label="Events"
    options={[
      { value: 'all', label: 'All events', disabled },
      { value: 'select', label: 'Select individual events', disabled },
    ]}
  />
);

const AuthDropDown = ({ disabled }) => (
  <Field
    name="auth"
    label="Authentication"
    component={SelectWrapper}
    options={[
      { value: '', label: 'None' },
      { value: 'basic', label: 'Basic Auth' },
      { value: 'oauth2', label: 'OAuth 2.0' },
    ]}
    helpText={
      <span>
        Select "None" if your target URL has no authentication scheme.{' '}
        <ExternalLink to="https://support.sparkpost.com/customer/portal/articles/2112385">
          More information
        </ExternalLink>
        .
      </span>
    }
    disabled={disabled}
  />
);

const ActiveField = ({ disabled }) => {
  // Artificially set a checked prop so the underlying input displays properly.
  const CheckableCheckbox = ({ input, ...rest }) => (
    <CheckboxWrapper input={input} {...rest} checked={Boolean(input.value)} />
  );
  return (
    <Field
      name="active"
      label="Active"
      component={CheckableCheckbox}
      helpText="An inactive webhook will not transmit any data."
      disabled={disabled}
    />
  );
};

export {
  NameField,
  TargetField,
  EventsRadioGroup,
  AuthDropDown,
  BasicAuthFields,
  OAuth2Fields,
  ActiveField,
};
