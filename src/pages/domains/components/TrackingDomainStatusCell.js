import React from 'react';
import { Bookmark } from '@sparkpost/matchbox-icons';
import { Box, Inline, Tag, Tooltip } from 'src/components/matchbox';
import { TranslatableText } from 'src/components/text';
import useUniqueId from 'src/hooks/useUniqueId';

export default function TrackingDomainStatusCell({ domainStatus }) {
  const { defaultTrackingDomain, unverified, blocked } = domainStatus;
  const tooltipId = useUniqueId('default-tracking-domain');

  if (blocked) return <Tag color="red">Blocked</Tag>;

  if (unverified) return <Tag color="yellow">Unverified</Tag>;

  return (
    <Inline space="100">
      <Tag>
        <Inline space="100">
          <TranslatableText>Tracking</TranslatableText>

          {defaultTrackingDomain && (
            <Box color="green.700">
              <Tooltip content="Default Tracking Domain" id={tooltipId}>
                <div tabIndex="0" data-id="default-tracking-domain-tooltip">
                  <Bookmark />
                </div>
              </Tooltip>
            </Box>
          )}
        </Inline>
      </Tag>
    </Inline>
  );
}
