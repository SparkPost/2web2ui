import React from 'react';
import { Field } from 'redux-form';
import { required } from 'helpers/validation';
import { TextFieldWrapper, SelectWrapper, RadioGroup } from 'components';

const BasicAuthFields = () => (
  <div>
  Basic Auth
    <Field name='basicUser' label='Username' placeholder='username' component={TextFieldWrapper} validate={required}/>
    <Field name='basicPass' label='Password' placeholder='password' component={TextFieldWrapper} validate={required}/>
  </div>
);

const OAuth2Fields = () => (
  <div>
  OAuth 2.0
    <Field name='clientId' label='Client ID' placeholder='clientID' component={TextFieldWrapper} validate={required}/>
    <Field name='clientSecret' label='Client Secret' placeholder='clientSecret' component={TextFieldWrapper} validate={required}/>
    <Field name='tokenURL' label='Token URL' placeholder='https://www.example.com/tokens/' component={TextFieldWrapper} validate={required}/>
  </div>
);

const NameField = () => (
  <Field
    name='name'
    component={TextFieldWrapper}
    validate={required}
    label='Webhook Name'
    placeholder='Opens and Clicks'
  />
);

const EventsRadioGroup = () => (
  <Field
    name='eventsRadio'
    component={RadioGroup}
    title='Events'
    options={[
      { value: 'all', label: 'All' },
      { value: 'select', label: 'Select' }
    ]}
  />
);

const AuthDropDown = () => (
  <Field
    name='auth'
    label='Authentication'
    component={SelectWrapper}
    options={[{ value: '', label: 'None' }, { value: 'basic', label: 'Basic Auth' }, { value: 'oauth2', label: 'OAuth 2.0' }]}
  />
);


export {
  NameField,
  EventsRadioGroup,
  AuthDropDown,
  BasicAuthFields,
  OAuth2Fields
};
