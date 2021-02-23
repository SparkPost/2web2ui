import React from 'react';
import { Button, Layout, Stack, Tag, Text } from 'src/components/matchbox';
import { Checkbox, Panel } from 'src/components/matchbox';
import { SubduedText, TranslatableText } from 'src/components/text';
import { Autorenew, Telegram } from '@sparkpost/matchbox-icons';
import { resolveReadyFor } from 'src/helpers/domains';
import useDomains from '../hooks/useDomains';
import { ExternalLink, SubduedLink } from 'src/components/links';
import { CopyField } from 'src/components';
import { useForm } from 'react-hook-form';
import { EXTERNAL_LINKS } from '../constants';

export default function SetupForSending({ domain, isSectionVisible }) {
  const { verifyDkim, showAlert, userName, verifyDkimLoading } = useDomains();
  const readyFor = resolveReadyFor(domain.status);
  const { handleSubmit, errors, register } = useForm();

  const onSubmit = () => {
    const { id, subaccount_id: subaccount } = domain;

    return verifyDkim({ id, subaccount }).then(results => {
      const readyFor = resolveReadyFor(results);

      if (readyFor.dkim) {
        showAlert({
          type: 'success',
          message: `You have successfully verified DKIM record of ${id}`,
        });
      } else {
        showAlert({
          type: 'error',
          message: `Unable to verify DKIM record of ${id}. ${results.dns.dkim_error}`,
        });
      }
    });
  };
  if (!isSectionVisible) {
    return null;
  }
  return (
    <Layout>
      <Layout.Section annotated>
        <Layout.SectionTitle as="h2">
          {!readyFor.dkim ? 'DNS Verification' : 'Sending'}
        </Layout.SectionTitle>
        {!readyFor.dkim && (
          <>
            <Tag color="darkGray" mb="200">
              Recommended
            </Tag>
            <Stack>
              <SubduedText fontSize="200">
                DKIM (DomainKeys Identified Mail) is an email authentication method that allows a
                sender to claim responsibility for a message by using digital signatures generated
                from private and public keys. DKIM failures can cause messages to be rejected, so
                SparkPost requires a DKIM record published for all sending domains before they can
                be verified and used, in order to ensure DKIM checks are passed.
              </SubduedText>

              <SubduedLink
                as={ExternalLink}
                to={EXTERNAL_LINKS.SENDING_DOMAINS_DOCUMENTATION}
                fontSize="200"
              >
                Sending Domain Documentation
              </SubduedLink>
            </Stack>
          </>
        )}
      </Layout.Section>
      <Layout.Section>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Panel mb="0">
            {!readyFor.dkim ? (
              <Panel.Section>
                <p>
                  <TranslatableText>Add these&nbsp;</TranslatableText>
                  <Text as="span" fontWeight="semibold">
                    TXT&nbsp;
                  </Text>
                  <TranslatableText>
                    records, Hostnames, and Values for this domain in the settings section of your
                    DNS provider.
                  </TranslatableText>
                </p>
                <Panel.Action
                  as={ExternalLink}
                  external="true"
                  to={`mailto:?subject=Assistance%20Requested%20Verifying%20a%20Sending%20Domain%20on%20SparkPost&body=${userName}%20has%20requested%20your%20assistance%20verifying%20a%20sending%20domain%20with%20SparkPost.%20Follow%20the%20link%20below%20to%20find%20the%20values%20you%E2%80%99ll%20need%20to%20add%20to%20the%20settings%20of%20your%20DNS%20provider.%0D%0A%5BGo%20to%20SparkPost%5D(${window.location})%0D%0A`}
                  icon={Telegram}
                  iconMargin="0 0 0 .5em"
                  iconSize="18"
                >
                  Forward to Colleague
                </Panel.Action>
              </Panel.Section>
            ) : (
              <Panel.Section>
                <p>
                  <TranslatableText>Below is the&nbsp;</TranslatableText>
                  <Text as="span" fontWeight="semibold">
                    TXT&nbsp;
                  </Text>
                  <TranslatableText>
                    record for the Hostname and DKIM value of this domain.
                  </TranslatableText>
                </p>
                <Panel.Action onClick={onSubmit}>
                  <TranslatableText>Re-Verify Domain </TranslatableText>
                  <Autorenew size={18} />
                </Panel.Action>
              </Panel.Section>
            )}
            <Panel.Section>
              <Stack>
                {!readyFor.dkim && (
                  <>
                    <Text as="label" fontWeight="500" fontSize="200">
                      Type
                    </Text>
                    <Text as="p">TXT</Text>
                  </>
                )}
                <CopyField label="Hostname" value={domain.dkimHostname} hideCopy={readyFor.dkim} />
                <CopyField label="Value" value={domain.dkimValue} hideCopy={readyFor.dkim} />
                {!readyFor.dkim && (
                  <Checkbox
                    error={
                      errors['ack-checkbox-dkim'] &&
                      'Please confirm you have added the records to your DNS provider.'
                    }
                    name="ack-checkbox-dkim"
                    ref={register({ required: true })}
                    label="The TXT record has been added to the DNS provider."
                  />
                )}
              </Stack>
            </Panel.Section>
            {!readyFor.dkim && (
              <Panel.Section>
                <Button variant="primary" loading={verifyDkimLoading} type="submit">
                  Verify Domain
                </Button>
              </Panel.Section>
            )}
          </Panel>
        </form>
      </Layout.Section>
    </Layout>
  );
}
