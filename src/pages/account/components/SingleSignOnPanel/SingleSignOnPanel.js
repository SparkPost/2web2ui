import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Panel } from 'src/components/matchbox';
import {
  getAccountSingleSignOnDetails,
  updateAccountSingleSignOn,
} from 'src/actions/accountSingleSignOn';
import { ExternalLink } from 'src/components/links';
import { PanelLoading } from 'src/components/loading';
import { LINKS } from 'src/constants';
import ProviderSection from './ProviderSection';
import StatusSection from './StatusSection';
import SCIMTokenSection from './SCIMTokenSection';
import { PANEL_LOADING_HEIGHT } from 'src/pages/account/constants';
import {
  generateScimToken,
  listScimToken,
  deleteScimToken,
  resetScimTokenErrors,
} from 'src/actions/scimToken';
import { showAlert } from 'src/actions/globalAlert';

export function SingleSignOnPanel(props) {
  const {
    getAccountSingleSignOnDetails,
    provider,
    tfaRequired,
    loading,
    listScimToken,
    generateScimToken,
    deleteScimToken,
    scimTokenList,
    newScimToken,
    deleteScimTokenError,
    generateScimTokenError,
    resetScimTokenErrors,
    generateScimTokenPending,
    deleteScimTokenPending,
    scimTokenListLoading,
    showAlert,
  } = props;
  useEffect(() => {
    getAccountSingleSignOnDetails();
  }, [getAccountSingleSignOnDetails]);
  useEffect(() => {
    listScimToken();
  }, [listScimToken]);

  const renderContent = () => {
    return (
      <>
        {tfaRequired && (
          <Panel.LEGACY.Section>
            <p>
              Single sign-on is not available while two-factor authentication is required on this
              account.
            </p>
          </Panel.LEGACY.Section>
        )}
        <ProviderSection readOnly={tfaRequired} provider={provider} />
        <StatusSection readOnly={tfaRequired} {...props} />
        {provider && (
          <SCIMTokenSection
            showAlert={showAlert}
            scimTokenList={scimTokenList}
            newScimToken={newScimToken}
            generateScimToken={generateScimToken}
            listScimToken={listScimToken}
            deleteScimToken={deleteScimToken}
            resetScimTokenErrors={resetScimTokenErrors}
            generateScimTokenPending={generateScimTokenPending}
            deleteScimTokenPending={deleteScimTokenPending}
            scimTokenListLoading={scimTokenListLoading}
            error={deleteScimTokenError || generateScimTokenError}
          />
        )}
      </>
    );
  };

  if (loading) {
    return <PanelLoading minHeight={PANEL_LOADING_HEIGHT} />;
  }

  return (
    <Panel.LEGACY
      title="Single Sign-On"
      actions={[
        {
          color: 'orange',
          as: ExternalLink,
          content: 'Learn More',
          to: LINKS.SSO_GUIDE,
        },
      ]}
    >
      {renderContent()}
    </Panel.LEGACY>
  );
}

const mapDispatchToProps = {
  getAccountSingleSignOnDetails,
  updateAccountSingleSignOn,
  listScimToken,
  generateScimToken,
  deleteScimToken,
  resetScimTokenErrors,
  showAlert,
};

const mapStateToProps = state => ({
  ...state.accountSingleSignOn,
  tfaRequired: state.account.tfa_required,
  scimTokenList: state.scimToken.scimTokenList,
  newScimToken: state.scimToken.newScimToken,
  deleteScimTokenError: state.scimToken.deleteScimTokenError,
  generateScimTokenError: state.scimToken.generateScimTokenError,
  generateScimTokenPending: state.scimToken.generateScimTokenPending,
  deleteScimTokenPending: state.scimToken.deleteScimTokenPending,
  scimTokenListLoading: state.scimToken.scimTokenListLoading,
});

export default connect(mapStateToProps, mapDispatchToProps)(SingleSignOnPanel);
