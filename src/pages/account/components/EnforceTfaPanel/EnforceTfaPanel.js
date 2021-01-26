import React from 'react';
import { Panel } from 'src/components/matchbox';
import { PanelLoading } from 'src/components/loading';
import { ConfirmationModal } from 'src/components/modals';
import { Stack } from 'src/components/matchbox';
import TogglePanelSection from './TogglePanelSection';
import { ExternalLink } from 'src/components/links';
import { LINKS } from 'src/constants';
import { PANEL_LOADING_HEIGHT } from 'src/pages/account/constants';

export class EnforceTFAPanel extends React.Component {
  state = {
    updating: false,
    enableModal: false,
    disableModal: false,
  };

  componentDidMount() {
    this.props.getAccountSingleSignOnDetails();
    this.props.getTfaStatus();
  }

  toggleTfaRequired = () => {
    const { tfaRequired } = this.props;

    if (tfaRequired) {
      this.setState({ disableModal: true });
    } else {
      this.setState({ enableModal: true });
    }
  };

  setTfaRequired = value => {
    const { tfaEnabled, showAlert } = this.props;
    this.props.updateAccount({ tfa_required: value }).then(() => {
      if (value && !tfaEnabled) {
        this.props.logout();
      } else {
        this.setState({ enableModal: false, disableModal: false });
      }
      showAlert({ type: 'success', message: 'Account updated.' });
    });
  };

  onCancel = () =>
    this.setState({
      enableModal: false,
      disableModal: false,
    });

  render() {
    const { loading, tfaRequired, tfaRequiredEnforced, tfaUpdatePending, ssoEnabled } = this.props;
    const { enableModal, disableModal } = this.state;

    if (loading) {
      return <PanelLoading minHeight={PANEL_LOADING_HEIGHT} />;
    }

    return (
      <Panel.LEGACY
        title="Two-factor Authentication"
        actions={[
          {
            color: 'orange',
            content: 'Learn more',
            component: ExternalLink,
            to: LINKS.MANDATORY_TFA,
          },
        ]}
      >
        {ssoEnabled && (
          <Panel.LEGACY.Section>
            <p>
              Mandatory two-factor authentication is not available while single sign-on is enabled.
            </p>
          </Panel.LEGACY.Section>
        )}
        <TogglePanelSection
          readOnly={ssoEnabled}
          tfaRequired={tfaRequired}
          toggleTfaRequired={this.toggleTfaRequired}
          tfaRequiredEnforced={tfaRequiredEnforced}
        />
        <ConfirmationModal
          open={enableModal}
          confirming={tfaUpdatePending}
          title="Are you sure you want to enforce two-factor authentication for this account?"
          content={
            <Stack>
              <p>
                Enforcing two-factor authentication account-wide will have the following effects:
              </p>
              <ul>
                <li>
                  All users without two-factor authentication enabled will be forced to login to the
                  UI again and enable it on login.
                </li>
                <li>
                  All users without two-factor authentication enabled will be sent an email
                  informing them of this change.
                </li>
                <li>
                  If <em>you</em> don't have two-factor authentication enabled, you will be logged
                  out.
                </li>
              </ul>
            </Stack>
          }
          onCancel={this.onCancel}
          onConfirm={() => this.setTfaRequired(true)}
        />
        <ConfirmationModal
          open={disableModal}
          confirming={tfaUpdatePending}
          title="Are you sure you want to make two-factor authentication optional for this account?"
          content={
            <Stack>
              <p>
                Making two-factor authentication optional will allow users to manage their own
                two-factor authentication settings.
              </p>
              <p>
                Note: This will <em>not</em> disable two-factor authentication for any user.
              </p>
            </Stack>
          }
          onCancel={this.onCancel}
          onConfirm={() => this.setTfaRequired(false)}
        />
      </Panel.LEGACY>
    );
  }
}

export default EnforceTFAPanel;
