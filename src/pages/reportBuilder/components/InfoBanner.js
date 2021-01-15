import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Banner, Picture } from 'src/components/matchbox';
import AnalyticsJpg from '@sparkpost/matchbox-media/images/Analytics.jpg';
import AnalyticsWebp from '@sparkpost/matchbox-media/images/Analytics.webp';
import { updateUserUIOptions } from 'src/actions/currentUser';
import { isUserUiOptionSet } from 'src/helpers/conditions/user';
import { LINKS } from 'src/constants';

export default function InfoBanner() {
  const [dismissed, setDismissed] = useState(
    useSelector(state => isUserUiOptionSet('onboardingV2.reportBuilderBannerDismissed')(state)),
  );
  const dispatch = useDispatch();
  const handleDismiss = () => {
    setDismissed(true);
    dispatch(updateUserUIOptions({ onboardingV2: { reportBuilderBannerDismissed: true } }));
  };
  if (dismissed) return null;

  return (
    <Banner
      onDismiss={handleDismiss}
      size="large"
      status="muted"
      title="All the Metrics in One Place"
      mb="600"
    >
      <p>
        Build and save custom reports with SparkPost's easy to use dashboard. Apply unlimited
        metrics across delivery and deliverability data. To learn how to unlock the full potential
        of SparkPost's Analytics Report, visit the documentation below.
      </p>
      {/* TODO: Show View Seedlist button when Signals Deliverability is live and the route is available */}
      {/* <Banner.Action color="blue" to="/inbox-placement/seedlist">
        View Seedlist
      </Banner.Action> */}
      <Banner.Action color="blue" to={LINKS.ANALYTICS_DOCS} external variant="outline">
        Analytics Documentation
      </Banner.Action>
      <Banner.Media>
        <Picture seeThrough>
          <Picture.Image alt="" src={AnalyticsJpg}>
            <source srcSet={AnalyticsWebp} type="image/webp"></source>
          </Picture.Image>
        </Picture>
      </Banner.Media>
    </Banner>
  );
}
