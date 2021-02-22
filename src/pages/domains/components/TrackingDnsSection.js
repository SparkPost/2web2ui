import React from 'react';
import { Button, Layout, Stack, Text, Panel, Checkbox } from 'src/components/matchbox';
import { Autorenew } from '@sparkpost/matchbox-icons';
import { Form } from 'src/components/form';
import { SubduedText, TranslatableText } from 'src/components/text';
import { ExternalLink, SubduedLink } from 'src/components/links';
import useDomains from '../hooks/useDomains';
import { CopyField } from 'src/components';
import { EXTERNAL_LINKS } from '../constants';
import { useForm } from 'react-hook-form';

import _ from 'lodash';

export default function TrackingDnsSection({ domain, isSectionVisible, title }) {
  const { trackingDomainCname, verifyTrackingDomain, verifyingTrackingPending } = useDomains();
  const { unverified, domain: domainName, subaccount_id: subaccountId } = domain;
  const { handleSubmit, errors, register } = useForm();

  const onSubmit = () => {
    return verifyTrackingDomain({
      domain: domainName,
      subaccountId: subaccountId,
    });
  };
  if (!isSectionVisible) {
    return null;
  }
  return (
    <Layout>
      <Layout.Section annotated>
        <Layout.SectionTitle as="h2">{title || 'Tracking'} </Layout.SectionTitle>
        <Stack>
          {unverified && (
            <SubduedText fontSize="200">
              Tracking domains are used by mail providers to determine where engagement rate (like
              opens and clicks) should be sent. This allows you to measure the health of your email
              campaigns so that your team is able to create content and mailing lists that maximize
              your potential.
            </SubduedText>
          )}
          <SubduedLink
            as={ExternalLink}
            to={EXTERNAL_LINKS.TRACKING_DOMAIN_DOCUMENTATION}
            fontSize="200"
          >
            Tracking Domain Documentation
          </SubduedLink>
        </Stack>
      </Layout.Section>
      <Layout.Section>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Panel>
            {unverified ? (
              <Panel.Section>
                <p>
                  <TranslatableText>Add the&nbsp;</TranslatableText>
                  <Text as="span" fontWeight="semibold">
                    CNAME&nbsp;
                  </Text>
                  <TranslatableText>
                    records, Hostnames, and Values for this domain in the settings section of your
                    DNS provider.
                  </TranslatableText>
                </p>
              </Panel.Section>
            ) : (
              <Panel.Section>
                <p>
                  <TranslatableText>Below is the&nbsp;</TranslatableText>
                  <Text as="span" fontWeight="semibold">
                    CNAME&nbsp;
                  </Text>
                  <TranslatableText>record for this domain at your DNS provider.</TranslatableText>
                </p>
                <Panel.Action onClick={onSubmit}>
                  <TranslatableText>Re-Verify Domain </TranslatableText>
                  <Autorenew size={18} />
                </Panel.Action>
              </Panel.Section>
            )}
            <Panel.Section>
              <Stack>
                {unverified && (
                  <>
                    <Text as="label" fontWeight="500" fontSize="200">
                      Type
                    </Text>
                    <Text as="p">CNAME</Text>
                  </>
                )}
                <CopyField label="Hostname" value={domainName} hideCopy={!unverified} />
                <CopyField label="Value" value={trackingDomainCname} hideCopy={!unverified} />
              </Stack>

              {unverified && (
                <Checkbox
                  error={
                    errors['ack-checkbox-tracking'] &&
                    'Please confirm you have added the records to your DNS provider.'
                  }
                  mt="600"
                  mb="100"
                  name="ack-checkbox-tracking"
                  ref={register({ required: true })}
                  label="The CNAME record has been added to the DNS provider."
                />
              )}
            </Panel.Section>

            {unverified && (
              <Panel.Section>
                <Button variant="primary" type="submit" loading={verifyingTrackingPending}>
                  Verify Domain
                </Button>
              </Panel.Section>
            )}
          </Panel>
        </Form>
      </Layout.Section>
    </Layout>
  );
}
