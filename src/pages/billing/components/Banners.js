import React from 'react';
import { format } from 'date-fns';
import { Banner } from '@sparkpost/matchbox';
import { Link } from 'react-router-dom';
import { LINKS } from 'src/constants';
import * as conversions from 'src/helpers/conversionTracking';
import { ANALYTICS_PREMIUM_SUPPORT, ANALYTICS_ENTERPRISE_SUPPORT } from 'src/constants';
import moment from 'moment';

const dateFormat = (date) => format(date, 'MMM DD, YYYY');

/**
 * Renders pending plan change information
 * @prop account Account state from redux store
 */
export const PendingPlanBanner = ({ account }) => {
  if (!account.pending_subscription) {
    return null;
  }

  return (
    <Banner status='info' title='Pending Plan Change' >
      <p>
        You're scheduled to switch to the {account.pending_subscription.name} plan
        on {dateFormat(account.pending_subscription.effective_date)}, and can't update your plan
        until that switch happens.
      </p>
    </Banner>
  );
};

/**
 * Premium Addon Plan CTA
 */

const premiumAction = {
  content: 'Contact Us',
  to: LINKS.PREMIUM_SUPPORT,
  external: true
};

const awsPremiumAction = {
  content: 'Request Premium Support',
  component: Link,
  to: '/support/aws-premium'
};

export const PremiumBanner = ({ isAWSAccount }) => (
  <Banner title='Premium Addon Plan' action={{
    ...(isAWSAccount ? awsPremiumAction : premiumAction),
    onClick: () => conversions.trackAddonRequest(ANALYTICS_PREMIUM_SUPPORT)
  }}>
    <p>Get full-service Technical Account Management with proactive reporting, planning & reviews.</p>
    <ul>
      <li>Includes all standard SparkPost features</li>
      <li>Dedicated Technical Account Manager (TAM)</li>
      <li>Global ISP relations and mediation</li>
      <li>Deliverability data analysis and guidance with 250ok</li>
    </ul>
  </Banner>
);

/**
 * Enterprise CTA
 */
export const EnterpriseBanner = () => (
  <Banner title='Enterprise' action={{
    content: 'Contact Us',
    to: LINKS.ENTERPRISE_SUPPORT,
    external: true,
    onClick: () => conversions.trackAddonRequest(ANALYTICS_ENTERPRISE_SUPPORT)
  }}>
    <p>Enterprise-grade financial guarantees with 99.9% uptime SLA and guaranteed burst rates.</p>
    <ul>
      <li>Includes all standard SparkPost and Premium features</li>
      <li>Comprehensive uptime SLAs with service credits</li>
      <li>The industry’s only burst-rate guarantee</li>
      <li>Support for iOS Universal Links and Android App Links</li>
    </ul>
  </Banner>
);

export const FreePlanWarningBanner = ({ account = {}}) => {
  const { created, subscription = {}} = account;
  const daysLeft = moment(created).add(30, 'd').diff(moment(new Date()), 'days');
  if (daysLeft <= 0 || subscription.code !== 'free15K-1018') {
    return null;
  }
  return (
    <Banner status='warning' title='Free Plan Downgrade'>
      <p>
        Your plan will automatically downgrade to 500 emails/month
        in {daysLeft} day{daysLeft !== 1 && 's'}. <Link to='/account/billing/plan'>Upgrade your plan</Link> to
        keep or increase your sending limits.
      </p>
    </Banner>
  );
};
