import React, { useState } from 'react';
import { Banner, Inline, Box, UnstyledLink } from 'src/components/matchbox';
import { Rocket } from '@sparkpost/matchbox-icons';

import { useSelector } from 'react-redux';
import { isAccountUiOptionSet } from 'src/helpers/conditions/account';

export const DeliverabilityBanner = () => {
  const [bannerOpen, setBannerOpen] = useState(true);

  const isDeliverabilityEnabled = useSelector(isAccountUiOptionSet('allow_deliverability_metrics'));

  if (!bannerOpen || !isDeliverabilityEnabled) {
    return null;
  }

  return (
    <Box padding="500" pb="100">
      <Banner status="muted" size="small" onDismiss={() => setBannerOpen(false)}>
        <Inline>
          <Box color="brand.orange">
            <Rocket />
          </Box>
          <Box>
            <span>Gain access to </span>
            <UnstyledLink>deliverability metrics</UnstyledLink>
          </Box>
        </Inline>
      </Banner>
    </Box>
  );
};
