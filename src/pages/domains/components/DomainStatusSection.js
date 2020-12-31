import React from 'react';
import { Layout, Stack } from 'src/components/matchbox';
import { Checkbox, Columns, Column, Panel, Tooltip } from 'src/components/matchbox';
import { SubduedText } from 'src/components/text';
import { SendingDomainStatusCell as StatusCell } from './SendingDomainStatusCell';
import TrackingDomainStatusCell from './TrackingDomainStatusCell';
import { Bookmark } from '@sparkpost/matchbox-icons';
import { resolveStatus, resolveReadyFor } from 'src/helpers/domains';
import useDomains from '../hooks/useDomains';
import useModal from 'src/hooks/useModal';
import { ExternalLink, SubduedLink } from 'src/components/links';
import { ToggleBlock, Subaccount } from 'src/components';
import { EXTERNAL_LINKS } from '../constants';
import { ConfirmationModal } from 'src/components/modals';
import _ from 'lodash';
import { LabelValue } from 'src/components/matchbox';

export default function DomainStatusSection({ domain, id, isTracking }) {
  const { closeModal, isModalOpen, openModal } = useModal();
  const {
    showAlert,
    allowDefault,
    allowSubaccountDefault,
    updateSendingDomain,
    updateTrackingDomain,
    listTrackingDomains,
    updateTrackingPending,
    subaccounts,
  } = useDomains();

  const subaccountId = domain.subaccount_id;

  let subaccountName = _.find(subaccounts, ['id', subaccountId])?.name;

  const toggleDefaultBounce = () => {
    return updateSendingDomain({
      id,
      subaccount: subaccountId,
      is_default_bounce_domain: !domain.is_default_bounce_domain,
    }).catch(err => {
      throw err; // for error reporting
    });
  };

  const toggleDefaultTracking = () => {
    return updateTrackingDomain({
      domain: id,
      subaccount: subaccountId,
      default: !domain.defaultTrackingDomain,
    })
      .catch(_.noop) // ignore errors
      .then(() => listTrackingDomains());
  };

  const toggleShareWithSubaccounts = () => {
    const currentlyShared = domain.shared_with_subaccounts;

    return updateSendingDomain({
      id,
      subaccount: subaccountId,
      shared_with_subaccounts: !currentlyShared,
    })
      .then(() => {
        showAlert({
          type: 'success',
          message: `Successfully ${
            !currentlyShared ? 'shared' : 'un-shared'
          } this domain with all subaccounts.`,
        });
      })
      .catch(err => {
        throw err; // for error reporting
      });
  };

  if (isTracking) {
    const isDefault = domain.defaultTrackingDomain;
    const domainStatus = {
      blocked: domain.blocked,
      defaultTrackingDomain: domain.defaultTrackingDomain,
      unverified: domain.unverified,
      verified: domain.verified,
    };

    return (
      <Layout>
        <Layout.Section annotated>
          <Layout.SectionTitle as="h2">Domain Status</Layout.SectionTitle>
          <SubduedLink
            as={ExternalLink}
            to={EXTERNAL_LINKS.TRACKING_DOMAIN_DOCUMENTATION}
            fontSize="200"
          >
            Tracking Domain Documentation
          </SubduedLink>
        </Layout.Section>
        <Layout.Section>
          <Panel mb="0">
            <Panel.Section>
              <Columns space="100">
                <Column>
                  <LabelValue orientation="vertical">
                    <LabelValue.Label>Domain</LabelValue.Label>
                    <LabelValue.Value>{id}</LabelValue.Value>
                  </LabelValue>
                </Column>
                <Column>
                  <LabelValue orientation="vertical">
                    <LabelValue.Label>Status</LabelValue.Label>
                    <LabelValue.Value>
                      <TrackingDomainStatusCell domainStatus={domainStatus} />
                    </LabelValue.Value>
                  </LabelValue>
                </Column>
              </Columns>
            </Panel.Section>

            {subaccountId && (
              <Panel.Section>
                <LabelValue orientation="vertical">
                  <LabelValue.Label>Subaccount Assignment</LabelValue.Label>
                  <LabelValue.Value>
                    <Subaccount id={subaccountId} name={subaccountName} />
                  </LabelValue.Value>
                </LabelValue>
              </Panel.Section>
            )}

            {domain.verified && (
              <Panel.Section>
                <Checkbox
                  id="set-as-default-tracking-domain"
                  label={
                    <>
                      Set as Default Tracking Domain <Bookmark color="green" />
                    </>
                  }
                  checked={domain.defaultTrackingDomain}
                  onClick={() => openModal()}
                />

                <ConfirmationModal
                  open={isModalOpen}
                  title={`${isDefault ? 'Remove' : 'Set'} default tracking domain (${id})`}
                  content={
                    <p>
                      {isDefault
                        ? `Transmissions and templates that don't specify a tracking domain will no longer use ${id}. Instead, they will use the system default until another default is selected.`
                        : `Transmissions and templates that don't specify a tracking domain will now use ${id}.`}
                    </p>
                  }
                  isPending={updateTrackingPending}
                  onCancel={() => closeModal()}
                  onConfirm={() => toggleDefaultTracking()}
                  confirmVerb={isDefault ? 'Remove Default' : 'Set as Default'}
                />
              </Panel.Section>
            )}
          </Panel>
        </Layout.Section>
      </Layout>
    );
  }

  const readyFor = resolveReadyFor(domain.status);
  const resolvedStatus = resolveStatus(domain.status);
  const showDefaultBounceSubaccount = !subaccountId || (subaccountId && allowSubaccountDefault);
  const showDefaultBounceToggle =
    allowDefault && readyFor.sending && readyFor.bounce && showDefaultBounceSubaccount;

  return (
    <Layout>
      <Layout.Section annotated>
        <Layout.SectionTitle as="h2">Domain Status</Layout.SectionTitle>
        <Stack>
          {resolvedStatus === 'unverified' && (
            <SubduedText fontSize="200">
              This domain failed authentication. It can take 24 to 48 hours for the DNS record to
              propogate.
            </SubduedText>
          )}
          {resolvedStatus === 'unverified' && (
            <SubduedLink
              as={ExternalLink}
              to={EXTERNAL_LINKS.VERIFY_SENDING_DOMAIN_OWNERSHIP}
              fontSize="200"
            >
              Domain Documentation
            </SubduedLink>
          )}
          {resolvedStatus === 'verified' && (
            <Stack>
              <SubduedLink
                as={ExternalLink}
                to={EXTERNAL_LINKS.SENDING_DOMAINS_DOCUMENTATION}
                fontSize="200"
              >
                Sending Domain Documentation
              </SubduedLink>
              <SubduedLink
                as={ExternalLink}
                to={EXTERNAL_LINKS.SENDING_DOMAINS_API_DOCUMENTATION}
                fontSize="200"
              >
                Sending Domain API Documentation
              </SubduedLink>
            </Stack>
          )}
        </Stack>
      </Layout.Section>
      <Layout.Section>
        <Panel mb="0">
          <Panel.Section>
            <Columns space="100">
              <Column>
                <LabelValue orientation="vertical">
                  <LabelValue.Label>Domain</LabelValue.Label>
                  <LabelValue.Value>{domain.dkim?.signing_domain}</LabelValue.Value>
                </LabelValue>
              </Column>
              <Column>
                <LabelValue orientation="vertical">
                  <LabelValue.Label>Status</LabelValue.Label>
                  <LabelValue.Value>
                    <StatusCell domain={domain} />
                  </LabelValue.Value>
                </LabelValue>
              </Column>
              {domain.creation_time ? (
                <Column>
                  <LabelValue orientation="vertical">
                    <LabelValue.Label>Date Added</LabelValue.Label>
                    <LabelValue.Value>
                      {new Date(domain.creation_time).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </LabelValue.Value>
                  </LabelValue>
                </Column>
              ) : (
                <Column />
              )}
            </Columns>
          </Panel.Section>
          {resolvedStatus !== 'blocked' && (
            <>
              {subaccountId ? (
                <Panel.Section>
                  <LabelValue orientation="vertical">
                    <LabelValue.Label>Subaccount Assignment</LabelValue.Label>
                    <LabelValue.Value>
                      <Subaccount id={subaccountId} name={subaccountName} />
                    </LabelValue.Value>
                  </LabelValue>
                </Panel.Section>
              ) : (
                <Panel.Section>
                  <ToggleBlock
                    input={{
                      name: 'share-with-all-subaccounts',
                      checked: domain.shared_with_subaccounts,
                      onChange: toggleShareWithSubaccounts,
                    }}
                    label="Share this domain with all subaccounts"
                    variant="dense"
                  />
                </Panel.Section>
              )}
              {showDefaultBounceToggle && (
                <>
                  <Panel.Section>
                    <Checkbox
                      id="set-as-default-bounce-domain"
                      label={
                        <>
                          Set as Default Bounce Domain{' '}
                          <Tooltip
                            id="default-bounce-tooltip"
                            dark
                            content={`When this is set to "ON", all future transmissions ${
                              domain.subaccount_id ? 'for this subaccount ' : ''
                            }will use ${id} as their bounce domain (unless otherwise specified).`}
                          >
                            <Bookmark color="green" />
                          </Tooltip>
                        </>
                      }
                      checked={domain.is_default_bounce_domain}
                      onClick={toggleDefaultBounce}
                    />
                  </Panel.Section>
                </>
              )}
            </>
          )}
        </Panel>
      </Layout.Section>
    </Layout>
  );
}
