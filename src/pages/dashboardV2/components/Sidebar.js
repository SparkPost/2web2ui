import React from 'react';
import styled from 'styled-components';
import capitalize from 'lodash/capitalize';
import config from 'src/config';
import { Box, Layout, Stack, Tag, Text } from 'src/components/matchbox';
import { Bold, Heading, SubduedText, TranslatableText } from 'src/components/text';
import { PageLink } from 'src/components/links';
import { formatFullNumber } from 'src/helpers/units';
import { formatDate } from 'src/helpers/date';
import { snakeToFriendly } from 'src/helpers/string';
import useDashboardContext from '../hooks/useDashboardContext';
import { Rocket } from '@sparkpost/matchbox-icons';

const UpgradeLink = styled(PageLink)`
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.semibold};
`;
const UpgradeIcon = styled(Rocket)`
  color: ${props => props.theme.colors.brand.orange};
`;
function AccountDetails() {
  const { currentUser } = useDashboardContext();

  return (
    <div data-id="sidebar-account-details">
      <Layout.SectionTitle as="h3">Account Details</Layout.SectionTitle>

      <SidebarStack>
        <Heading as="h4" looksLike="h5">
          Profile
        </Heading>

        {currentUser?.email && <SidebarParagraph>{currentUser.email}</SidebarParagraph>}

        {/* Needed to prevent tag from stretching to full width with the wrapping element */}
        {currentUser?.access_level && (
          <div>
            <Tag>{capitalize(currentUser.access_level)}</Tag>
          </div>
        )}
      </SidebarStack>
    </div>
  );
}

function BillingUsage() {
  const {
    currentPlanName,
    endOfBillingPeriod,
    transmissionsThisMonth,
    transmissionsInPlan,
    validationsThisMonth,
    hasUpgradeLink,
    hasUsageSection,
  } = useDashboardContext();

  return (
    <div data-id="sidebar-billing-usage-detail">
      <Layout.SectionTitle as="h3">Billing/Usage Detail</Layout.SectionTitle>

      <Stack space="600">
        {currentPlanName ? (
          <SidebarStack>
            <Box display="flex" justifyContent="space-between">
              <Heading as="h4" looksLike="h5">
                <TranslatableText>Sending Plan</TranslatableText>
              </Heading>

              {hasUpgradeLink && (
                <UpgradeLink to="/account/billing/plan">
                  Upgrade&nbsp;
                  <UpgradeIcon size={16} />
                </UpgradeLink>
              )}
            </Box>

            <SidebarParagraph>{`${currentPlanName} Plan`}</SidebarParagraph>

            {hasUsageSection && transmissionsThisMonth && transmissionsInPlan ? (
              <div data-id="transmissions-usage-section">
                <SidebarParagraph>
                  <Bold data-id="sidebar-transmissions-this-month">
                    {formatFullNumber(transmissionsThisMonth)}
                  </Bold>

                  <TranslatableText>&nbsp;of&nbsp;</TranslatableText>

                  <Bold data-id="sidebar-transmissions-in-plan">
                    {formatFullNumber(transmissionsInPlan)}
                  </Bold>

                  <TranslatableText>&nbsp;this month</TranslatableText>
                </SidebarParagraph>
              </div>
            ) : null}
          </SidebarStack>
        ) : null}

        {hasUsageSection && validationsThisMonth ? (
          <div data-id="validations-usage-section">
            <SidebarStack>
              <Heading as="h4" looksLike="h5">
                Recipient Validation
              </Heading>

              <SidebarParagraph>
                <Bold data-id="sidebar-validations-this-month">
                  {formatFullNumber(validationsThisMonth)}
                </Bold>

                <TranslatableText>&nbsp;address validations this month</TranslatableText>
              </SidebarParagraph>
            </SidebarStack>
          </div>
        ) : null}

        {hasUsageSection ? (
          <div>
            {endOfBillingPeriod ? (
              <SubduedText>
                <TranslatableText>Your billing period ends </TranslatableText>

                <span data-id="sidebar-validations-end-of-billing-period">
                  {formatDate(endOfBillingPeriod, config.dateFormatWithComma)}
                </span>
              </SubduedText>
            ) : null}

            <PageLink to="/usage">View Usage Numbers</PageLink>
          </div>
        ) : null}
      </Stack>
    </div>
  );
}

function RecentAlerts() {
  const { recentAlerts } = useDashboardContext();
  const hasAlerts = recentAlerts?.length > 0;

  if (!hasAlerts) return null;

  return (
    <div data-id="sidebar-recent-alerts">
      <SidebarStack>
        <Layout.SectionTitle as="h3">Recent Alerts</Layout.SectionTitle>

        <Stack>
          {recentAlerts.map((alert, index) => {
            const formattedDate = formatDate(alert.last_triggered, config.dateFormatWithComma);
            const formattedMetric = snakeToFriendly(alert.metric);

            return (
              <Stack space="200" key={`recent-alert-${index}`}>
                <PageLink to={`/alerts/details/${alert.id}`}>{alert.name}</PageLink>

                <SubduedText>{formattedDate}</SubduedText>

                {/* Extra <div> here prevents flex parent from stretching tag to full width */}
                <div>
                  <Tag>{formattedMetric}</Tag>
                </div>
              </Stack>
            );
          })}
        </Stack>
      </SidebarStack>
    </div>
  );
}

function Sidebar({ children }) {
  return <Stack space="700">{children}</Stack>;
}

function SidebarParagraph({ children }) {
  return <Text color="gray.800">{children}</Text>;
}

function SidebarStack({ children }) {
  return <Stack space="200">{children}</Stack>;
}

Sidebar.AccountDetails = AccountDetails;
Sidebar.BillingUsage = BillingUsage;
Sidebar.RecentAlerts = RecentAlerts;

export default Sidebar;
