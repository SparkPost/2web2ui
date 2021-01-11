import React, { useEffect } from 'react';
import useDomains from '../hooks/useDomains';
import { usePrevious } from 'src/hooks';

export function VerifyToken({
  isTracking,
  domain,
  id,
  queryParams,
  sendingDomainsGetError,
  sendingDomainsPending,
}) {
  const {
    showAlert,
    verifyMailboxToken,
    verifyAbuseToken,
    verifyPostmasterToken,
    tokenStatus,
    subaccountsPending,
  } = useDomains();
  const prevTokenStatus = usePrevious(tokenStatus);
  useEffect(() => {
    if (
      !isTracking &&
      !sendingDomainsGetError &&
      !sendingDomainsPending &&
      !subaccountsPending &&
      domain.id === id
    ) {
      function verifyDomain({ mailbox, token }) {
        if (mailbox && domain && token) {
          const subaccount = !isNaN(parseInt(domain.subaccount_id))
            ? domain.subaccount_id
            : undefined;
          let verifyAction = verifyMailboxToken;

          if (mailbox === 'abuse') {
            verifyAction = verifyAbuseToken;
          }

          if (mailbox === 'postmaster') {
            verifyAction = verifyPostmasterToken;
          }

          return verifyAction({ id, token, subaccount });
        }
      }

      verifyDomain(queryParams);
    }
  }, [
    domain,
    id,
    isTracking,
    queryParams,
    sendingDomainsGetError,
    sendingDomainsPending,
    subaccountsPending,
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
      }
    }
  }, [id, prevTokenStatus, showAlert, tokenStatus]);

  return <></>;
}
