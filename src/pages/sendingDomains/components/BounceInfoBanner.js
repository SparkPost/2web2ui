import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Banner, Picture } from 'src/components/matchbox';
import EmailTemplateWebp from '@sparkpost/matchbox-media/images/Email-Template.webp';
import { updateUserUIOptions } from 'src/actions/currentUser';
import { isUserUiOptionSet } from 'src/helpers/conditions/user';
import { LINKS } from 'src/constants';

export default function InfoBanner() {
  const [dismissed, setDismissed] = useState(
    useSelector(state => isUserUiOptionSet('onboardingV2.snippetsBannerDismissed')(state)),
  );
  const dispatch = useDispatch();
  const handleDismiss = () => {
    setDismissed(true);
    dispatch(updateUserUIOptions({ onboardingV2: { snippetsBannerDismissed: true } }));
  };
  if (dismissed) return null;

  return (
    <Banner
      onDismiss={handleDismiss}
      size="large"
      status="muted"
      title="Consistent Content, Easy"
      backgroundColor="gray.100"
      borderWidth="100"
      borderStyle="solid"
      borderColor="gray.400"
      mb="600"
    >
      <p>
        Custom bounce domains override the default Return-Path value, also known as the envelope
        FROM value, which denotes the destination for out-of-band bounces.
      </p>

      {/* TODO: Update action... and everything in this file basically */}
      <Banner.Action color="blue" to={LINKS.SNIPPETS_DOCS} external variant="outline">
        Snippets Documentation
      </Banner.Action>
      <Banner.Media>
        <Picture seeThrough>
          <Picture.Image alt="" src={EmailTemplateWebp} />
        </Picture>
      </Banner.Media>
    </Banner>
  );
}
