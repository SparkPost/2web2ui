import React from 'react';
import { Layout, Stack, Text } from 'src/components/matchbox';
import { Button, Checkbox, Panel } from 'src/components/matchbox';
import { useForm } from 'react-hook-form';
import LineBreak from 'src/components/lineBreak';
import { Form } from 'src/components/tracking/form';
import { Bold, SubduedText } from 'src/components/text';
import { resolveReadyFor } from 'src/helpers/domains';
import getConfig from 'src/helpers/getConfig';
import useDomains from '../hooks/useDomains';
import { ExternalLink, SubduedLink } from 'src/components/links';
import { CopyField } from 'src/components';
import { TranslatableText } from 'src/components/text';
import { Autorenew, Telegram } from '@sparkpost/matchbox-icons';
import { EXTERNAL_LINKS } from '../constants';

export default function SendingAndBounceDomainSection({ domain, isSectionVisible }) {
  const { id, status, subaccount_id } = domain;
  const {
    verifyDkim,
    verify,
    showAlert,
    userName,
    isByoipAccount,
    verifyDkimLoading,
    verifyBounceLoading,
  } = useDomains();
  const initVerificationType = isByoipAccount && status.mx_status === 'valid' ? 'MX' : 'CNAME';
  const bounceDomainsConfig = getConfig('bounceDomains');
  const { errors, watch, register, handleSubmit } = useForm();
  const watchVerificationType = watch('verificationType', initVerificationType);

  const readyFor = resolveReadyFor(domain.status);

  const onSubmit = ({ reVerify = false }) => {
    if (!readyFor.bounce || reVerify) {
      const type = watchVerificationType.toLowerCase();

      verify({ id, subaccount: subaccount_id, type }).then(result => {
        if (result[`${type}_status`] === 'valid') {
          showAlert({
            type: 'success',
            message: `You have successfully verified ${type} record of ${id}`,
          });
        } else {
          showAlert({
            type: 'error',
            message: `Unable to verify ${type} record of ${id}`,
            details: result.dns[`${type}_error`],
          });
        }
      });
    }

    if (!readyFor.dkim || reVerify) {
      const { id, subaccount_id: subaccount } = domain;

      verifyDkim({ id, subaccount }).then(results => {
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
    }
  };

  if (!isSectionVisible) {
    return null;
  }
  return (
    <Layout>
      <Layout.Section annotated>
        <Layout.SectionTitle as="h2">
          {readyFor.dkim ? 'Sending and Bounce' : 'DNS Verification'}
        </Layout.SectionTitle>
        {(!readyFor.dkim || !readyFor.bounce) && (
          <Stack>
            <SubduedText fontSize="200">
              Strict alignment is when the sending and bounce domain being the same value (e.g.
              sending domain = sparkpost.com, and bounce domain = sparkpost.com)
            </SubduedText>
            <SubduedLink
              as={ExternalLink}
              to={EXTERNAL_LINKS.SENDING_DOMAINS_DOCUMENTATION}
              fontSize="200"
            >
              Domain Documentation
            </SubduedLink>
          </Stack>
        )}
      </Layout.Section>
      <Layout.Section>
        <Panel mb="0">
          <Form onSubmit={handleSubmit(onSubmit)} id="domain-verify-sendingbounce-form">
            {!readyFor.dkim || !readyFor.bounce ? (
              <Panel.Section>
                <p>
                  <TranslatableText>Add the&nbsp;</TranslatableText>
                  <TranslatableText>
                    <Bold>TXT</Bold>
                  </TranslatableText>
                  <TranslatableText>&nbsp;and&nbsp;</TranslatableText>
                  <TranslatableText>
                    <Bold>{watchVerificationType}&nbsp;</Bold>
                  </TranslatableText>
                  <TranslatableText>
                    records, Hostnames, and Values for this domain in the settings section of your
                    DNS provider.
                  </TranslatableText>
                </p>
                <Panel.Action
                  as={ExternalLink}
                  external="true"
                  to={`mailto:?subject=Assistance%20Requested%20Verifying%20a%20Sending/Bounce%20Domain%20on%20SparkPost&body=${userName}%20has%20requested%20your%20assistance%20verifying%20a%20sending/bounce%20domain%20with%20SparkPost.%20Follow%20the%20link%20below%20to%20find%20the%20values%20you%E2%80%99ll%20need%20to%20add%20to%20the%20settings%20of%20your%20DNS%20provider.%0D%0A%5BGo%20to%20SparkPost%5D(${window.location})%0D%0A`}
                  icon={Telegram}
                  iconMargin="0 0 0 .5em"
                  iconSize="18"
                >
                  Forward to Colleague
                </Panel.Action>
              </Panel.Section>
            ) : (
              <Panel.Section>
                Below is the records for this domain at your DNS provider
                <Panel.Action onClick={() => onSubmit({ reVerify: true })} type="submit">
                  <TranslatableText>Re-Verify Domain </TranslatableText>
                  <Autorenew size={18} />
                </Panel.Action>
              </Panel.Section>
            )}

            <Panel.Section>
              <Stack>
                <Text as="span" fontSize="300" fontWeight="semibold" role="heading">
                  {!readyFor.dkim ? 'Add DKIM Record' : 'TXT record for DKIM'}
                </Text>

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
              </Stack>
            </Panel.Section>
            <Panel.Section>
              <Stack>
                <Text as="span" fontSize="300" fontWeight="semibold" role="heading">
                  {!readyFor.bounce
                    ? 'Add Bounce Record'
                    : `${initVerificationType} record for Bounce`}
                </Text>

                {watchVerificationType === 'MX' ? (
                  <Stack space="200">
                    <CopyField label="Hostname" value={id} />
                    <CopyField label="Value" value={bounceDomainsConfig.mxValue} />
                    <LineBreak text="AND" />
                    <>
                      <Text as="label" fontWeight="500" fontSize="200">
                        Type
                      </Text>
                      <Text as="p">{initVerificationType}</Text>
                    </>
                    <CopyField label="Hostname" value={id} hideCopy={readyFor.bounce} />
                    <CopyField
                      label="Value"
                      value={"v=spf1 ip4:{'<YOUR-IP-ADDRESS>'}/20 ~all"}
                      hideCopy={readyFor.bounce}
                    />
                  </Stack>
                ) : (
                  <Stack>
                    {!readyFor.bounce && (
                      <>
                        <Text as="label" fontWeight="500" fontSize="200">
                          Type
                        </Text>
                        <Text as="p">CNAME</Text>
                      </>
                    )}
                    <CopyField label="Hostname" value={id} hideCopy={readyFor.bounce} />
                    <CopyField
                      label="Value"
                      value={bounceDomainsConfig.cnameValue}
                      hideCopy={readyFor.bounce}
                    />
                  </Stack>
                )}
              </Stack>
            </Panel.Section>
            {(!readyFor.bounce || !readyFor.dkim) && (
              <Panel.Section>
                <Checkbox
                  ref={register({ required: true })}
                  name="addToDns"
                  label="The TXT and CNAME records have been added to the DNS provider."
                  error={
                    errors.addToDns &&
                    'Please confirm you have added the records to your DNS provider.'
                  }
                  disabled={verifyBounceLoading || verifyDkimLoading}
                />
              </Panel.Section>
            )}
            {(!readyFor.bounce || !readyFor.dkim) && (
              <Panel.Section>
                <Button
                  variant="primary"
                  type="submit"
                  name="sendingBounceForm"
                  loading={verifyBounceLoading || verifyDkimLoading}
                >
                  Verify Domain
                </Button>
              </Panel.Section>
            )}
          </Form>
        </Panel>
      </Layout.Section>
    </Layout>
  );
}
