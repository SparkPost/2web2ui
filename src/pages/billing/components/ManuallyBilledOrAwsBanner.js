import React from 'react';
import { Banner, Box, Button } from 'src/components/matchbox';
import { PageLink, SupportTicketLink } from 'src/components/links';

/**
 * Renders plan information for non-self-serve users
 * @prop account Account state from redux store
 */
const ManuallyBilledOrAwsBanner = ({
  account: {
    subscription: {
      custom,
      name: subscriptionName,
      period = 'month',
      plan_volume: planVolume,
      plan_volume_per_period: planVolumePerPeriod,
      recurring_charge: recurringCharge,
    },
  },
  onZuoraPlan,
}) => {
  const localePlanVolume = (planVolumePerPeriod || planVolume).toLocaleString();
  const title = `
    Your current ${subscriptionName} plan includes ${localePlanVolume} emails per ${period}
  `;

  // this is an edge case that will only happen if the custom plan is not configured correctly
  // with charge and volume
  if (custom && (!planVolumePerPeriod || !recurringCharge)) {
    return (
      <Banner
        status="warning"
        title={`Your current plan is being transitioned to a ${subscriptionName} plan`}
      >
        <p>
          If your account should not be transitioned, please{' '}
          {<SupportTicketLink issueId="general_issue">submit a support ticket</SupportTicketLink>}.
        </p>
      </Banner>
    );
  }

  if (onZuoraPlan)
    return (
      <Banner status="info" title={title}>
        <p>
          To make changes to your plan or billing information, please{' '}
          {<SupportTicketLink issueId="general_issue">submit a support ticket</SupportTicketLink>}.
        </p>

        <Box marginTop="400">
          <p>Enable automatic billing to self-manage your plan and add-ons.</p>
        </Box>

        <Banner.Actions>
          <PageLink as={Button} to="/account/billing/enable-automatic">
            Enable Automatic Billing
          </PageLink>
        </Banner.Actions>
      </Banner>
    );

  return (
    <Banner status="info" title={title}>
      <p>
        To make changes to your plan or billing information, please{' '}
        {<SupportTicketLink issueId="general_issue">submit a support ticket</SupportTicketLink>}.
      </p>
    </Banner>
  );
};

export default ManuallyBilledOrAwsBanner;
