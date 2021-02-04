import React from 'react';
import { Bookmark } from '@sparkpost/matchbox-icons';
import { TranslatableText } from 'src/components/text';
import { Box, Inline, Tag, Tooltip } from 'src/components/matchbox';
import { resolveStatus, resolveReadyFor } from 'src/helpers/domains';
import useUniqueId from 'src/hooks/useUniqueId';

export function SendingDomainStatusCell({ domain }) {
  const tooltipId = useUniqueId('default-bounce-domain');
  const resolvedStatus = resolveStatus(domain.status);
  const readyFor = resolveReadyFor(domain.status);
  const { is_default_bounce_domain, status } = domain;

  if (resolvedStatus === 'blocked') return <Tag color="red">Blocked</Tag>;

  return (
    <Inline space="100">
      {resolvedStatus === 'unverified' && <Tag color="yellow">Failed Verification</Tag>}

      {readyFor?.sending && <Tag>Sending</Tag>}

      {readyFor?.bounce && (
        <Tag>
          <Inline space="100">
            <TranslatableText>Bounce</TranslatableText>

            {is_default_bounce_domain && (
              <Box color="green.700">
                <Tooltip content="Default Bounce Domain" id={tooltipId}>
                  <div tabIndex="0" data-id="default-bounce-domain-tooltip">
                    <Bookmark />
                  </div>
                </Tooltip>
              </Box>
            )}
          </Inline>
        </Tag>
      )}

      {readyFor?.dkim && <Tag color="darkGray">DKIM Signing</Tag>}

      {status?.spf_status === 'valid' && <Tag color="darkGray">SPF Valid</Tag>}
    </Inline>
  );
}
