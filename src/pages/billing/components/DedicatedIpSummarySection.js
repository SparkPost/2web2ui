import React from 'react';
import { Panel } from 'src/components/matchbox';

import { LabelledValue } from 'src/components';
import { PageLink } from 'src/components/links';
import { TranslatableText } from 'src/components/text';
import DedicatedIpCost from './DedicatedIpCost';

function noop() {}

export default function DedicatedIpSummarySection({
  count = 0,
  plan = {},
  onClick = noop,
  isTransitioningToSelfServe,
  canPurchaseIps,
  limitOnDedicatedIps,
  priceOfEachDedicatedIp,
  billingPeriodOfDedicatedIp,
}) {
  const hasReachedMax = count >= limitOnDedicatedIps;
  const disabledPurchaseIP = hasReachedMax || plan.isFree;

  // There are some paid accounts that do not allow dedicated IPs
  const actions = [
    {
      content: 'Manage Your IPs',
      to: '/account/ip-pools',
      Component: PageLink,
      color: 'orange',
      visible: count > 0,
    },
    canPurchaseIps
      ? {
          content: 'Add Dedicated IPs',
          disabled: disabledPurchaseIP,
          onClick,
          color: 'orange',
          visible: !isTransitioningToSelfServe,
        }
      : {
          content: 'Upgrade Now',
          to: '/account/billing/plan',
          Component: PageLink,
          color: 'orange',
          visible: !isTransitioningToSelfServe,
        },
  ];

  // Decrement count if plan includes one free IP
  const billableCount = count > 0 && plan.includesIp ? count - 1 : count;
  const summary =
    count === 0 ? (
      <h6>0</h6>
    ) : (
      <>
        <h6>
          <TranslatableText>{count} </TranslatableText> for{' '}
          <DedicatedIpCost
            quantity={billableCount}
            priceOfEachDedicatedIp={priceOfEachDedicatedIp}
            billingPeriodOfDedicatedIp={billingPeriodOfDedicatedIp}
          />
        </h6>
        {plan.includesIp && <p>Your plan includes one free dedicated IP address.</p>}
      </>
    );

  return (
    <Panel.LEGACY.Section actions={actions.filter(action => action.visible)}>
      <LabelledValue label="Dedicated IPs">
        {summary}
        {hasReachedMax && <p>You have reached the maximum allowed.</p>}
      </LabelledValue>
    </Panel.LEGACY.Section>
  );
}
