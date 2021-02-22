import React from 'react';
import { connect } from 'react-redux';
import { VpnKey } from '@sparkpost/matchbox-icons';
import { QRCode } from 'react-qr-svg';
import styled from 'styled-components';
import ButtonWrapper from 'src/components/buttonWrapper';
import { Button, Grid, Panel, Stack, TextField } from 'src/components/matchbox';
import { Form } from 'src/components/form';
import { Loading } from 'src/components/loading/Loading';
import { getTfaSecret, toggleTfa } from 'src/actions/tfa';
import { showAlert } from 'src/actions/globalAlert';
import EnableTfaFormPropTypes from './EnableTfaForm.propTypes';
import { usernameSelector } from 'src/selectors/currentUser';
import styles from './EnableTfaForm.module.scss';

const RightAlignedText = styled.div`
  text-align: 'right';
`;

const QRIcon = styled.div`
  width: 230px;
`;

export class EnableTfaForm extends React.Component {
  state = {
    code: '',
  };

  componentDidMount() {
    this.props.getTfaSecret();
  }

  componentDidUpdate(prevProps) {
    const { togglePending, toggleError, showAlert, afterEnable } = this.props;
    // If we just finished a toggle operation without an error, hit the afterEnable callback.
    if (prevProps.togglePending && !togglePending && !toggleError) {
      showAlert({ type: 'success', message: 'Two-factor authentication enabled' });
      afterEnable();
    }
  }

  handleInputChange = ({ target }) => {
    this.setState({ code: target.value });
  };

  onEnable = () => {
    const { toggleTfa } = this.props;
    return toggleTfa({ enabled: true, code: this.state.code });
  };

  renderForm() {
    return (
      <RenderedForm
        {...this.props}
        code={this.state.code}
        handleInputChange={this.handleInputChange}
        onEnable={this.onEnable}
      />
    );
  }

  render() {
    return this.renderForm();
  }
}

export const RenderedForm = props => {
  const {
    code,
    handleInputChange,
    onClose,
    onEnable,
    secret,
    togglePending,
    toggleError,
    username,
  } = props;

  if (!secret) {
    return (
      <div className={styles.Loading}>
        <Loading />
      </div>
    );
  }

  const qrData = `otpauth://totp/${username}?secret=${encodeURIComponent(secret)}&issuer=SparkPost`;

  return (
    <Form onSubmit={e => e.preventDefault()}>
      <Panel.LEGACY.Section>
        <Stack space="600">
          <Grid>
            <Grid.Column xs={12} md={7}>
              <Stack>
                <h6>Step 1: Configure your 2FA app</h6>
                <p>
                  To enable 2FA, you'll need to have a 2FA auth app installed on your phone or
                  tablet (examples include Google Authenticator, Duo Mobile, and Authy).
                </p>
                <p>
                  Most apps will let you get set up by scanning our QR code from within the app. If
                  you prefer, you can type in the key manually.
                </p>
                <p>
                  <strong>
                    <VpnKey /> <code>{secret}</code>
                  </strong>
                </p>
              </Stack>
            </Grid.Column>
            <Grid.Column xs={12} md={5}>
              <RightAlignedText>
                <QRIcon as={QRCode} bgColor="#FFFFFF" fgColor="#000000" level="Q" value={qrData} />
              </RightAlignedText>
            </Grid.Column>
          </Grid>
          <Grid>
            <Grid.Column xs={12} md={7}>
              <Stack>
                <h6>Step 2: Enter a 2FA code</h6>
                <p>
                  Generate a code from your newly-activated 2FA app to confirm that you're all set
                  up.
                </p>
                <TextField
                  id="tfa-setup-passcode"
                  required={true}
                  data-lpignore={true}
                  label="Passcode"
                  error={toggleError ? 'Problem verifying your code, please try again' : ''}
                  placeholder="Enter a generated 2FA passcode"
                  onChange={handleInputChange}
                  value={code}
                />
              </Stack>
            </Grid.Column>
          </Grid>
        </Stack>
      </Panel.LEGACY.Section>

      <Panel.LEGACY.Section>
        <ButtonWrapper>
          <Button type="submit" variant="primary" disabled={togglePending} onClick={onEnable}>
            {togglePending ? 'Verifying Code...' : 'Enable 2FA'}
          </Button>
          {onClose && (
            <Button variant="secondary" disabled={togglePending} onClick={onClose}>
              Cancel
            </Button>
          )}
        </ButtonWrapper>
      </Panel.LEGACY.Section>
    </Form>
  );
};

EnableTfaForm.propTypes = EnableTfaFormPropTypes;

const mapStateToProps = state => ({
  ...state.tfa,
  username: state.currentUser.email || usernameSelector(state),
  enabled: state.tfa.enabled === true,
});

export default connect(mapStateToProps, {
  getTfaSecret,
  toggleTfa,
  showAlert,
})(EnableTfaForm);
