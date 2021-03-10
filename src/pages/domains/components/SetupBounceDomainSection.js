import React from 'react';
import { Button, Layout, Stack, Select, Text } from 'src/components/matchbox';
import { Checkbox, Panel } from 'src/components/matchbox';
import { SubduedText, TranslatableText } from 'src/components/text';
import { Telegram, Autorenew } from '@sparkpost/matchbox-icons';
import { resolveReadyFor } from 'src/helpers/domains';
import { Form } from 'src/components/tracking/form';
import { ExternalLink, PageLink, SubduedLink } from 'src/components/links';
import { useForm, Controller } from 'react-hook-form';
import LineBreak from 'src/components/lineBreak';
import getConfig from 'src/helpers/getConfig';
import { CopyField } from 'src/components';
import useDomains from '../hooks/useDomains';
import { EXTERNAL_LINKS } from '../constants';

export default function SetupBounceDomainSection({
  domain,
  isSectionVisible,
  title,
  isBounceOnly,
}) {
  const { id, status, subaccount_id } = domain;
  const { verify, showAlert, userName, isByoipAccount, verifyBounceLoading } = useDomains();
  const readyFor = resolveReadyFor(status);
  const initVerificationType = isByoipAccount && status.mx_status === 'valid' ? 'MX' : 'CNAME';
  const bounceDomainsConfig = getConfig('bounceDomains');
  const { control, handleSubmit, watch, errors, register } = useForm();
  const watchVerificationType = watch('verificationType', initVerificationType);

  const onSubmit = () => {
    const type = watchVerificationType.toLowerCase();

    return verify({ id, subaccount: subaccount_id, type }).then(result => {
      if (result[`${type}_status`] === 'valid') {
        showAlert({
          type: 'success',
          message: `Successfully verified ${type} record of ${id}`,
        });
      } else {
        showAlert({
          type: 'error',
          message: `Unable to verify ${type} record of ${id}`,
          details: result.dns[`${type}_error`],
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
        <Layout.SectionTitle as="h2">{title || 'Bounce'}</Layout.SectionTitle>
        <Stack>
          {!readyFor.bounce && (
            <SubduedText fontSize="200">
              Adding the CNAME record in your DNS provider settings will set this domain up for
              Bounce which is a sending best practice.
            </SubduedText>
          )}

          <SubduedLink
            as={ExternalLink}
            to={EXTERNAL_LINKS.BOUNCE_DOMAIN_DOCUMENTATION}
            fontSize="200"
          >
            Bounce Domain Documentation
          </SubduedLink>
          {!isBounceOnly && !readyFor.bounce && (
            <PageLink to="/domains/create" fontSize="200">
              Create a seperate bounce subdomain
            </PageLink>
          )}
        </Stack>
      </Layout.Section>
      <Layout.Section>
        <Panel mb="0">
          {!readyFor.bounce ? (
            <Panel.Section>
              <p>
                <TranslatableText>Add the&nbsp;</TranslatableText>
                <Text as="span" fontWeight="semibold">
                  CNAME&nbsp;
                </Text>
                <TranslatableText>
                  record, Hostname, and Value for this domain in the settings section of your DNS
                  provider.
                </TranslatableText>
              </p>
              <Panel.Action
                as={ExternalLink}
                external="true"
                to={`mailto:?subject=Assistance%20Requested%20Verifying%20a%20Bounce%20Domain%20on%20SparkPost&body=${userName}%20has%20requested%20your%20assistance%20verifying%20a%20bounce%20domain%20with%20SparkPost.%20Follow%20the%20link%20below%20to%20find%20the%20values%20you%E2%80%99ll%20need%20to%20add%20to%20the%20settings%20of%20your%20DNS%20provider.%0D%0A%5BGo%20to%20SparkPost%5D(${window.location})%0D%0A`}
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
                  CNAME&nbsp;
                </Text>
                <TranslatableText>
                  record for the Hostname and Value for this domain at your DNS provider.
                </TranslatableText>
              </p>
              <Panel.Action onClick={onSubmit}>
                <TranslatableText>Re-Verify Domain </TranslatableText>
                <Autorenew size={18} />
              </Panel.Action>
            </Panel.Section>
          )}
          <Form onSubmit={handleSubmit(onSubmit)} id="verify-bounce-form">
            <Panel.Section>
              <Stack>
                {!readyFor.bounce && (
                  <>
                    {isByoipAccount ? (
                      <Controller
                        name="verificationType"
                        render={({ value, onChange }) => (
                          <Select
                            onChange={onChange}
                            options={['CNAME', 'MX']}
                            value={value || initVerificationType}
                            label="Type"
                          />
                        )}
                        control={control}
                      />
                    ) : (
                      <>
                        <Text as="label" fontWeight="500" fontSize="200">
                          Type
                        </Text>
                        <Text as="p">{initVerificationType}</Text>
                      </>
                    )}
                  </>
                )}
                {watchVerificationType === 'MX' ? (
                  <Stack space="200">
                    <CopyField label="Hostname" value={id} hideCopy={readyFor.bounce} />
                    <CopyField
                      label="Value"
                      value={bounceDomainsConfig.mxValue}
                      hideCopy={readyFor.bounce}
                    />
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
                  <Stack space="200">
                    <CopyField label="Hostname" value={id} hideCopy={readyFor.bounce} />
                    <CopyField
                      label="Value"
                      value={bounceDomainsConfig.cnameValue}
                      hideCopy={readyFor.bounce}
                    />
                  </Stack>
                )}

                {/*API doesn't support it; Do we want to store this in ui option*/}
              </Stack>
            </Panel.Section>
            {!readyFor.bounce && (
              <Panel.Section>
                <Checkbox
                  error={
                    errors['ack-checkbox-bounce'] &&
                    'Please confirm you have added the records to your DNS provider.'
                  }
                  name="ack-checkbox-bounce"
                  label={`The ${watchVerificationType} record has been added to the DNS provider.`}
                  disabled={verifyBounceLoading}
                  ref={register({ required: true })}
                />
              </Panel.Section>
            )}

            {!readyFor.bounce && (
              <Panel.Section>
                <Button variant="primary" type="submit" loading={verifyBounceLoading}>
                  Verify Bounce
                </Button>
              </Panel.Section>
            )}
          </Form>
        </Panel>
      </Layout.Section>
    </Layout>
  );
}
