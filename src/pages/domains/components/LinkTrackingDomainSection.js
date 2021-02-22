import React from 'react';
import { connect } from 'react-redux';
import { Button, Layout, Panel, Select, Stack } from 'src/components/matchbox';
import { Form } from 'src/components/form';
import { SubduedText } from 'src/components/text';
import { ExternalLink, SubduedLink } from 'src/components/links';
import { useForm, Controller } from 'react-hook-form';
import useDomains from '../hooks/useDomains';
import { EXTERNAL_LINKS } from '../constants';
import { selectTrackingDomainsOptions } from 'src/selectors/trackingDomains';

function LinkTrackingDomainSection({ domain, isSectionVisible, trackingDomainOptions }) {
  const { control, handleSubmit, watch } = useForm();
  const { updateSendingDomain, showAlert } = useDomains();

  const onSubmit = ({ trackingDomain }) => {
    const { id, subaccount_id: subaccount } = domain;
    updateSendingDomain({ id, subaccount, tracking_domain: trackingDomain })
      .then(() =>
        showAlert({
          type: 'success',
          message: 'Tracking domain assignment updated.',
        }),
      )
      .catch(err =>
        showAlert({
          type: 'error',
          message: 'Could not update tracking domain assignment.',
          details: err.message,
        }),
      );
  };

  if (!isSectionVisible) {
    return null;
  }

  return (
    <Layout>
      <Layout.Section annotated>
        <Layout.SectionTitle as="h2">Link Tracking Domain</Layout.SectionTitle>
        <Stack>
          <SubduedText fontSize="200">Assign a tracking domain.</SubduedText>
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
          <Panel mb="0">
            <Panel.Section>
              <Controller
                name="trackingDomain"
                render={({ value, onChange }) => (
                  <Select
                    onChange={onChange}
                    value={value || domain.tracking_domain}
                    options={trackingDomainOptions || []}
                    label="Linked Tracking Domain"
                    helpText="Domains must be verified to be linked to a sending domain."
                  />
                )}
                control={control}
              />
            </Panel.Section>
            <Panel.Section>
              <Button
                variant="primary"
                type="submit"
                disabled={
                  watch('trackingDomain') === domain.tracking_domain ||
                  !Boolean(watch('trackingDomain'))
                }
              >
                Update Tracking Domain
              </Button>
            </Panel.Section>
          </Panel>
        </Form>
      </Layout.Section>
    </Layout>
  );
}

export default connect(
  (state, props) => ({
    trackingDomainOptions: selectTrackingDomainsOptions(state, props),
  }),
  null,
)(LinkTrackingDomainSection);
