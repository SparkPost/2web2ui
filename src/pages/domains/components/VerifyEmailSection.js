import React, { useState } from 'react';
import {
  Box,
  Grid,
  Button,
  Banner,
  Layout,
  Modal,
  Panel,
  Stack,
  TextField,
  Text,
} from 'src/components/matchbox';
import { Form } from 'src/components/form';
import { Bold } from 'src/components/text';
import useModal from 'src/hooks/useModal';
import { useForm, Controller } from 'react-hook-form';
import useDomains from '../hooks/useDomains';

export default function VerifyEmailSection({ domain, isSectionVisible }) {
  const { closeModal, isModalOpen, openModal, meta: { name } = {} } = useModal();
  const { hasAnyoneAtEnabled } = useDomains();
  const [warningBanner, toggleBanner] = useState(true);
  if (!isSectionVisible) {
    return null;
  }
  return (
    <Layout>
      {isModalOpen && name === 'AllowAnyoneAtModal' && (
        <AllowAnyoneAtModal onCancel={closeModal} domain={domain} />
      )}
      {isModalOpen && name === 'MailboxVerificationModal' && (
        <MailboxVerificationModal onCancel={closeModal} domain={domain} />
      )}
      <Layout.Section annotated>
        <Layout.SectionTitle as="h2">Email Verification</Layout.SectionTitle>
        {warningBanner && (
          <Banner status="warning" size="small" onDismiss={() => toggleBanner(false)}>
            <Text fontWeight="normal" maxWidth="100">
              This form of verification is not recommended.
            </Text>
          </Banner>
        )}
      </Layout.Section>
      <Layout.Section>
        <Panel mb="0">
          <Panel.Section>
            If you don't have access to update your DNS records for this domain, you can click
            "verify sender" to ask SparkPost to send an email to any address on this domain. Once
            you click verify on the email recieved you can send email from this domain, but
            SparkPost will not be able to DKIM-sign the mail it sends on your behalf, which could
            cause delivebility issues.
          </Panel.Section>
          <Panel.Section>
            <Button
              onClick={() => {
                hasAnyoneAtEnabled
                  ? openModal({ name: 'AllowAnyoneAtModal' })
                  : openModal({ name: 'MailboxVerificationModal' });
              }}
              variant="secondary"
            >
              Verify Sender
            </Button>
          </Panel.Section>
        </Panel>
      </Layout.Section>
    </Layout>
  );
}

function VerifyButton({ variant = 'primary', submitting }) {
  return (
    <Button variant={variant} loading={submitting} type="submit">
      Send Email
    </Button>
  );
}
function AllowAnyoneAtModal(props) {
  const { onCancel, domain } = props;
  const { id, subaccount_id: subaccount } = domain;
  const { control, handleSubmit, errors } = useForm();
  const { verifyMailbox, showAlert, verifyEmailLoading } = useDomains();

  const onSubmit = data => {
    const localPart = data.localPart;

    return verifyMailbox({ id, mailbox: localPart, subaccount }).then(
      onVerifySuccess(`${localPart}@${id}`),
    );
  };

  const onVerifySuccess = email => () => {
    showAlert({ type: 'success', message: `Email sent to ${email}` });
    onCancel();
  };

  return (
    <Modal open onClose={onCancel} showCloseButton>
      <Modal.Header>Verify through Email</Modal.Header>
      <Modal.Content>
        <Stack>
          <p>
            Start sending email from this domain by sending a verification email to any mailbox on
            your domain using the form below.
          </p>
          <Form onSubmit={handleSubmit(onSubmit)} id="domain-verify-by-email">
            <Grid>
              <Grid.Column xs={6}>
                <div>
                  <Controller
                    as={TextField}
                    name="localPart"
                    control={control}
                    rules={{ required: true }}
                    error={errors?.localPart?.type === 'required' ? 'Required' : ''}
                    connectRight={
                      <Box paddingLeft="200">
                        <Bold>{`@${id}`}</Bold>
                      </Box>
                    }
                  />
                </div>
              </Grid.Column>
            </Grid>
          </Form>
        </Stack>
      </Modal.Content>

      <Modal.Footer>
        <Button
          variant="primary"
          type="submit"
          form="domain-verify-by-email"
          loading={verifyEmailLoading}
        >
          Send Email
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function MailboxVerificationModal(props) {
  const { onCancel, domain, verifyEmailLoading } = props;
  const { id, subaccount_id: subaccount } = domain;
  const { verifyAbuse, verifyPostmaster, showAlert } = useDomains();

  const verifyWithAbuse = () => {
    return verifyAbuse({ id, subaccount }).then(onVerifySuccess(`abuse@${id}`));
  };

  const verifyWithPostmaster = () => {
    return verifyPostmaster({ id, subaccount }).then(onVerifySuccess(`postmaster@${id}`));
  };

  const onVerifySuccess = email => () => {
    showAlert({ type: 'success', message: `Email sent to ${email}` });
    onCancel();
  };

  return (
    <Modal open onClose={onCancel} showCloseButton>
      <Modal.Header>Verify through Email</Modal.Header>
      <Modal.Content>
        <Stack>
          <p>
            Start sending email from this domain by sending a verification email to one of the
            addresses below.
          </p>
          <Form
            id="domain-email-verification-postmaster"
            onSubmit={e => {
              e.preventDefault();
              verifyWithPostmaster();
            }}
          >
            <Grid middle="xs">
              <Grid.Column xs={6}>
                <p>
                  <strong>{`postmaster@${id}`}</strong>
                </p>
              </Grid.Column>
              <Grid.Column xs={6}>
                <VerifyButton
                  onClick={verifyWithPostmaster}
                  variant="secondary"
                  submitting={verifyEmailLoading}
                />
              </Grid.Column>
            </Grid>
          </Form>
          <Form
            id="domain-email-verification-abuse"
            onSubmit={e => {
              e.preventDefault();
              verifyWithAbuse();
            }}
          >
            <Grid middle="xs">
              <Grid.Column xs={6}>
                <p>
                  <strong>{`abuse@${id}`}</strong>
                </p>
              </Grid.Column>
              <Grid.Column xs={6}>
                <VerifyButton
                  onClick={verifyWithAbuse}
                  variant="secondary"
                  submitting={verifyEmailLoading}
                />
              </Grid.Column>
            </Grid>
          </Form>
        </Stack>
      </Modal.Content>
    </Modal>
  );
}
