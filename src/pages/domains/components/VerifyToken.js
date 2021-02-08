import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import useDomains from '../hooks/useDomains';
import { SENDING_DOMAIN_TOKEN_TYPE } from 'src/constants';

export function VerifyToken({
  domains,
  isTracking,
  queryParams,
  sendingDomainsListError,
  loading,
}) {
  const history = useHistory();
  const {
    verifyMailboxToken,
    verifyAbuseToken,
    verifyPostmasterToken,
    showAlert,
    tokenStatus,
    verifyTokenError,
  } = useDomains();

  useEffect(() => {
    if (
      !isTracking &&
      !sendingDomainsListError &&
      !loading &&
      !verifyTokenError &&
      !tokenStatus?.type
    ) {
      function verifyDomain({ mailbox, domain, token }) {
        // Find the domain to inject subaccount
        const sendingDomain = _.find(domains, { domainName: domain });

        if (sendingDomain && mailbox && domain && token) {
          const subaccount = !isNaN(parseInt(sendingDomain.subaccount_id))
            ? sendingDomain.subaccount_id
            : undefined;
          let verifyAction = verifyMailboxToken;
          let tokenType = SENDING_DOMAIN_TOKEN_TYPE['MAILBOX'];

          if (mailbox === 'abuse') {
            verifyAction = verifyAbuseToken;
            tokenType = SENDING_DOMAIN_TOKEN_TYPE['ABUSE'];
          }

          if (mailbox === 'postmaster') {
            verifyAction = verifyPostmasterToken;
            tokenType = SENDING_DOMAIN_TOKEN_TYPE['POSTMASTER'];
          }

          return verifyAction({ id: domain, token, subaccount }).then(result => {
            if (result[`${tokenType}_status`] !== 'valid') {
              showAlert({ type: 'error', message: `Unable to verify ${domain}` });
            } else {
              showAlert({ type: 'success', message: `${domain} has been verified` });
              history.push(`/domains/details/sending-bounce/${domain}`);
            }
          });
        }
      }

      verifyDomain(queryParams);
    }
  }, [
    domains,
    history,
    isTracking,
    loading,
    queryParams,
    sendingDomainsListError,
    showAlert,
    tokenStatus,
    verifyAbuseToken,
    verifyMailboxToken,
    verifyPostmasterToken,
    verifyTokenError,
  ]);

  return <></>;
}
