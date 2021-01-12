import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Banner, Picture } from 'src/components/matchbox';
import SendingMailWebp from '@sparkpost/matchbox-media/images/Sending-Mail.webp';
import SendingMail from '@sparkpost/matchbox-media/images/Sending-Mail@medium.jpg';
import { updateUserUIOptions } from 'src/actions/currentUser';
import { isUserUiOptionSet } from 'src/helpers/conditions/user';
import { LINKS } from 'src/constants';

export default function InfoBanner() {
  const [dismissed, setDismissed] = useState(
    useSelector(state => isUserUiOptionSet('onboardingV2.trackingDomainsBannerDismissed')(state)),
  );
  const dispatch = useDispatch();
  const handleDismiss = () => {
    setDismissed(true);
    dispatch(updateUserUIOptions({ onboardingV2: { trackingDomainsBannerDismissed: true } }));
  };
  if (dismissed) return null;

  return (
    <Banner
      onDismiss={handleDismiss}
      size="large"
      status="muted"
      title="Tracking Domains"
      backgroundColor="gray.100"
      borderWidth="100"
      borderStyle="solid"
      borderColor="gray.400"
      mb="600"
    >
      <p>
        Tracking domains are used in engagement tracking to report email opens and link clicks.
        Custom tracking domains will replace the domain portion of the URL.
      </p>
      <Banner.Action color="blue" to={LINKS.TRACKING_DOMAIN_DOCS} external variant="outline">
        Tracking Domains Documentation
      </Banner.Action>
      <Banner.Media>
        <Picture seeThrough>
          <source srcSet={SendingMailWebp} type="image/webp" />
          <Picture.Image alt="" src={SendingMail} />
        </Picture>
      </Banner.Media>
    </Banner>
  );
}
