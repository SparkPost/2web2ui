import React, { useState } from 'react';
import { Banner, Inline, Box, Text } from 'src/components/matchbox';
import { ExternalLink } from 'src/components/links';
import { Rocket } from '@sparkpost/matchbox-icons';

export const DeliverabilityBanner = () => {
  const [bannerOpen, setBannerOpen] = useState(true);

  if (!bannerOpen) {
    return null;
  }

  return (
    <Box padding="500" pb="100">
      <Banner
        data-id="deliverability-metrics-banner"
        status="muted"
        size="small"
        onDismiss={() => setBannerOpen(false)}
      >
        <Inline>
          <Text color="brand.orange">
            <Rocket />
          </Text>
          <Box>
            <span>Gain access to </span>
            <ExternalLink to="https://www.sparkpost.com/features/email-deliverability/">
              deliverability metrics
            </ExternalLink>
          </Box>
        </Inline>
      </Banner>
    </Box>
  );
};
