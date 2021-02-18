import React from 'react';
import { format } from 'date-fns';
import { PageLink, ExternalLink } from 'src/components/links';
import { Banner, Button, Box, Stack } from 'src/components/matchbox';
import { LINKS } from 'src/constants';
import { pluralString } from 'src/helpers/string';
import * as conversions from 'src/helpers/conversionTracking';
import { Abbreviation } from 'src/components';
import { ANALYTICS_PREMIUM_SUPPORT, ANALYTICS_ENTERPRISE_SUPPORT } from 'src/constants';
import _ from 'lodash';
const dateFormat = date => format(new Date(date), 'MMM dd, yyyy');

/**
 * Renders pending plan change information
 * @prop account Account state from redux store
 */
export const PendingPlanBanner = ({ account, subscription }) => {
  const pendingDowngrades = _.get(subscription, 'pending_downgrades', []);
  if (!account.pending_subscription && pendingDowngrades.length === 0) {
    return null;
  }

  if (pendingDowngrades.length > 0) {
    return (
      <Banner status="warning" title="Pending Plan Change" marginBottom="500">
        <Box maxWidth="1200">
          <p>
            You're scheduled for a pending downgrade and can't update your plan until that switch
            happens.
          </p>
        </Box>
      </Banner>
    );
  }

  return (
    <Banner status="warning" title="Pending Plan Change" marginBottom="500">
      <Box maxWidth="1200">
        <p>
          You're scheduled to switch to the {account.pending_subscription.name} plan on{' '}
          {dateFormat(account.pending_subscription.effective_date)}, and can't update your plan
          until that switch happens.
        </p>
      </Box>
    </Banner>
  );
};

export const PremiumBanner = () => {
  return (
    <Banner title="Premium Addon Plan" marginBottom="500">
      <Stack>
        <p>
          Full-service account advocacy with a dedicated Customer Success Manager. Including
          proactive reporting, planning, and reviews.
        </p>
        <ul>
          <li>Includes all standard SparkPost features</li>
          <li>Dedicated Customer Success Manager</li>
          <li>
            Global <Abbreviation title="Internet Service Provider">ISP</Abbreviation> support and
            mediation
          </li>
          <li>Deliverability data analysis and guidance with powerful integrated tools</li>
        </ul>
      </Stack>

      <Banner.Actions>
        <ExternalLink
          as={Button}
          to={LINKS.PREMIUM_SUPPORT}
          onClick={() => conversions.trackAddonRequest(ANALYTICS_PREMIUM_SUPPORT)}
        >
          Contact Us
        </ExternalLink>
      </Banner.Actions>
    </Banner>
  );
};

/**
 * Enterprise CTA
 */
export const EnterpriseBanner = () => {
  return (
    <Banner title="Enterprise" marginBottom="500">
      <Stack>
        <p>
          Enterprise-grade financial guarantees with 99.9% uptime{' '}
          <Abbreviation title="Service Level Agreement">SLA</Abbreviation> and guaranteed burst
          rates, and a dedicated Technical Account Manager.
        </p>
        <ul>
          <li>Includes all standard SparkPost and Premium features</li>
          <li>Comprehensive uptime SLAs with service credits</li>
          <li>The industry's only burst-rate guarantee</li>
          <li>Support of iOS Universal Links and Android App Links</li>
        </ul>
      </Stack>

      <Banner.Actions>
        <ExternalLink
          as={Button}
          to={LINKS.ENTERPRISE_SUPPORT}
          onClick={() => conversions.trackAddonRequest(ANALYTICS_ENTERPRISE_SUPPORT)}
        >
          Contact Us
        </ExternalLink>
      </Banner.Actions>
    </Banner>
  );
};

export const FreePlanWarningBanner = ({
  account = {},
  accountAgeInDays = 0,
  ageRangeStart = 0,
  ageRangeEnd = 30,
}) => {
  const { subscription = {}, pending_subscription } = account;
  if (pending_subscription || !subscription.code.includes('free15K')) {
    return null;
  }

  if (accountAgeInDays < ageRangeStart) {
    return null;
  }

  if (accountAgeInDays > ageRangeEnd) {
    return null;
  }

  const daysLeft = Math.floor(ageRangeEnd - accountAgeInDays) + 1;

  return (
    <Banner status="warning" title="Free Plan Downgrade" marginBottom="500">
      <p>
        Your plan will automatically downgrade to 500 emails/month in{' '}
        {pluralString(daysLeft, 'day')}.{' '}
        <PageLink to="/account/billing/plan">Upgrade your plan</PageLink> to keep or increase your
        sending limits.
      </p>
    </Banner>
  );
};
