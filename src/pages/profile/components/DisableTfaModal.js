import React, { Component } from 'react';
import { Grid, Button, Panel, Stack, TextField, Modal } from 'src/components/matchbox';
import { Form } from 'src/components/tracking/form';
import { ButtonWrapper } from 'src/components';
import { TranslatableText } from 'src/components/text';

export default class DisableTfaModal extends Component {
  state = {
    password: '',
    showErrors: false,
  };

  componentDidUpdate(oldProps) {
    if (!this.props.enabled && this.props.open) {
      this.props.onClose();
    }
    if (oldProps.open && !this.props.open) {
      this.setState({
        password: '',
        showErrors: false,
      });
    }
    if (!oldProps.toggleError && this.props.toggleError) {
      this.setState({
        showErrors: true,
      });
    }
  }

  handleInputChange = ({ target }) => {
    this.setState({ password: target.value });
  };

  render() {
    const { open, onClose, togglePending, toggleError, tfaRequired } = this.props;

    return (
      <Modal.LEGACY open={open} onClose={onClose}>
        <Panel.LEGACY
          title={
            tfaRequired ? 'Reset Two-Factor Authentication' : 'Disable Two-Factor Authentication'
          }
          accent
        >
          <Form onSubmit={e => e.preventDefault()} id="disable-tfa-form">
            <Panel.LEGACY.Section>
              <Stack>
                <p>
                  Enter your SparkPost password to{' '}
                  <TranslatableText>{tfaRequired ? 'reset' : 'disable'}</TranslatableText>
                  &nbsp;two-factor authentication.
                </p>
                <p>
                  If two-factor authentication is required on this account, you will be logged out
                  after disabling it. You can re-enable when you next log in.
                </p>
                <Grid>
                  <Grid.Column xs={12} md={6}>
                    <TextField
                      label="Password"
                      type="password"
                      error={this.state.showErrors && toggleError ? 'Incorrect password' : ''}
                      placeholder="Enter your password"
                      onChange={this.handleInputChange}
                      value={this.state.password}
                    />
                  </Grid.Column>
                </Grid>
              </Stack>
            </Panel.LEGACY.Section>
            <Panel.LEGACY.Section>
              <ButtonWrapper>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={togglePending}
                  onClick={() => this.props.disable(this.state.password)}
                >
                  {tfaRequired
                    ? togglePending
                      ? 'Reseting...'
                      : 'Reset 2FA'
                    : togglePending
                    ? 'Disabling...'
                    : 'Disable 2FA'}
                </Button>

                <Button variant="seconary" disabled={togglePending} onClick={onClose}>
                  Cancel
                </Button>
              </ButtonWrapper>
            </Panel.LEGACY.Section>
          </Form>
        </Panel.LEGACY>
      </Modal.LEGACY>
    );
  }
}
