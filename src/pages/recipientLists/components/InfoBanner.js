import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Banner, Picture } from 'src/components/matchbox';
import MailWebp from '@sparkpost/matchbox-media/images/Sending-Mail.webp';
import { updateUserUIOptions } from 'src/actions/currentUser';
import { isUserUiOptionSet } from 'src/helpers/conditions/user';
import { LINKS } from 'src/constants';

export default function InfoBanner() {
  const [dismiss, setDismiss] = useState(
    useSelector(state => isUserUiOptionSet('onboardingV2.recipientListsBannerDismissed')(state)),
  );
  const dispatch = useDispatch();
  const handleDismiss = () => {
    setDismiss(true);
    dispatch(updateUserUIOptions({ onboardingV2: { recipientListsBannerDismissed: true } }));
  };
  if (dismiss) return null;

  return (
    <Banner
      onDismiss={handleDismiss}
      size="large"
      status="muted"
      title="Organize Recipients"
      backgroundColor="gray.100"
      borderWidth="100"
      borderStyle="solid"
      borderColor="gray.400"
      mb="600"
    >
      <p>
        A recipient list is a collection of recipients that can be used in a transmission. When
        sending email to multiple recipients, it’s best to put them in a recipient list. This is
        particularly true when sending multiple emails to the same recipients.
      </p>
      <Banner.Action color="blue" to={LINKS.RECIP_DOCS} external variant="outline">
        Recipient Lists Documentation
      </Banner.Action>
      <Banner.Media>
        <Picture seeThrough>
          <Picture.Image alt="" src={MailWebp} />
        </Picture>
      </Banner.Media>
    </Banner>
  );
}
