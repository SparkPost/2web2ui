import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Button, Panel, Stack } from 'src/components/matchbox';
import {
  provisionAccountSingleSignOn,
  reprovisionAccountSingleSignOn,
} from 'src/actions/accountSingleSignOn';
import { showAlert } from 'src/actions/globalAlert';
import { ButtonWrapper } from 'src/components';
import { Form } from 'src/components/form';
import { Heading } from 'src/components/text';
import CopyField from 'src/components/copyField/CopyField';
import FileFieldWrapper from 'src/components/reduxFormWrappers/FileFieldWrapper';
import config from 'src/config';
import { getBase64Contents } from 'src/helpers/file';
import { fileExtension, maxFileSize, required } from 'src/helpers/validation';

export class ProviderForm extends React.Component {
  cancel = () => {
    this.props.onCancel();
  };

  submit = async ({ samlFile }) => {
    const {
      provider,
      provisionAccountSingleSignOn,
      reprovisionAccountSingleSignOn,
      showAlert,
    } = this.props;
    const samlContents = await getBase64Contents(samlFile);
    const action = provider ? reprovisionAccountSingleSignOn : provisionAccountSingleSignOn;

    return action(samlContents).then(() => {
      showAlert({ type: 'success', message: 'Successfully provisioned SAML' });
    });
  };

  componentDidUpdate(prevProps) {
    const { onSubmit, updatedAt } = this.props;

    if (updatedAt !== prevProps.updatedAt) {
      onSubmit();
    }
  }

  render() {
    const { handleSubmit, submitting } = this.props;

    return (
      <Panel.LEGACY title="Provision Single Sign-On" accent>
        <Form onSubmit={handleSubmit(this.submit)} id="sso-provider-form">
          <Panel.LEGACY.Section>
            <Stack>
              <Heading as="h3" looksLike="h6">
                Step 1: Setup Callback URL
              </Heading>
              <p>
                To complete setup with your Identity Provider (IdP), you will need to provide the
                following callback URL.
              </p>
              <div>
                <CopyField value={`${config.apiBase}/v1/users/saml/consume`} />
              </div>
            </Stack>
          </Panel.LEGACY.Section>
          <Panel.LEGACY.Section>
            <Stack>
              <Heading as="h3" looksLike="h6">
                Step 2: Upload your Security Assertion Markup Language (SAML)
              </Heading>
              <p>This is a configuration file that can be downloaded from your IdP.</p>
              <div>
                <Field
                  component={FileFieldWrapper}
                  disabled={submitting}
                  filetype="xml"
                  helpText={`
                  If you already provided a file, reprovisioning will replace your current
                  configuration.
                `}
                  name="samlFile"
                  type="file"
                  validate={[
                    required,
                    fileExtension('xml'),
                    maxFileSize(config.apiRequestBodyMaxSizeBytes),
                  ]}
                />
              </div>
            </Stack>
          </Panel.LEGACY.Section>
          <Panel.LEGACY.Section>
            <ButtonWrapper>
              <Button variant="primary" disabled={submitting} type="submit">
                Provision SSO
              </Button>

              <Button variant="secondary" onClick={this.cancel}>
                Cancel
              </Button>
            </ButtonWrapper>
          </Panel.LEGACY.Section>
        </Form>
      </Panel.LEGACY>
    );
  }
}

const mapDispatchToProps = {
  provisionAccountSingleSignOn,
  reprovisionAccountSingleSignOn,
  showAlert,
};

const mapStateToProps = ({ accountSingleSignOn }) => accountSingleSignOn;

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(reduxForm({ form: 'provisionAccountSignleSignOn' })(ProviderForm));
