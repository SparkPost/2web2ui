import React, { Fragment } from 'react';
import { ChevronRight, InfoOutline } from '@sparkpost/matchbox-icons';
import { PageLink } from 'src/components/links';
import { Panel, Tooltip } from 'src/components/matchbox';
import { OGOnlyWrapper } from 'src/components/hibana';
import { LabelledValue, Unit } from 'src/components';
import { hasTestDelivered } from 'src/helpers/abTesting';
import _ from 'lodash';

import OGStyles from './View.module.scss';
import HibanaStyles from './ViewHibana.module.scss';
import useHibanaOverride from 'src/hooks/useHibanaOverride';

export const PercentOrSample = ({ variant }) => {
  if (variant.sample_size) {
    return (
      <LabelledValue label="Sample Size">
        <p>{variant.sample_size.toLocaleString()}</p>
      </LabelledValue>
    );
  }

  if (variant.percent) {
    return (
      <LabelledValue label="Percent">
        <p>
          <Unit unit="percent" value={variant.percent} />
        </p>
      </LabelledValue>
    );
  }

  return null;
};

export const Engagement = ({ variant, showRate }) => {
  const styles = useHibanaOverride(OGStyles, HibanaStyles);
  if (!showRate) {
    return null;
  }

  let metricMarkup = null;

  if (_.isNumber(variant.count_unique_confirmed_opened)) {
    metricMarkup = (
      <span>
        {variant.count_unique_confirmed_opened.toLocaleString()} opens of{' '}
        {variant.count_accepted.toLocaleString()} accepted
      </span>
    );
  }

  if (_.isNumber(variant.count_unique_clicked)) {
    metricMarkup = (
      <span>
        {variant.count_unique_clicked.toLocaleString()} clicks of{' '}
        {variant.count_accepted.toLocaleString()} accepted
      </span>
    );
  }

  return (
    <Panel.LEGACY.Section>
      <LabelledValue label="Engagement Rate Achieved">
        <h6>
          <Tooltip dark content={metricMarkup}>
            <Unit unit="percent" value={variant.engagement_rate * 100} />{' '}
            <span className={styles.InfoIcon}>
              <InfoOutline />
            </span>
          </Tooltip>
        </h6>
      </LabelledValue>
    </Panel.LEGACY.Section>
  );
};

export const Variant = ({ variant = {}, title, showRate }) => {
  const styles = useHibanaOverride(OGStyles, HibanaStyles);
  return (
    <OGOnlyWrapper as={Panel.LEGACY}>
      <Panel.LEGACY.Section
        actions={[
          {
            content: (
              <>
                View Template <ChevronRight />
              </>
            ),
            color: 'orange',
            as: PageLink,
            // BUG: No `setSubaccountQuery(subaccountId)` here
            // Impossible to know if the template is assigned to a subaccount or not because duplicate template IDs are allowed
            // eg { id: 'temp', shared_with_all: true } vs. { id: 'temp', subaccount_id: 101 }
            //    both are usable from the same ab test
            to: `/templates/edit/${variant.template_id}/published`,
          },
        ]}
      >
        {title && <h6 className={styles.SmallHeader}>{title}</h6>}
        <LabelledValue label="Template ID">
          <h6>{variant.template_id}</h6>
        </LabelledValue>
        <PercentOrSample variant={variant} />
      </Panel.LEGACY.Section>
      <Engagement variant={variant} showRate={showRate} />
    </OGOnlyWrapper>
  );
};

const VariantsView = ({ test }) => {
  const showEngagementRate = hasTestDelivered(test);
  return (
    <Fragment>
      <Variant
        variant={test.default_template}
        title="Default Template"
        showRate={showEngagementRate}
      />
      {_.map(test.variants, (variant, i) => (
        <Variant variant={variant} key={i} showRate={showEngagementRate} />
      ))}
    </Fragment>
  );
};

export default VariantsView;
