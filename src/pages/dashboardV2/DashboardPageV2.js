import React, { useEffect } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Code, ChatBubble, LightbulbOutline, ShowChart, Sync } from '@sparkpost/matchbox-icons';
import SendingMailWebp from '@sparkpost/matchbox-media/images/Sending-Mail.webp';
import SendingMail from '@sparkpost/matchbox-media/images/Sending-Mail@medium.jpg';
import ConfigurationWebp from '@sparkpost/matchbox-media/images/Configuration.webp';
import Configuration from '@sparkpost/matchbox-media/images/Configuration@medium.jpg';
import { Loading, Abbreviation } from 'src/components';
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
import {
  ChartGroups,
  CompareByAggregatedMetrics,
  AggregatedMetrics,
} from 'src/components/reportBuilder';
import { getFormattedDateRangeForAggregateData } from 'src/helpers/date';
import { usePinnedReport } from 'src/hooks';
import useDashboardContext from './hooks/useDashboardContext';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import { LINKS } from 'src/constants';
import { useModal } from 'src/hooks';
import ChangeReportModal from './components/ChangeReportModal';
import { getMetricsFromKeys } from 'src/helpers/metrics';
import { _getAggregateDataReportBuilder } from 'src/actions/summaryChart';
import { usePrevious } from 'src/hooks';
import { AsyncActionModal } from 'src/components';
import { ActiveFilters } from 'src/components/reportBuilder';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';

const OnboardingImg = styled(Picture.Image)`
  vertical-align: bottom;
`;

export default function DashboardPageV2() {
  const {
    canViewUsage,
    canManageSendingDomains,
    canManageApiKeys,
    getAccount,
    getReports,
    listAlerts,
    getUsage,
    verifySendingLink,
    onboarding,
    isAnAdmin,
    isDev,
    currentUser,
    pending,
    listSendingDomains,
    listApiKeys,
    reports,
  } = useDashboardContext();
  const allReports = reports.map(report => ({ ...report, key: report.id }));
  const hasSetupDocumentationPanel = isAnAdmin || isDev;
  const history = useHistory();

  useEffect(() => {
    if (onboarding !== 'done') {
      segmentTrack(SEGMENT_EVENTS.DASHBOARD_ONBOARDING, {
        onboarding,
      });
    }
  }, [onboarding]);

  useEffect(() => {
    getAccount();
    listAlerts();
    if (canViewUsage) getUsage();
    if (canManageSendingDomains) listSendingDomains();
    if (canManageApiKeys) listApiKeys();
    getReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = useDispatch();

  const { closeModal, openModal, isModalOpen, meta: { name } = {} } = useModal();

  const { pinnedReport } = usePinnedReport(onboarding, reports);

  const prevReportQueryString = usePrevious(pinnedReport.query_string);

  useEffect(() => {
    if (!pinnedReport.loading && pinnedReport.query_string !== prevReportQueryString)
      dispatch(
        _getAggregateDataReportBuilder({
          ...pinnedReport.options,
          filters: pinnedReport.options.filters,
        }),
      );
  }, [
    dispatch,
    pinnedReport.loading,
    pinnedReport.options,
    pinnedReport.query_string,
    prevReportQueryString,
  ]);

  const dateValue = getFormattedDateRangeForAggregateData(
    pinnedReport?.options?.from,
    pinnedReport?.options?.to,
    pinnedReport?.options?.timezone,
  );
  if (pending) return <Loading />;

  return (
    <Dashboard>
      <ScreenReaderOnly>
        <Heading as="h1">Dashboard</Heading>
      </ScreenReaderOnly>

      <ChangeReportModal
        open={isModalOpen && name === 'Change Report'}
        onClose={closeModal}
        reports={allReports}
      />

      <AsyncActionModal
        open={isModalOpen && name === 'Filters'}
        actionVerb="View Report"
        onAction={() => history.push(pinnedReport.linkToReportBuilder)}
        onCancel={closeModal}
        title={`${pinnedReport.name} Filters `}
        maxWidth="1300"
      >
        <ActiveFilters filters={pinnedReport.options.filters} />
      </AsyncActionModal>

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
              {onboarding === 'done' && (
                <Dashboard.Panel>
                  <Panel.Header>
                    <Panel.Headline>{pinnedReport.name}</Panel.Headline>

                    <Panel.Action onClick={() => history.push(pinnedReport.linkToReportBuilder)}>
                      <TranslatableText>View Report</TranslatableText> <ShowChart size={25} />
                    </Panel.Action>

                    <Panel.Action onClick={() => openModal({ name: 'Change Report' })}>
                      <TranslatableText>Change Report</TranslatableText> <Sync size={25} />
                    </Panel.Action>
                  </Panel.Header>

                  {!pinnedReport.loading && (
                    <ChartGroups reportOptions={pinnedReport.options} p="0" small={true} />
                  )}
                  {pinnedReport.options.comparisons.length > 0 ? (
                    <CompareByAggregatedMetrics
                      date={dateValue}
                      reportOptions={pinnedReport.options}
                      handleClickFiltersButton={() => openModal({ name: 'Filters' })}
                      showFiltersButton={pinnedReport?.options?.filters.length > 0}
                    />
                  ) : (
                    <AggregatedMetrics
                      date={dateValue}
                      processedMetrics={getMetricsFromKeys(pinnedReport.options.metrics, true)}
                      handleClickFiltersButton={() => openModal({ name: 'Filters' })}
                      showFiltersButton={pinnedReport?.options?.filters.length > 0}
                    />
                  )}
                </Dashboard.Panel>
              )}
              {onboarding === 'analyticsReportPromo' && (
                <Dashboard.Panel>
                  <Columns>
                    <Column>
                      <Panel.Header>
                        <Panel.Headline>Analytics Report</Panel.Headline>
                      </Panel.Header>

                      <Panel.Section>
                        <Stack>
                          <Text>
                            Build custom analytics, track engagement, diagnose errors, and more.
                          </Text>
                          <div>
                            <PageLink variant="primary" to="/signals/analytics" as={Button}>
                              Go To Analytics Report
                            </PageLink>
                          </div>
                        </Stack>
                      </Panel.Section>
                    </Column>
                    <Box as={Column} display={['none', 'none', 'block']} width={[0, 0, 0.5]}>
                      <Dashboard.OnboardingPicture>
                        <source srcSet={ConfigurationWebp} type="image/webp" />
                        <OnboardingImg alt="" src={Configuration} seeThrough />
                      </Dashboard.OnboardingPicture>
                    </Box>
                  </Columns>
                </Dashboard.Panel>
              )}

              {onboarding === 'addSending' && (
                <Dashboard.Panel>
                  <Columns>
                    <Column>
                      <Panel.Header>
                        <Panel.Headline>Get Started!</Panel.Headline>
                      </Panel.Header>

                      <Panel.Section>
                        <Stack>
                          <Text>
                            <TranslatableText>At least one&nbsp;</TranslatableText>
                            <Bold>verified sending domain&nbsp;</Bold>
                            <TranslatableText>
                              is required in order to start or enable analytics.
                            </TranslatableText>
                          </Text>
                          <div>
                            <PageLink variant="primary" to="/domains/list/sending" as={Button}>
                              Add Sending Domain
                            </PageLink>
                          </div>
                        </Stack>
                      </Panel.Section>
                    </Column>
                    <Box as={Column} display={['none', 'none', 'block']} width={[0, 0, 0.5]}>
                      <Dashboard.OnboardingPicture>
                        <source srcSet={SendingMailWebp} type="image/webp" />
                        <OnboardingImg alt="" src={SendingMail} seeThrough />
                      </Dashboard.OnboardingPicture>
                    </Box>
                  </Columns>
                </Dashboard.Panel>
              )}

              {onboarding === 'verifySending' && (
                <Dashboard.Panel>
                  <Columns>
                    <Column>
                      <Panel.Header>
                        <Panel.Headline>Get Started!</Panel.Headline>
                      </Panel.Header>

                      <Panel.Section>
                        <Stack>
                          <Text>
                            <TranslatableText>
                              Once a sending domain has been added, it needs to be
                            </TranslatableText>
                            <Bold>&nbsp;verified.&nbsp;</Bold>
                            <TranslatableText>
                              Follow the instructions on the domain details page to configure your
                            </TranslatableText>
                            <TranslatableText>&nbsp;DNS settings.</TranslatableText>
                          </Text>
                          <div>
                            <PageLink variant="primary" to={verifySendingLink} as={Button}>
                              Verify Sending Domain
                            </PageLink>
                          </div>
                        </Stack>
                      </Panel.Section>
                    </Column>
                    <Box as={Column} display={['none', 'none', 'block']} width={[0, 0, 0.5]}>
                      <Dashboard.OnboardingPicture>
                        <source srcSet={SendingMailWebp} type="image/webp" />
                        <OnboardingImg alt="" src={SendingMail} seeThrough />
                      </Dashboard.OnboardingPicture>
                    </Box>
                  </Columns>
                </Dashboard.Panel>
              )}

              {onboarding === 'createApiKey' && (
                <Dashboard.Panel>
                  <Columns>
                    <Column>
                      <Panel.Header>
                        <Panel.Headline>Start Sending!</Panel.Headline>
                      </Panel.Header>

                      <Panel.Section>
                        <Stack>
                          <Text>
                            <TranslatableText>Create an&nbsp;</TranslatableText>
                            <Abbreviation title="Application Programming Interface">
                              API&nbsp;
                            </Abbreviation>
                            <TranslatableText>
                              key in order to start sending via API
                            </TranslatableText>
                            <TranslatableText>&nbsp;or</TranslatableText>
                            <Abbreviation title="Simple Mail Transfer Protocol">
                              &nbsp;SMTP.
                            </Abbreviation>
                          </Text>
                          <div>
                            <PageLink variant="primary" to="/account/api-keys/create" as={Button}>
                              Create API Key
                            </PageLink>
                          </div>
                        </Stack>
                      </Panel.Section>
                    </Column>
                    <Box as={Column} display={['none', 'none', 'block']} width={[0, 0, 0.5]}>
                      <Dashboard.OnboardingPicture>
                        <source srcSet={ConfigurationWebp} type="image/webp" />
                        <OnboardingImg alt="" src={Configuration} seeThrough />
                      </Dashboard.OnboardingPicture>
                    </Box>
                  </Columns>
                </Dashboard.Panel>
              )}

              {onboarding === 'startSending' && (
                <Dashboard.Panel>
                  <Columns>
                    <Column>
                      <Panel.Header>
                        <Panel.Headline>Start Sending!</Panel.Headline>
                      </Panel.Header>

                      <Panel.Section>
                        <Stack>
                          <Text>
                            <TranslatableText>
                              Follow the Getting Started documentation to set up sending via&nbsp;
                            </TranslatableText>
                            <Abbreviation title="Application Programming Interface">
                              API&nbsp;
                            </Abbreviation>
                            <TranslatableText>or</TranslatableText>
                            <Abbreviation title="Simple Mail Transfer Protocol">
                              &nbsp;SMTP.
                            </Abbreviation>
                          </Text>
                          <div>
                            <ExternalLink
                              variant="primary"
                              size="default"
                              showIcon={false}
                              to={LINKS.ONBOARDING_SENDING_EMAIL}
                              as={Button}
                            >
                              Getting Started Documentation
                            </ExternalLink>
                          </div>
                        </Stack>
                      </Panel.Section>
                    </Column>
                    <Box as={Column} display={['none', 'none', 'block']} width={[0, 0, 0.5]}>
                      <Dashboard.OnboardingPicture>
                        <source srcSet={ConfigurationWebp} type="image/webp" />
                        <OnboardingImg alt="" src={Configuration} seeThrough />
                      </Dashboard.OnboardingPicture>
                    </Box>
                  </Columns>
                </Dashboard.Panel>
              )}

              <div data-id="dashboard-helpful-shortcuts">
                <Dashboard.Panel>
                  <Panel.Header>
                    <Panel.Headline>
                      <Panel.HeadlineIcon as={LightbulbOutline} />
                      <TranslatableText>Helpful Shortcuts</TranslatableText>
                    </Panel.Headline>
                  </Panel.Header>

                  <Panel.Section>
                    <Columns collapseBelow="md">
                      {isAnAdmin && (
                        <Dashboard.Tip>
                          <PageLink to="/account/users/create">Invite a Team Member</PageLink>
                          <Text>
                            Need help integrating? Want to share an Analytics Report? Invite your
                            team!
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
                        <ExternalLink to={LINKS.INBOX_TRACKER}>Inbox Tracker</ExternalLink>
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
                      <Panel.Header>
                        <Panel.Headline>
                          <Panel.HeadlineIcon as={Code} />

                          <TranslatableText>Setup Documentation</TranslatableText>
                        </Panel.Headline>
                      </Panel.Header>

                      <Panel.Section>
                        <ExternalLink to={LINKS.INTEGRATION_DOCS}>
                          Integration Documentation
                        </ExternalLink>
                      </Panel.Section>
                    </Dashboard.Panel>
                  </Column>
                )}

                <Column>
                  <Dashboard.Panel>
                    <Panel.Header>
                      <Panel.Headline>
                        <Panel.HeadlineIcon as={ChatBubble} />

                        <TranslatableText>Need Help?</TranslatableText>
                      </Panel.Headline>
                    </Panel.Header>

                    <Panel.Section>
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
