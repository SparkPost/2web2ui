import React from 'react';
import { formatDate } from 'src/helpers/date';
import { Text } from 'src/components/matchbox';
import { PageLink } from 'src/components/links';
import { FullBanner } from 'src/components/fullBanner';
import styles from './GlobalBanner.module.scss';

export default function GlobalBanner(props) {
  const { targetBanner } = props;

  if (!targetBanner) return null;

  if (targetBanner === 'pending-cancellation') {
    return <PendingCancelBanner {...props} />;
  }

  if (targetBanner === 'upgrade') {
    return <UpgradeBanner {...props} />;
  }
}

function PendingCancelBanner(props) {
  const { account, renewAccount, showAlert, fetchAccount } = props;
  const cancellationDate = account.pending_cancellation.effective_date;
  const formattedDate = formatDate(cancellationDate);

  const handleLinkClick = () => {
    return renewAccount().then(() => {
      showAlert({ type: 'success', message: 'Your account will not be cancelled.' });

      return fetchAccount();
    });
  };

  return (
    <FullBanner className={styles.GlobalBanner}>
      <Text>
        {`Your account will be cancelled on ${formattedDate} and you will no longer be able to send
        email or login. Changed your mind?`}
      </Text>

      <FullBanner.Link as="button" onClick={handleLinkClick}>
        Don&rsquo;t Cancel
      </FullBanner.Link>
    </FullBanner>
  );
}

function UpgradeBanner() {
  return (
    <FullBanner className={styles.GlobalBanner}>
      <Text>
        Gain access to all of the features we have to offer and increase your sending limits!
      </Text>

      <FullBanner.Link as={PageLink} to="/account/billing/plan">
        Upgrade Now
      </FullBanner.Link>
    </FullBanner>
  );
}
