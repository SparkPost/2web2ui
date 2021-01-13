import React from 'react';
import { Box, Grid, Inline, Layout, Stack, Panel } from 'src/components/matchbox';
import { ExternalLink, PageLink, SubduedLink } from 'src/components/links';
import { Heading, SubduedText } from 'src/components/text';
import { formatDate } from 'src/helpers/date';
import config from 'src/config';
import { LINKS, UNLIMITED_PLAN_VOLUME } from 'src/constants';
import { LabelAndKeyPair } from '.';
import MessagingUsageChart from './MessagingUsageChart';

export default function MessagingUsageSection({
  usage,
  messagingUsageHistory,
  usageHistoryStatus,
  subscription,
  endOfBillingPeriod,
  startOfBillingPeriod,
}) {
  const remaining = usage && subscription && subscription.plan_volume - usage.month.used;
  const overage =
    remaining < 0 && subscription.plan_volume !== UNLIMITED_PLAN_VOLUME ? Math.abs(remaining) : 0;
  const hasDailyLimit = usage && usage.day.limit && usage.day.limit > 0;
  const hasMonthlyLimit = usage && usage.month.limit && usage.month.limit > 0;
  const isNearingMonthlyLimit =
    usage && subscription && remaining > 0 && remaining / subscription.plan_volume < 0.1;
  const isNearingDailyLimit =
    usage && usage.day.used - usage.day.limit > 0 && usage.day.used / usage.day.limit > 0.9;

  const usageChart = React.useMemo(() => {
    if (usageHistoryStatus === 'loading' || usageHistoryStatus === 'error') {
      return null;
    }

    return (
      <Panel mb="-1px" data-id="messaging-usage-chart">
        <Panel.Section>
          <MessagingUsageChart
            data={messagingUsageHistory}
            dailyLimit={hasDailyLimit && usage.day.limit.toLocaleString()}
            planVolume={subscription.plan_volume}
            overage={overage}
            start={startOfBillingPeriod}
            end={endOfBillingPeriod}
          />
        </Panel.Section>
      </Panel>
    );
  }, [
    usageHistoryStatus,
    messagingUsageHistory,
    hasDailyLimit,
    usage.day.limit,
    subscription.plan_volume,
    overage,
    startOfBillingPeriod,
    endOfBillingPeriod,
  ]);

  return (
    <>
      <Layout.Section annotated>
        <Layout.SectionTitle as="h2">Messaging Usage</Layout.SectionTitle>
        <Stack>
          <Stack space="100">
            <SubduedText>All message injections count toward messaging usage.</SubduedText>
            <SubduedLink as={ExternalLink} to={LINKS.DAILY_USAGE}>
              Messaging Usage Definition
            </SubduedLink>
          </Stack>

          <Stack space="100">
            <Heading as="h3" looksLike="h6">
              Limits
            </Heading>
            <SubduedText>
              Each SparkPost account has a daily and monthly quota based on the current plan level
            </SubduedText>
            <SubduedLink as={ExternalLink} to={LINKS.DAILY_MONTHLY_QUOTA_LIMIT_DOC}>
              Quota Limits
            </SubduedLink>
          </Stack>

          {(isNearingMonthlyLimit || isNearingDailyLimit) && (
            <Stack space="100">
              <Heading as="h3" looksLike="h6">
                Upgrade
              </Heading>
              <SubduedText>
                Your usage indicates that you're nearing your daily or monthly limits. Upgrade your
                plan in <PageLink to="account/billing/plan">Billing</PageLink>.
              </SubduedText>
            </Stack>
          )}
        </Stack>
      </Layout.Section>

      <Layout.Section>
        {usage && (
          <Stack space="0">
            {usageChart}
            <Box padding="400" backgroundColor="gray.1000">
              <Stack>
                <Grid>
                  {subscription.period === 'month' && (
                    //hiding it since the billing cycle will not be correct for users on annual messaging plans
                    <Grid.Column sm={3}>
                      <Box id="date">
                        <LabelAndKeyPair
                          label="Billing Cycle"
                          value={`${formatDate(
                            startOfBillingPeriod,
                            config.dateFormat,
                          )} - ${formatDate(endOfBillingPeriod, config.dateFormat)}`}
                        ></LabelAndKeyPair>
                      </Box>
                    </Grid.Column>
                  )}
                  <Grid.Column sm={9}>
                    <Inline space="400">
                      <Box>
                        <LabelAndKeyPair
                          label="Today's Usage"
                          value={usage.day.used.toLocaleString()}
                        ></LabelAndKeyPair>
                      </Box>
                      <Box>
                        {hasDailyLimit && (
                          <LabelAndKeyPair
                            label="Daily Limit"
                            value={usage.day.limit.toLocaleString()}
                          ></LabelAndKeyPair>
                        )}
                      </Box>
                    </Inline>
                  </Grid.Column>
                </Grid>
                <Grid>
                  {subscription.period === 'month' && (
                    <Grid.Column sm={3}>
                      <Box></Box>
                    </Grid.Column>
                  )}
                  <Grid.Column sm={9}>
                    <Inline space="400">
                      <Box>
                        <LabelAndKeyPair
                          label="Month's Usage"
                          value={usage.month.used.toLocaleString()}
                        ></LabelAndKeyPair>
                      </Box>
                      {subscription.plan_volume !== UNLIMITED_PLAN_VOLUME && (
                        <Box>
                          <LabelAndKeyPair
                            label="Monthly Allotment"
                            value={subscription.plan_volume.toLocaleString()}
                          ></LabelAndKeyPair>
                        </Box>
                      )}
                      {overage > 0 && (
                        <Box>
                          <LabelAndKeyPair
                            label="Month's Overages"
                            value={overage.toLocaleString()}
                          ></LabelAndKeyPair>
                        </Box>
                      )}
                      {hasMonthlyLimit && (
                        <Box>
                          <LabelAndKeyPair
                            label="Monthly Limit"
                            value={usage.month.limit.toLocaleString()}
                          ></LabelAndKeyPair>
                        </Box>
                      )}
                    </Inline>
                  </Grid.Column>
                </Grid>
              </Stack>
            </Box>
          </Stack>
        )}
      </Layout.Section>
    </>
  );
}
