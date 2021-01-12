import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { usePrevious } from 'src/hooks';
import _ from 'lodash';
import useDomains from '../hooks/useDomains';

export function VerifyToken({
  domains,
  isTracking,
  queryParams,
  sendingDomainsListError,
  listPending,
}) {
  const history = useHistory();
  const {
    verifyMailboxToken,
    verifyAbuseToken,
    verifyPostmasterToken,
    showAlert,
    tokenStatus,
  } = useDomains();
  const prevTokenStatus = usePrevious(tokenStatus);

  useEffect(() => {
    if (!isTracking && !sendingDomainsListError && !listPending) {
      function verifyDomain({ mailbox, domain, token }) {
        // Find the domain to inject subaccount
        const sendingDomain = _.find(domains, { domainName: domain });

        if (sendingDomain && mailbox && domain && token) {
          const subaccount = !isNaN(parseInt(sendingDomain.subaccount_id))
            ? sendingDomain.subaccount_id
            : undefined;
          let verifyAction = verifyMailboxToken;

          if (mailbox === 'abuse') {
            verifyAction = verifyAbuseToken;
          }

          if (mailbox === 'postmaster') {
            verifyAction = verifyPostmasterToken;
          }

          return verifyAction({ id: domain, token, subaccount });
        }
      }

      verifyDomain(queryParams);
    }
  }, [
    domains,
    isTracking,
    listPending,
    queryParams,
    sendingDomainsListError,
    verifyAbuseToken,
    verifyMailboxToken,
    verifyPostmasterToken,
  ]);

  useEffect(() => {
    // Api returns a 200 even if domain has not been verified
    // Manually check if this domain has been verified
    if (prevTokenStatus !== tokenStatus && !prevTokenStatus && tokenStatus) {
      if (tokenStatus[`${tokenStatus.type}_status`] !== 'valid') {
        showAlert({ type: 'error', message: `Unable to verify ${tokenStatus.domain}` });
      } else {
        showAlert({ type: 'success', message: `${tokenStatus.domain} has been verified` });
        history.push(`/domains/details/sending-bounce/${tokenStatus.domain}`);
      }
    }
  }, [history, prevTokenStatus, showAlert, tokenStatus]);

  return <></>;
}
