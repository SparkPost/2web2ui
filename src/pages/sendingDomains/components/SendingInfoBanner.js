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
    useSelector(state => isUserUiOptionSet('onboardingV2.sendingDomainBannerDismissed')(state)),
  );
  const dispatch = useDispatch();
  const handleDismiss = () => {
    setDismissed(true);
    dispatch(updateUserUIOptions({ onboardingV2: { sendingDomainBannerDismissed: true } }));
  };
  if (dismissed) return null;

  return (
    <Banner
      onDismiss={handleDismiss}
      size="large"
      status="muted"
      title="Sending Domains"
      backgroundColor="gray.100"
      borderWidth="100"
      borderStyle="solid"
      borderColor="gray.400"
      mb="600"
    >
      <p>
        Sending domains are used to indicate who an email is from via the "From" header. DNS records
        can be configured for a sending domain, which allows recipient mail servers to authenticate
        messages sent from SparkPost.
      </p>
      <Banner.Action color="blue" to={LINKS.SENDING_DOMAIN_DOCS} external variant="outline">
        Sending Domains Documentation
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
