import React, { useEffect } from 'react';
import { usePageFilters } from 'src/hooks';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { LINKS } from 'src/constants';
import { Abbreviation } from 'src/components';
import {
  Box,
  Banner,
  Button,
  Layout,
  Panel,
  Radio,
  RadioCard,
  Stack,
  TextField,
} from 'src/components/matchbox';
import { ExternalLink, SubduedLink } from 'src/components/links';
import { SubduedText, TranslatableText } from 'src/components/text';
import { useHistory } from 'react-router-dom';
import SubaccountTypeahead from 'src/components/typeahead/SubaccountTypeahead';
import useDomains from '../hooks/useDomains';
import { DomainAlignmentModal } from './DomainAlignmentModal';
import useModal from 'src/hooks/useModal';

const initFilters = {
  type: { defaultValue: 'sending' },
};

export default function CreateForm() {
  const history = useHistory();
  const { filters } = usePageFilters(initFilters);
  const { type } = filters;

  function getDomainCreateType(type) {
    switch (type) {
      case 'sending':
      case 'bounce':
      case 'tracking':
        return type;
      default:
        return;
    }
  }

  const {
    createSendingDomain,
    createTrackingDomain,
    hasSubaccounts,
    createPending,
    showAlert,
  } = useDomains();

  const { control, register, handleSubmit, errors, watch, setValue } = useForm({
    defaultValues: {
      primaryUse: getDomainCreateType(type),
      assignTo: 'shared',
    },
  });

  const {
    closeModal,
    isModalOpen,
    openModal,
    meta: { assignTo, domain, subaccount } = {},
  } = useModal();
  const watchedPrimaryUse = watch('primaryUse');

  useEffect(() => {
    if (watchedPrimaryUse === 'tracking') {
      setValue('assignTo', 'principalOnly');
    }
  }, [watchedPrimaryUse, setValue]);

  const onSubmit = data => {
    const { assignTo, domain, primaryUse, subaccount } = data;

    if (primaryUse === 'tracking') {
      return createTrackingDomain({
        domain,
        subaccount,
      }).then(() => {
        history.push(`/domains/details/${domain}/verify-tracking`);
      });
    }

    if (primaryUse === 'bounce') {
      return createSendingDomain({
        assignTo,
        domain,
        subaccount,
      }).then(() => {
        showAlert({ type: 'success', message: `Bounce Domain ${domain} created` });
        history.push(`/domains/details/${domain}/verify-bounce`);
      });
    }

    if (primaryUse === 'sending') {
      openModal({ name: 'Domain Alignment', ...data });
    }
  };

  const onSubmitDomainAlignmentModal = data => {
    const { strictalignment } = data;
    return createSendingDomain({
      assignTo,
      domain,
      subaccount,
    }).then(() => {
      showAlert({ type: 'success', message: `Sending Domain ${domain} created` });
      if (strictalignment === 'yes') {
        history.push(`/domains/details/${domain}/verify-sending-bounce`);
      } else history.push(`/domains/details/${domain}/verify-sending`);
    });
  };
  return (
    <>
      <DomainAlignmentModal
        isOpen={isModalOpen}
        onSubmit={onSubmitDomainAlignmentModal}
        onClose={closeModal}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Layout>
          <Layout.Section annotated>
            <Layout.SectionTitle>Domain Type</Layout.SectionTitle>

            <Stack>
              <SubduedText fontSize="200">
                Adding a domain is very easy. You&rsquo;ll want to configure at least one domain for
                each domain type in order to get the most out of our sending and analytics.
              </SubduedText>

              <SubduedLink as={ExternalLink} to={LINKS.SENDING_REQS} fontSize="200">
                Domains Documentation
              </SubduedLink>
            </Stack>
          </Layout.Section>

          <Layout.Section>
            <Panel mb="0">
              <Panel.Section>
                <RadioCard.Group label="Primary Use for Domain">
                  <RadioCard
                    ref={register}
                    disabled={createPending}
                    label="Sending Domain"
                    id="primary-use-sending-domain"
                    value="sending"
                    name="primaryUse"
                  >
                    <TranslatableText>
                      A Sending Domain lets customers know where their mail is
                      &ldquo;From&rdquo;.&nbsp;
                    </TranslatableText>
                    <Abbreviation title="Domain Name System">DNS</Abbreviation>
                    <TranslatableText>
                      &nbsp;records should be configured based on this domain.
                    </TranslatableText>
                  </RadioCard>

                  <RadioCard
                    ref={register}
                    disabled={createPending}
                    label="Bounce Domain"
                    id="primary-use-bounce-domain"
                    value="bounce"
                    name="primaryUse"
                  >
                    Bounce domains are the return path address and are used for report bounces,
                    emails rejected from the recipient server.
                  </RadioCard>

                  <RadioCard
                    ref={register}
                    disabled={createPending}
                    label="Tracking Domain"
                    id="primary-use-tracking-domain"
                    value="tracking"
                    name="primaryUse"
                  >
                    Tracking domains are used to report engagement for your mail streams.
                  </RadioCard>
                </RadioCard.Group>
              </Panel.Section>
            </Panel>
          </Layout.Section>
        </Layout>
        <Layout>
          <Layout.Section annotated>
            <Layout.SectionTitle>Domain and Assignment</Layout.SectionTitle>
            <Banner status="warning" size="small">
              <p>Using a subdomain is recommended e.g. sub.domain.com</p>
            </Banner>
            <Box mt="400">
              <SubduedText fontSize="200">
                It may not be possible to completely configure your DNS records if you use your
                organizational domain.
              </SubduedText>
            </Box>
          </Layout.Section>

          <Layout.Section>
            <Panel mb="0">
              <Panel.Section>
                <TextField
                  ref={register({ required: 'A valid domain is required.' })}
                  disabled={createPending}
                  label="Domain"
                  control={control}
                  name="domain"
                  id="textfield-domain"
                  placeholder="e.g. sub.domain.com"
                  error={errors.domain?.message}
                />
              </Panel.Section>

              {hasSubaccounts && (
                <Panel.Section>
                  <Stack space="300">
                    <Radio.Group label="Subaccount Assignment">
                      {(watchedPrimaryUse === 'sending' || watchedPrimaryUse === 'bounce') && (
                        <Radio
                          ref={register}
                          disabled={createPending}
                          label="Share with all Subaccounts"
                          id="assign-to-shared"
                          value="shared"
                          name="assignTo"
                        />
                      )}

                      <Radio
                        ref={register}
                        disabled={createPending}
                        label="Assign to Primary Account"
                        id="assign-to-principal-only"
                        value="principalOnly"
                        name="assignTo"
                      />

                      <Radio
                        ref={register}
                        disabled={createPending}
                        label="Assign to Subaccount"
                        id="assign-to-subaccount"
                        value="singleSubaccount"
                        name="assignTo"
                      />
                    </Radio.Group>

                    {/* See https://react-hook-form.com/api#useWatch */}
                    <IsolatedSubaccountsField
                      control={control}
                      errors={errors}
                      createPending={createPending}
                    />
                  </Stack>
                </Panel.Section>
              )}
            </Panel>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section annotated />

          <Layout.Section>
            <Button loading={createPending} variant="primary" type="submit">
              Save and Continue
            </Button>
          </Layout.Section>
        </Layout>
      </form>
    </>
  );
}

function IsolatedSubaccountsField({ control, errors, createPending }) {
  const assignTo = useWatch({
    control,
    name: 'assignTo',
    defaultValue: 'shared',
  });

  if (assignTo !== 'singleSubaccount') return null;

  return (
    <Box marginLeft="500">
      <Controller
        control={control}
        name="subaccount"
        defaultValue=""
        rules={{ required: 'A valid subdomain is required.' }}
        render={({ name, onChange, value }) => {
          return (
            <SubaccountTypeahead
              name={name}
              disabled={createPending}
              onChange={item => {
                if (item) {
                  return onChange(item.id);
                }

                // Handles clear button
                return onChange(undefined);
              }}
              error={errors.subaccount?.message}
              placeholder="e.g. samplesubaccount"
              value={value}
            />
          );
        }}
      />
    </Box>
  );
}
