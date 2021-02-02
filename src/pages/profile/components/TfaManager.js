import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Panel } from 'src/components/matchbox';
import { PanelLoading, LabelledValue } from 'src/components';
import { ExternalLink } from 'src/components/links';
import * as tfaActions from 'src/actions/tfa';
import BackupCodesModal from './BackupCodesModal';
import EnableTfaModal from './EnableTfaModal';
import DisableTfaModal from './DisableTfaModal';
import { LINKS } from 'src/constants';
import { logout } from 'src/actions/auth';
import { showAlert } from 'src/actions/globalAlert';
export class TfaManager extends Component {
  state = {
    openModal: null,
  };

  componentDidMount() {
    this.props.getTfaBackupStatus();

    if (this.props.statusUnknown) {
      this.props.getTfaStatus();
    }
  }

  closeModals = () => this.setState({ openModal: null });

  closeBackupModal = () => {
    this.closeModals();
  };

  onEnable = () => {
    this.closeModals();
    this.props.getTfaBackupStatus();
  };

  disable = password => {
    const { showAlert, required, toggleTfa, logout } = this.props;
    return toggleTfa({ enabled: false, password }).then(() => {
      if (required) {
        logout();
      }
      showAlert({ type: 'success', message: 'Profile Updated.' });
    });
  };

  generateBackupCodes = password =>
    this.props.generateBackupCodes(password).then(this.props.getTfaBackupStatus);

  renderBackupCodesStatus() {
    const { enabled, backupCodes } = this.props;

    if (!enabled) {
      return null;
    }

    return (
      <LabelledValue label="Active Codes">
        <h6>{backupCodes.activeCount}</h6>
        {backupCodes.activeCount === 0 && (
          <p>
            <small>
              We recommend saving a set of backup codes in case you lose or misplace your current
              device.
            </small>
          </p>
        )}
      </LabelledValue>
    );
  }

  render() {
    const { statusUnknown, enabled, required } = this.props;

    if (statusUnknown) {
      return <PanelLoading minHeight="100px" />;
    }

    const disabledActions = [
      {
        content: 'Enable 2FA',
        onClick: () => this.setState({ openModal: 'enable' }),
        color: 'orange',
      },
      {
        content: 'Learn More',
        to: LINKS.LEARN_MORE_TFA,
        external: true,
        color: 'orange',
        as: ExternalLink,
      },
    ];

    const enabledActions = [
      {
        content: 'Generate New Backup Codes',
        onClick: () => this.setState({ openModal: 'backupCodes' }),
        color: 'orange',
      },
      {
        content: required ? 'Reset 2FA' : 'Disable 2FA',
        onClick: () => this.setState({ openModal: 'disable' }),
        color: 'orange',
      },
    ];

    return (
      <Panel.LEGACY
        sectioned
        title="Two-factor Authentication"
        actions={enabled ? enabledActions : disabledActions}
      >
        <LabelledValue label="Status">{enabled ? 'Enabled' : 'Disabled'}</LabelledValue>
        {this.renderBackupCodesStatus()}
        <BackupCodesModal
          open={this.state.openModal === 'backupCodes'}
          onClose={this.closeBackupModal}
          {...this.props.backupCodes}
          generate={this.generateBackupCodes}
          clearCodes={this.props.clearBackupCodes}
        />
        <EnableTfaModal
          open={this.state.openModal === 'enable'}
          onClose={this.closeModals}
          enabled={enabled}
          onEnable={this.onEnable}
        />
        <DisableTfaModal
          open={this.state.openModal === 'disable'}
          onClose={this.closeModals}
          disable={this.disable}
          togglePending={this.props.togglePending}
          toggleError={this.props.toggleError}
          enabled={enabled}
          tfaRequired={this.props.required}
        />
      </Panel.LEGACY>
    );
  }
}

const mapStateToProps = ({ account, tfa, tfaBackupCodes }) => ({
  ...tfa,
  statusUnknown: tfa.enabled === null,
  enabled: tfa.enabled === true,
  required: account.tfa_required,
  backupCodes: tfaBackupCodes,
});

export default connect(mapStateToProps, { logout, showAlert, ...tfaActions })(TfaManager);
