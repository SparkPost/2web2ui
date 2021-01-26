import React from 'react';
import { connect } from 'react-redux';
import { Page, Panel } from 'src/components/matchbox';
import LabelledValue from 'src/components/labelledValue/LabelledValue';
import CancellationPanel from './components/CancellationPanel';
import SingleSignOnPanel from './components/SingleSignOnPanel';
import EnforceTfaPanel from './components/EnforceTfaPanel';
import UIOptionsPanel from './components/UIOptionsPanel';
import { hasAccountOptionEnabled } from 'src/helpers/conditions/account';

export function AccountSettingsPage({ currentUser, tfaRequiredEnforced }) {
  return (
    <Page title="Account Settings">
      <Panel.LEGACY sectioned>
        <LabelledValue label="Account ID">{currentUser.customer}</LabelledValue>
      </Panel.LEGACY>
      {!tfaRequiredEnforced && <SingleSignOnPanel />}
      <EnforceTfaPanel />
      <UIOptionsPanel />
      <CancellationPanel />
    </Page>
  );
}

const mapStateToProps = state => {
  return {
    currentUser: state.currentUser,
    tfaRequiredEnforced: hasAccountOptionEnabled('enforce_tfa_required')(state),
  };
};

export default connect(mapStateToProps)(AccountSettingsPage);
