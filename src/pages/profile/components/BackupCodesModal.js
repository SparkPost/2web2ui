import React, { Component } from 'react';
import { ButtonWrapper } from 'src/components';
import BackupCodesView from './BackupCodesView';
import { Grid, Banner, Button, Panel, TextField, Modal, Stack } from 'src/components/matchbox';
import { Form } from 'src/components/form';

const initialState = {
  password: '',
  showErrors: false,
};

export default class BackupCodesModal extends Component {
  state = initialState;

  componentDidUpdate(oldProps) {
    if (oldProps.open && !this.props.open) {
      this.setState(initialState);
    }

    if (!oldProps.error && this.props.error) {
      this.setState({ showErrors: true });
    }
  }

  componentWillUnmount() {
    this.props.clearCodes();
  }

  handleInputChange = ({ target }) => {
    this.setState({ password: target.value });
  };

  generateCodes = () => {
    this.props.generate(this.state.password);
  };

  renderButtons = () => {
    const { pending, onClose } = this.props;
    const generatedCodes = this.props.codes.length > 0;
    if (generatedCodes) {
      return (
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      );
    } else {
      return (
        <ButtonWrapper>
          <Button variant="primary" type="submit" disabled={pending} onClick={this.generateCodes}>
            {pending ? 'Generating...' : 'Generate'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </ButtonWrapper>
      );
    }
  };

  render() {
    const { open, activeCount, error, codes } = this.props;
    const generatedCodes = codes.length > 0;
    const hasCodes = activeCount > 0;

    return (
      <Modal.LEGACY open={open}>
        <Panel.LEGACY title="Generate Two-factor Backup Codes">
          <Form onSubmit={e => e.preventDefault()}>
            <Panel.LEGACY.Section>
              <Stack>
                {!generatedCodes && hasCodes && (
                  <Banner status="warning" marginBottom="500">
                    Clicking Generate will overwrite your existing {activeCount} active backup
                    codes.
                  </Banner>
                )}
                <p>
                  Keep these single-use backup codes somewhere safe but accessible. They can be used
                  if your authentication app is unavailable (
                  <span role="img" aria-label="phone in toilet emojis">
                    📱&nbsp;➡︎&nbsp;🚽
                  </span>{' '}
                  , etc).
                </p>
                <Grid>
                  <Grid.Column xs={12} md={6}>
                    {!generatedCodes && (
                      <TextField
                        id="tfa-backup-codes-generate-password"
                        required
                        type="password"
                        onChange={this.handleInputChange}
                        placeholder="Password"
                        value={this.state.password}
                        error={this.state.showErrors && error ? 'Incorrect Password' : ''}
                      />
                    )}
                    {generatedCodes && <BackupCodesView codes={codes} />}
                  </Grid.Column>
                </Grid>
              </Stack>
            </Panel.LEGACY.Section>
            <Panel.LEGACY.Section>{this.renderButtons()}</Panel.LEGACY.Section>
          </Form>
        </Panel.LEGACY>
      </Modal.LEGACY>
    );
  }
}
