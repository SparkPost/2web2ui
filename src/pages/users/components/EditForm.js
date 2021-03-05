import React from 'react';
import { Field } from 'redux-form';
import { PageLink } from 'src/components/links';
import { Form } from 'src/components/form';
import { Button, Panel } from 'src/components/matchbox';
import LabelledValue from 'src/components/labelledValue/LabelledValue';
import { CheckboxWrapper } from 'src/components/reduxFormWrappers';
import RoleRadioGroup from './RoleRadioGroup';
import { ROLES } from 'src/constants';

export const EditForm = ({
  onSubmit,
  user,
  currentUser,
  isAccountSingleSignOnEnabled,
  subaccount,
  submitting,
}) => {
  const ssoHelpText = (
    <span>
      Enabling single sign-on will delete this user's password. If they switch back to
      password-based authentication, they'll need to reset their password on login.
    </span>
  );
  const subaccountReportingUser = user.access === ROLES.SUBACCOUNT_REPORTING;

  const roleSection = subaccountReportingUser ? (
    <>
      <p>
        This user has access to reporting features and read-only template access, limited to a
        single subaccount. Its role can’t be changed.
      </p>
      <LabelledValue label="Subaccount" name="subaccountInfo">
        <PageLink to={`/account/subaccounts/${subaccount.id}`}>{subaccount.name}</PageLink> (
        {subaccount.id})
      </LabelledValue>
    </>
  ) : (
    <Field
      name="access"
      allowSubaccountAssignment={false}
      disabled={user.isCurrentUser}
      allowSuperUser={currentUser.access === ROLES.SUPERUSER}
      component={RoleRadioGroup}
    />
  );

  return (
    <Panel.LEGACY>
      <Form onSubmit={onSubmit} id="users-edit-form">
        <Panel.LEGACY.Section>{roleSection}</Panel.LEGACY.Section>
        {isAccountSingleSignOnEnabled && (
          <Panel.LEGACY.Section>
            <Field
              component={CheckboxWrapper}
              helpText={ssoHelpText}
              label="Enable single sign-on authentication for this user"
              name="is_sso"
              type="checkbox"
            />
          </Panel.LEGACY.Section>
        )}

        <Panel.LEGACY.Section>
          <Button variant="primary" disabled={submitting || user.isCurrentUser} submit>
            Update User
          </Button>
        </Panel.LEGACY.Section>
      </Form>
    </Panel.LEGACY>
  );
};

export default EditForm;
