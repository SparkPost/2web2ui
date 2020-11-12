import React, { useEffect, useState } from 'react';
import { Code, ChatBubble, LightbulbOutline } from '@sparkpost/matchbox-icons';
import SendingMailWebp from '@sparkpost/matchbox-media/images/Sending-Mail.webp';
import SendingMail from '@sparkpost/matchbox-media/images/Sending-Mail@medium.jpg';
import ConfigurationWebp from '@sparkpost/matchbox-media/images/Configuration.webp';
import Configuration from '@sparkpost/matchbox-media/images/Configuration@medium.jpg';
import { Loading } from 'src/components';
import {
  Box,
  Button,
  Columns,
  Column,
  Layout,
  Panel,
  Picture,
  ScreenReaderOnly,
  Stack,
  Text,
} from 'src/components/matchbox';
import { Bold, Heading, TranslatableText } from 'src/components/text';
import { ExternalLink, PageLink, SupportTicketLink } from 'src/components/links';
import useDashboardContext from './hooks/useDashboardContext';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import { LINKS } from 'src/constants';
import styled from 'styled-components';
import { resolveStatus } from 'src/helpers/domains';

const OnboardingPicture = styled(Picture.Image)`
  vertical-align: bottom;
`;

export default function DashboardPageV2() {
  const {
    getAccount,
    listAlerts,
    isAnAdmin,
    isDev,
    canManageSendingDomains,
    getUsage,
    currentUser,
    pending,
    listSendingDomains,
    listApiKeys,
  } = useDashboardContext();

  const hasSetupDocumentationPanel = isAnAdmin || isDev;

  // TODO: useReducer instead
  const [addSendingDomainOnboarding, setAddSendingDomainOnboarding] = useState(false);
  const [verifySendingDomainOnboarding, setVerifySendingDomainOnboarding] = useState(false);
  const [createApiKeyOnboarding, setCreateApiKeyOnboarding] = useState(false);
  const [linkForVerifySendingDomainButton, setLinkForVerifySendingDomainButton] = useState(
    '/domains/list/sending',
  );
  const [lastUsageDate, setlastUsageDate] = useState(-1);

  function setupOnboardingState(lastUsageDate, sendingDomains, apiKeys) {
    setlastUsageDate(lastUsageDate);

    const addSendingDomainNeeded = (isAnAdmin || isDev) && sendingDomains.length === 0;
    setAddSendingDomainOnboarding(addSendingDomainNeeded);

    const verifiedSendingDomains = sendingDomains
      .map(i => {
        return resolveStatus(i.status) === 'verified' ? i : null;
      })
      .filter(Boolean);

    const verifySendingNeeded = !addSendingDomainOnboarding && verifiedSendingDomains.length === 0;
    setVerifySendingDomainOnboarding(verifySendingNeeded);

    if (sendingDomains.length === 1 && verifiedSendingDomains.length === 0) {
      setLinkForVerifySendingDomainButton(
        `/domains/details/sending-bounce/${sendingDomains[0].domain}`,
      );
    }

    const createApiKeyNeeded =
      !addSendingDomainOnboarding && !verifySendingDomainOnboarding && apiKeys.length === 0;
    setCreateApiKeyOnboarding(createApiKeyNeeded);
  }

  useEffect(() => {
    return Promise.all([
      getAccount({ include: 'usage' }),
      listAlerts(),
      getUsage(),
      listSendingDomains(),
      listApiKeys(),
    ]).then(responseArr => {
      // eslint-disable-next-line no-unused-vars
      const [account, alerts, usage, sendingDomains, apiKeys] = responseArr;
      setupOnboardingState(usage?.messaging?.last_usage_date, sendingDomains, apiKeys);
    });
    // eslint-disable-next-line
  }, []);

  if (pending || lastUsageDate === -1) return <Loading />;

  return (
    <Dashboard>
      <ScreenReaderOnly>
        <Heading as="h1">Dashboard</Heading>
      </ScreenReaderOnly>

      <Stack>
        {currentUser?.first_name && (
          <Dashboard.Heading>
            <TranslatableText>Welcome, </TranslatableText>
            {currentUser.first_name}!
          </Dashboard.Heading>
        )}

        <Layout>
          <Layout.Section>
            <Stack>
              {(isAnAdmin || isDev) && canManageSendingDomains && !lastUsageDate && (
                <Dashboard.Panel>
                  <ScreenReaderOnly>
                    <Heading as="h3">Next Steps</Heading>
                  </ScreenReaderOnly>

                  {addSendingDomainOnboarding && (
                    <Columns>
                      <Column>
                        <Panel.Section>
                          <Panel.Headline>
                            <TranslatableText>Get Started!</TranslatableText>
                          </Panel.Headline>
                          <Text pb="600">
                            <TranslatableText>At least one </TranslatableText>
                            <Bold>verified sending domain </Bold>
                            <TranslatableText>
                              is required in order to start or enable analytics.
                            </TranslatableText>
                          </Text>
                          <PageLink
                            data-id="onboarding-add-sending-button"
                            variant="primary"
                            size="default"
                            color="blue"
                            to="/domains/list/sending"
                            as={Button}
                          >
                            Add Sending Domain
                          </PageLink>
                        </Panel.Section>
                      </Column>
                      <Box as={Column} display={['none', 'none', 'block']} width={[0, 0, 0.5]}>
                        <Box height="100%">
                          <Picture role="presentation">
                            <source srcset={SendingMailWebp} type="image/webp" />
                            <OnboardingPicture alt="" src={SendingMail} seeThrough />
                          </Picture>
                        </Box>
                      </Box>
                    </Columns>
                  )}

                  {!addSendingDomainOnboarding && verifySendingDomainOnboarding && (
                    <Columns>
                      <Column>
                        <Panel.Section>
                          <Panel.Headline>
                            <TranslatableText>Get Started!</TranslatableText>
                          </Panel.Headline>
                          <Text pb="600">
                            <TranslatableText>
                              Once a sending domain has been added, it needs to be
                            </TranslatableText>
                            <Bold> verified. </Bold>
                            <TranslatableText>
                              Follow the instructions on the domain details page to configure your
                            </TranslatableText>
                            <TranslatableText> DNS settings.</TranslatableText>
                          </Text>
                          <PageLink
                            data-id="onboarding-verify-sending-button"
                            variant="primary"
                            size="default"
                            color="blue"
                            to={linkForVerifySendingDomainButton}
                            as={Button}
                          >
                            Verify Sending Domain
                          </PageLink>
                        </Panel.Section>
                      </Column>
                      <Box as={Column} display={['none', 'none', 'block']} width={[0, 0, 0.5]}>
                        <Box height="100%">
                          <Picture role="presentation">
                            <source srcset={SendingMailWebp} type="image/webp" />
                            <OnboardingPicture alt="" src={SendingMail} seeThrough />
                          </Picture>
                        </Box>
                      </Box>
                    </Columns>
                  )}

                  {!addSendingDomainOnboarding &&
                    !verifySendingDomainOnboarding &&
                    createApiKeyOnboarding && (
                      <Columns>
                        <Column>
                          <Panel.Section>
                            <Panel.Headline>
                              <TranslatableText>Start Sending!</TranslatableText>
                            </Panel.Headline>
                            <Text pb="600">
                              Create an API key in order to start sending via API or SMTP.
                            </Text>
                            <ExternalLink
                              data-id="onboarding-create-api-key-button"
                              variant="primary"
                              size="default"
                              color="blue"
                              showIcon={false}
                              to="/account/api-keys/create"
                              as={Button}
                            >
                              Create API Key
                            </ExternalLink>
                          </Panel.Section>
                        </Column>
                        <Box as={Column} display={['none', 'none', 'block']} width={[0, 0, 0.5]}>
                          <Box height="100%">
                            <Picture role="presentation">
                              <source srcset={ConfigurationWebp} type="image/webp" />
                              <OnboardingPicture alt="" src={Configuration} seeThrough />
                            </Picture>
                          </Box>
                        </Box>
                      </Columns>
                    )}

                  {!addSendingDomainOnboarding &&
                    !verifySendingDomainOnboarding &&
                    !createApiKeyOnboarding && (
                      <Columns>
                        <Column>
                          <Panel.Section>
                            <Panel.Headline>
                              <TranslatableText>Start Sending!</TranslatableText>
                            </Panel.Headline>
                            <Text pb="600">
                              Follow the Getting Started documentation to set up sending via API or
                              SMTP.
                            </Text>
                            <ExternalLink
                              variant="primary"
                              size="default"
                              color="blue"
                              showIcon={false}
                              to={LINKS.ONBOARDING_SENDING_EMAIL}
                              as={Button}
                            >
                              Getting Started Documentation
                            </ExternalLink>
                          </Panel.Section>
                        </Column>
                        <Box as={Column} display={['none', 'none', 'block']} width={[0, 0, 0.5]}>
                          <Box height="100%">
                            <Picture role="presentation">
                              <source srcset={ConfigurationWebp} type="image/webp" />
                              <OnboardingPicture alt="" src={Configuration} seeThrough />
                            </Picture>
                          </Box>
                        </Box>
                      </Columns>
                    )}
                </Dashboard.Panel>
              )}

              <div data-id="dashboard-helpful-shortcuts">
                <Dashboard.Panel>
                  <Panel.Section>
                    <Panel.Headline>
                      <Panel.HeadlineIcon as={LightbulbOutline} />
                      <TranslatableText>Helpful Shortcuts</TranslatableText>
                    </Panel.Headline>

                    <Columns collapseBelow="md">
                      {isAnAdmin && (
                        <Dashboard.Tip>
                          <PageLink to="/account/users/create">Invite a Team Member</PageLink>
                          <Text>
                            Need help integrating? Want to share Analytics Report? Invite your team!
                          </Text>
                        </Dashboard.Tip>
                      )}
                      {!isAnAdmin && (
                        <Dashboard.Tip>
                          <PageLink to="/templates">Templates</PageLink>
                          <Text>
                            Programmatically tailor each message with SparkPost’s flexible
                            templates.
                          </Text>
                        </Dashboard.Tip>
                      )}
                      <Dashboard.Tip>
                        <PageLink to="/reports/message-events">Events</PageLink>
                        <Text>
                          Robust searching capabilities with ready access to the raw event data from
                          your emails.
                        </Text>
                      </Dashboard.Tip>
                      <Dashboard.Tip>
                        <ExternalLink to="https://www.sparkpost.com/inbox-tracker/">
                          Inbox Tracker
                        </ExternalLink>
                        <Text>
                          Examine every element of deliverability with precision using Inbox
                          Tracker.
                        </Text>
                      </Dashboard.Tip>
                    </Columns>
                  </Panel.Section>
                </Dashboard.Panel>
              </div>

              <Columns collapseBelow="md" space="500">
                {hasSetupDocumentationPanel && (
                  <Column>
                    <Dashboard.Panel>
                      <Panel.Section>
                        <Panel.Headline>
                          <Panel.HeadlineIcon as={Code} />

                          <TranslatableText>Setup Documentation</TranslatableText>
                        </Panel.Headline>

                        <ExternalLink to="/">Integration Documentation</ExternalLink>
                      </Panel.Section>
                    </Dashboard.Panel>
                  </Column>
                )}

                <Column>
                  <Dashboard.Panel>
                    <Panel.Section>
                      <Panel.Headline>
                        <Panel.HeadlineIcon as={ChatBubble} />
                        <TranslatableText>Need Help?</TranslatableText>
                      </Panel.Headline>

                      <SupportTicketLink>Contact our Support Team</SupportTicketLink>
                    </Panel.Section>
                  </Dashboard.Panel>
                </Column>

                {/* Used to shift the "Need Help?" Panel to align to the left */}
                {!hasSetupDocumentationPanel && <Column />}
              </Columns>
            </Stack>
          </Layout.Section>

          <Layout.Section annotated>
            <Sidebar>
              <Sidebar.AccountDetails />
              <Sidebar.BillingUsage />
              <Sidebar.RecentAlerts />
            </Sidebar>
          </Layout.Section>
        </Layout>
      </Stack>
    </Dashboard>
  );
}
