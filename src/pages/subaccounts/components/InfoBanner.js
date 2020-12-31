import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Banner, Picture } from 'src/components/matchbox';
import ConfigurationWebp from '@sparkpost/matchbox-media/images/Configuration.webp';
import { updateUserUIOptions } from 'src/actions/currentUser';
import { isUserUiOptionSet } from 'src/helpers/conditions/user';
import { LINKS } from 'src/constants';

export default function InfoBanner() {
  const [dismiss, setDismiss] = useState(
    useSelector(state => isUserUiOptionSet('onboardingV2.subaccountsBannerDismissed')(state)),
  );
  const dispatch = useDispatch();
  const handleDismiss = () => {
    setDismiss(true);
    dispatch(updateUserUIOptions({ onboardingV2: { subaccountsBannerDismissed: true } }));
  };
  if (dismiss) return null;

  return (
    <Banner
      onDismiss={handleDismiss}
      size="large"
      status="muted"
      title="Organize Sending and Analytics"
      backgroundColor="gray.100"
      borderWidth="100"
      borderStyle="solid"
      borderColor="gray.400"
      mb="600"
    >
      <p>
        Subaccounts can be used to provision and manage senders separately from each other, and to
        provide assets and reporting data for each of them.
      </p>
      <Banner.Action color="blue" to={LINKS.SUBACCOUNTS} external variant="outline">
        Subaccounts Documentation
      </Banner.Action>
      <Banner.Media>
        <Picture seeThrough>
          <Picture.Image alt="" src={ConfigurationWebp} />
        </Picture>
      </Banner.Media>
    </Banner>
  );
}
